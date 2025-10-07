import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Message as MessageIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { messageAPI, userAPI } from '../../services/api';
import { Message, User } from '../../types';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  onChatSelect?: (chatId: string) => void;
}

interface SearchResult {
  messages: Message[];
  users: User[];
}

const SearchDialog: React.FC<SearchDialogProps> = ({ 
  open, 
  onClose, 
  onChatSelect 
}) => {
  const dispatch = useAppDispatch();
  const { chats, currentChat } = useAppSelector((state) => state.chat);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult>({ messages: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Search messages when query changes
  useEffect(() => {
    const searchMessages = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults({ messages: [], users: [] });
        return;
      }

      setLoading(true);
      try {
        // Search messages - search in current chat if available, otherwise search all chats
        const response = await messageAPI.searchMessages(searchQuery, currentChat?._id);
        if (response.data.status) {
          setSearchResults(prev => ({
            ...prev,
            messages: response.data.messages
          }));
        }

        // Search users using API
        try {
          const userResponse = await userAPI.searchUsers(searchQuery);
          if (userResponse.data.status) {
            setSearchResults(prev => ({
              ...prev,
              users: userResponse.data.users
            }));
          }
        } catch (userError) {
          console.error('User search error:', userError);
          // Fallback to client-side search if API fails
          const matchingUsers = chats
            .flatMap(chat => chat.users)
            .filter(user => 
              user._id !== currentUser?._id &&
              user.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .filter((user, index, self) => 
              index === self.findIndex(u => u._id === user._id)
            );

          setSearchResults(prev => ({
            ...prev,
            users: matchingUsers
          }));
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchMessages, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentChat, chats, currentUser]);

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults({ messages: [], users: [] });
    setActiveTab(0);
    onClose();
  };

  const handleMessageClick = (message: Message) => {
    if (onChatSelect && message.chat) {
      const chatId = typeof message.chat === 'string' ? message.chat : message.chat._id;
      onChatSelect(chatId);
      handleClose();
    }
  };

  const handleUserClick = (user: User) => {
    // Find or create chat with this user
    const existingChat = chats.find(chat => 
      !chat.isGroupChat && 
      chat.users.some(u => u._id === user._id)
    );

    if (existingChat && onChatSelect) {
      onChatSelect(existingChat._id);
      handleClose();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: '#ffeb3b', fontWeight: 'bold' }}>
          {part}
        </span>
      ) : part
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 500 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Search</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Search Input */}
          <TextField
            fullWidth
            placeholder="Search messages and users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            autoFocus
          />

          {/* Search Results */}
          {searchQuery.trim().length >= 2 && (
            <Box>
              <Tabs 
                value={activeTab} 
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab 
                  label={`Messages (${searchResults.messages.length})`} 
                  icon={<MessageIcon />}
                />
                <Tab 
                  label={`Users (${searchResults.users.length})`} 
                  icon={<PersonIcon />}
                />
              </Tabs>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* Messages Tab */}
                  {activeTab === 0 && (
                    <Box>
                      {searchResults.messages.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                          No messages found
                        </Typography>
                      ) : (
                        <List>
                          {searchResults.messages.map((message) => (
                            <ListItem
                              key={message._id}
                              button
                              onClick={() => handleMessageClick(message)}
                              sx={{ borderRadius: 1, mb: 0.5 }}
                            >
                              <ListItemAvatar>
                                <Avatar src={message.sender?.profile_img} alt={message.sender?.name}>
                                  {message.sender?.name?.[0]}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box>
                                    <Typography variant="subtitle2">
                                      {message.sender?.name}
                                    </Typography>
                                    <Typography variant="body2">
                                      {highlightText(message.content, searchQuery)}
                                    </Typography>
                                  </Box>
                                }
                                secondary={formatMessageTime(message.createdAt)}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  )}

                  {/* Users Tab */}
                  {activeTab === 1 && (
                    <Box>
                      {searchResults.users.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                          No users found
                        </Typography>
                      ) : (
                        <List>
                          {searchResults.users.map((user) => (
                            <ListItem
                              key={user._id}
                              button
                              onClick={() => handleUserClick(user)}
                              sx={{ borderRadius: 1, mb: 0.5 }}
                            >
                              <ListItemAvatar>
                                <Avatar src={user.profile_img} alt={user.name}>
                                  {user.name[0]}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={highlightText(user.name, searchQuery)}
                                secondary={user.email}
                              />
                              {(() => {
                                // Check if current user has disabled showing online status
                                const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
                                if (settings.onlineStatus === false) {
                                  return null; // Don't show online status if user has disabled it
                                }
                                
                                return (
                                  <Chip
                                    label={user.status === 'online' ? 'Online' : 'Offline'}
                                    size="small"
                                    color={user.status === 'online' ? 'success' : 'default'}
                                  />
                                );
                              })()}
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}

          {/* No Search Query */}
          {searchQuery.trim().length < 2 && (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Search Messages & Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Type at least 2 characters to start searching
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;

