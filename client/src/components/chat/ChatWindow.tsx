import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  loadMessages, 
  setCurrentChat,
  addTypingUser,
  removeTypingUser,
  clearMessages
} from '../../store/slices/chatSlice';
import { joinChat, leaveChat, startTyping, stopTyping, sendSocketMessage, emitUserOnline } from '../../services/socketRedux';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  onBack?: () => void;
  onMenuClick?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onBack, onMenuClick }) => {
  const dispatch = useAppDispatch();
  const { currentChat, messages, loading, typingUsers } = useAppSelector((state) => state.chat);
  const { user } = useAppSelector((state) => state.auth);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages when chat changes
  useEffect(() => {
    if (currentChat) {
      dispatch(loadMessages(currentChat._id));
      joinChat(currentChat._id);
    } else {
      dispatch(clearMessages());
    }

    return () => {
      if (currentChat) {
        leaveChat(currentChat._id);
      }
    };
  }, [currentChat, dispatch]);

  // Emit online status when component mounts
  useEffect(() => {
    emitUserOnline();
  }, []);


  const handleSendMessage = async (content: string, fileData?: { fileUrl: string; fileName: string; fileSize: number; messageType: string }) => {
    if (!currentChat || (!content.trim() && !fileData)) return;

    // Stop typing indicator
    if (isTyping) {
      stopTyping(currentChat._id);
      setIsTyping(false);
    }

    try {
      const messageData = {
        chatId: currentChat._id,
        content: content.trim(),
        ...(fileData && {
          messageType: fileData.messageType,
          fileUrl: fileData.fileUrl,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
        })
      };
      
      // Send message via socket for real-time delivery and persistence
      sendSocketMessage(messageData);
    } catch (error) {
      // Error handling for message sending
    }
  };



  const handleTyping = (isUserTyping: boolean) => {
    if (!currentChat) return;

    if (isUserTyping && !isTyping) {
      setIsTyping(true);
      startTyping(currentChat._id);
    } else if (!isUserTyping && isTyping) {
      setIsTyping(false);
      stopTyping(currentChat._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    if (isUserTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        stopTyping(currentChat._id);
      }, 3000);
    }
  };

  const getOtherUser = () => {
    if (!currentChat || currentChat.isGroupChat) return null;
    return currentChat.users.find(u => u._id !== user?._id);
  };

  const getChatName = () => {
    if (!currentChat) return '';
    if (currentChat.isGroupChat) return currentChat.chatName;
    const otherUser = getOtherUser();
    return otherUser?.name || 'Unknown User';
  };

  const getChatAvatar = () => {
    if (!currentChat) return '';
    if (currentChat.isGroupChat) return '';
    const otherUser = getOtherUser();
    return otherUser?.profile_img || '';
  };

  const getOnlineStatus = () => {
    if (!currentChat || currentChat.isGroupChat) return null;
    
    // Check if current user has disabled showing online status
    const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
    if (settings.onlineStatus === false) {
      return null; // Don't show online status if user has disabled it
    }
    
    const otherUser = getOtherUser();
    return otherUser?.status === 'online';
  };

  const getTypingText = () => {
    if (typingUsers.length === 0) return '';
    
    const typingUserNames = typingUsers.map(typingUser => {
      const user = currentChat?.users.find(u => u._id === typingUser.userId);
      return user?.name || typingUser.userName || 'Someone';
    });

    if (typingUserNames.length === 1) {
      return `${typingUserNames[0]} is typing...`;
    } else if (typingUserNames.length === 2) {
      return `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`;
    } else {
      return `${typingUserNames[0]} and ${typingUserNames.length - 1} others are typing...`;
    }
  };


  if (!currentChat) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header for when no chat is selected */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderRadius: 0,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {/* Mobile menu button */}
          <IconButton 
            onClick={onMenuClick} 
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" color="text.secondary">
              Chat Wave
            </Typography>
          </Box>
        </Paper>

        {/* Empty state */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Select a chat to start messaging
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Choose a conversation from the sidebar to begin chatting
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Modern Chat Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          bgcolor: 'background.paper',
        }}
      >
        {/* Mobile menu/back button */}
        <IconButton 
          onClick={onBack || onMenuClick} 
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {onBack ? <ArrowBackIcon /> : <MenuIcon />}
        </IconButton>
        
        <Avatar
          src={getChatAvatar()}
          alt={getChatName()}
          sx={{ width: 40, height: 40 }}
        >
          {getChatName()[0]}
        </Avatar>
        
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography 
            variant="h6" 
            noWrap
            sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 700,
              color: 'text.primary'
            }}
          >
            {getChatName()}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            flexWrap: 'wrap',
            mt: 0.5
          }}>
            {getOnlineStatus() !== null && (
              <Chip
                label={getOnlineStatus() ? 'Online' : 'Offline'}
                size="small"
                color={getOnlineStatus() ? 'success' : 'default'}
                variant="outlined"
                sx={{ 
                  height: 24, 
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  display: { xs: 'none', sm: 'flex' }
                }}
              />
            )}
            {currentChat.isGroupChat && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                {currentChat.users.length} members
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, sm: 1 },
          '& .MuiIconButton-root': {
            padding: { xs: '6px', sm: '8px' }
          }
        }}>
          {/* Audio/Video Call and More Options - Commented out for now */}
          {/* <Tooltip title="Voice Call">
            <IconButton size="small" sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <CallIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Video Call">
            <IconButton size="small" sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <VideocamIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="More options">
            <IconButton 
              size="small"
              onClick={() => setShowGroupManagement(true)}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip> */}
        </Box>
      </Box>

      {/* Messages Area */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <MessageList messages={messages} loading={loading} />
      </Box>

      {/* Typing Indicator */}
      {getTypingText() && (
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {getTypingText()}
          </Typography>
        </Box>
      )}

      <Divider />

      {/* Message Input */}
      <Box sx={{ p: 2 }}>
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          disabled={loading}
        />
      </Box>

    </Box>
  );
};

export default ChatWindow;

