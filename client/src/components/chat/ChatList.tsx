import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCurrentChat, createChat } from '../../store/slices/chatSlice';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Group as GroupIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import CreateGroupDialog from './CreateGroupDialog';
import SearchDialog from './SearchDialog';

interface ChatListProps {
  onChatSelect?: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onChatSelect }) => {
  const dispatch = useAppDispatch();
  const { chats, users, onlineUsers, currentChat } = useAppSelector((state) => state.chat);
  const { user } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const isUserOnline = (userId: string) => {
    // Check if current user has disabled showing online status
    const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
    if (settings.onlineStatus === false) {
      return false; // Don't show online status if user has disabled it
    }
    
    return onlineUsers.some(u => u._id === userId && u.status === 'online');
  };

  const getOtherUser = (chat: any) => {
    if (chat.isGroupChat) {
      return null;
    }
    return chat.users.find((u: any) => u._id !== user?._id);
  };

  const getChatName = (chat: any) => {
    if (chat.isGroupChat) {
      return chat.chatName;
    }
    const otherUser = getOtherUser(chat);
    return otherUser?.name || 'Unknown User';
  };

  const getChatAvatar = (chat: any) => {
    if (chat.isGroupChat) {
      return '';
    }
    const otherUser = getOtherUser(chat);
    return otherUser?.profile_img || '';
  };

  const getLastMessagePreview = (chat: any) => {
    if (!chat.latestMessage) {
      return 'No messages yet';
    }
    
    const message = chat.latestMessage;
    const isOwnMessage = message.sender._id === user?._id;
    const prefix = isOwnMessage ? 'You: ' : '';
    
    if (message.messageType === 'text') {
      return `${prefix}${message.content}`;
    } else if (message.messageType === 'image') {
      return `${prefix}📷 Image`;
    } else if (message.messageType === 'file') {
      return `${prefix}📎 ${message.fileName}`;
    } else if (message.messageType === 'audio') {
      return `${prefix}🎵 Audio`;
    }
    
    return `${prefix}${message.content}`;
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return new Date(dateString).toLocaleDateString([], { weekday: 'short' });
    } else {
      return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getUnreadCount = (chat: any) => {
    if (!chat.unreadCount || !user) return 0;
    return chat.unreadCount[user._id] || 0;
  };

  const handleChatSelect = (chat: any) => {
    dispatch(setCurrentChat(chat));
    if (onChatSelect) {
      onChatSelect();
    }
  };

  const handleCreateChat = async (userId: string) => {
    try {
      const result = await dispatch(createChat(userId));
      if (createChat.fulfilled.match(result)) {
        dispatch(setCurrentChat(result.payload));
        setShowNewChat(false);
        if (onChatSelect) {
          onChatSelect();
        }
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const filteredChats = chats.filter(chat => {
    const chatName = getChatName(chat);
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredUsers = users
    .filter(u => u._id !== user?._id)
    .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Modern Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid', 
        borderColor: 'grey.200',
        bgcolor: 'background.paper',
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 2.5 
        }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontSize: '1.25rem' }}>
            Messages
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="New Group">
              <IconButton 
                size="small"
                onClick={() => setShowCreateGroup(true)}
                sx={{
                  bgcolor: 'grey.100',
                  '&:hover': { bgcolor: 'grey.200' }
                }}
              >
                <GroupIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="New Chat">
              <IconButton 
                size="small"
                onClick={() => setShowNewChat(!showNewChat)}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Search">
              <IconButton 
                size="small"
                onClick={() => setShowSearch(true)}
                sx={{
                  bgcolor: 'grey.100',
                  '&:hover': { bgcolor: 'grey.200' }
                }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'grey.50',
              '&:hover': {
                bgcolor: 'grey.100',
              },
              '&.Mui-focused': {
                bgcolor: 'background.paper',
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Chat List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {showNewChat ? (
          // New Chat Section
          <Box>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Start New Chat
              </Typography>
            </Box>
            <List>
              {filteredUsers.map((userItem) => (
                <ListItemButton
                  key={userItem._id}
                  onClick={() => handleCreateChat(userItem._id)}
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' },
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={userItem.profile_img} alt={userItem.name}>
                      {userItem.name?.[0] || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {userItem.name}
                        </Typography>
                        <Chip
                          label={isUserOnline(userItem._id) ? 'Online' : 'Offline'}
                          size="small"
                          color={isUserOnline(userItem._id) ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={userItem.email}
                  />
                  <AddIcon color="primary" />
                </ListItemButton>
              ))}
            </List>
          </Box>
        ) : (
          // Existing Chats
          <List>
            {filteredChats.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {searchQuery ? 'No chats found' : 'No conversations yet'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {searchQuery ? 'Try a different search term' : 'Start a new chat to begin messaging'}
                </Typography>
                {!searchQuery && (
                  <Typography 
                    variant="caption" 
                    color="primary" 
                    sx={{ 
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      '&:hover': { textDecoration: 'none' }
                    }}
                    onClick={() => setShowNewChat(true)}
                  >
                    Click here to start a new chat
                  </Typography>
                )}
              </Box>
            ) : (
              filteredChats.map((chat) => {
                const otherUser = getOtherUser(chat);
                const unreadCount = getUnreadCount(chat);
                
                return (
                  <ListItemButton
                    key={chat._id}
                    selected={currentChat?._id === chat._id}
                    onClick={() => handleChatSelect(chat)}
                    sx={{
                      borderRadius: 3,
                      mx: 1,
                      my: 0.5,
                      px: 2,
                      py: 1.25,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': { 
                        bgcolor: 'rgba(241, 245, 249, 0.8)',
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(124, 58, 237, 0.12)',
                        borderLeft: '4px solid #7c3aed',
                        '&:hover': {
                          bgcolor: 'rgba(124, 58, 237, 0.16)',
                        },
                        '& .MuiListItemText-primary': {
                          color: '#0f172a',
                          fontWeight: 700,
                        },
                        '& .MuiListItemText-secondary': {
                          color: '#64748b',
                        },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          !chat.isGroupChat && otherUser && isUserOnline(otherUser._id) ? (
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: 'success.main',
                                border: 2,
                                borderColor: 'background.paper',
                              }}
                            />
                          ) : null
                        }
                      >
                        <Avatar
                          src={getChatAvatar(chat)}
                          alt={getChatName(chat)}
                        >
                          {chat.isGroupChat ? <GroupIcon /> : (getChatName(chat)?.[0] || 'C')}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          noWrap
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                          <span style={{ flexGrow: 1, marginRight: 8 }}>
                            {getChatName(chat)}
                          </span>
                          {chat.latestMessage && (
                            <Typography variant="caption" color="text.secondary" component="span">
                              {formatLastMessageTime(chat.latestMessage.createdAt)}
                            </Typography>
                          )}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                          <span style={{ flexGrow: 1, marginRight: 8 }}>
                            {getLastMessagePreview(chat)}
                          </span>
                          {unreadCount > 0 && (
                            <Chip
                              label={unreadCount}
                              size="small"
                              color="primary"
                              sx={{ minWidth: 20, height: 20, fontSize: '0.75rem' }}
                            />
                          )}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                );
              })
            )}
          </List>
        )}
      </Box>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
      />

      {/* Search Dialog */}
      <SearchDialog
        open={showSearch}
        onClose={() => setShowSearch(false)}
        onChatSelect={(chatId) => {
          const chat = chats.find(c => c._id === chatId);
          if (chat) {
            dispatch(setCurrentChat(chat));
            onChatSelect?.();
          }
        }}
      />
    </Box>
  );
};

export default ChatList;

