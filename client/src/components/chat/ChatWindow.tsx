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
  Button,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Menu as MenuIcon,
  LockOutlined as LockIcon,
  Bolt as BoltIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { ChatWaveLogo } from '../layout/ChatWaveLogo';

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
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f5f3ff',
          backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(248, 246, 255, 0.4) 0%, rgba(237, 233, 254, 0.7) 100%), url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%237c3aed' stroke-width='1.5' stroke-opacity='0.12' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='20' y='20' width='22' height='36' rx='5'/%3E%3Ccircle cx='31' cy='48' r='2.5' fill='%237c3aed' fill-opacity='0.12'/%3E%3Cpath d='M110 24 c0-6 5-11 11-11 h22 c6 0 11 5 11 11 v14 c0 6-5 11-11 11 h-7 l-9 7 v-7 h-6 c-6 0-11-5-11-11 z'/%3E%3Cpath d='M20 115 l35-18 l-12 28 l6-12 l12 6 z'/%3E%3Cpath d='M115 115 h26 a4 4 0 0 0 4-4 v-16 a4 4 0 0 0-4-4 h-5 l-3-4 h-10 l-3 4 h-5 a4 4 0 0 0-4 4 v16 a4 4 0 0 0 4 4 z'/%3E%3Ccircle cx='128' cy='103' r='5'/%3E%3Cpath d='M75 25 v-18 h16 v18 M75 14 h16'/%3E%3Ccircle cx='70' cy='25' r='5' fill='%237c3aed' fill-opacity='0.12'/%3E%3Ccircle cx='86' cy='25' r='5' fill='%237c3aed' fill-opacity='0.12'/%3E%3Cpath d='M75 115 a6 6 0 0 1 8 0 a6 6 0 0 1 8 0 l-8 10 z'/%3E%3Cpath d='M75 70 l2 5 h5 l-4 3 l2 5 l-5-3 l-5 3 l2-5 l-4-3 h5 z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px 180px',
        }}
      >
        {/* Mobile top header when no chat selected */}
        <Box
          sx={{
            p: 2,
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            gap: 2,
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <IconButton onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
          <ChatWaveLogo size="small" color="#7c3aed" textColor="#0f172a" />
        </Box>

        {/* Telegram Web style floating glass card */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 5 },
              borderRadius: '28px',
              textAlign: 'center',
              maxWidth: 440,
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 24px 60px rgba(124, 58, 237, 0.12), 0 4px 16px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Glowing Icon Wrapper */}
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(168, 85, 247, 0.2) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.15)',
              }}
            >
              <ChatWaveLogo size="medium" color="#7c3aed" textColor="#0f172a" showText={false} />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                mb: 1,
                fontSize: { xs: '1.25rem', sm: '1.4rem' },
                letterSpacing: '-0.02em',
              }}
            >
              Select a Chat to Start
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                lineHeight: 1.6,
                fontSize: '0.925rem',
              }}
            >
              Choose a conversation from the sidebar to send messages, files, and voice notes instantly.
            </Typography>
          </Paper>
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

      {/* Messages Area with Telegram Web Signature SVG Line Art Doodle Wallpaper */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          backgroundColor: '#f5f3ff',
          backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(248, 246, 255, 0.4) 0%, rgba(237, 233, 254, 0.7) 100%), url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%237c3aed' stroke-width='1.5' stroke-opacity='0.12' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='20' y='20' width='22' height='36' rx='5'/%3E%3Ccircle cx='31' cy='48' r='2.5' fill='%237c3aed' fill-opacity='0.12'/%3E%3Cpath d='M110 24 c0-6 5-11 11-11 h22 c6 0 11 5 11 11 v14 c0 6-5 11-11 11 h-7 l-9 7 v-7 h-6 c-6 0-11-5-11-11 z'/%3E%3Cpath d='M20 115 l35-18 l-12 28 l6-12 l12 6 z'/%3E%3Cpath d='M115 115 h26 a4 4 0 0 0 4-4 v-16 a4 4 0 0 0-4-4 h-5 l-3-4 h-10 l-3 4 h-5 a4 4 0 0 0-4 4 v16 a4 4 0 0 0 4 4 z'/%3E%3Ccircle cx='128' cy='103' r='5'/%3E%3Cpath d='M75 25 v-18 h16 v18 M75 14 h16'/%3E%3Ccircle cx='70' cy='25' r='5' fill='%237c3aed' fill-opacity='0.12'/%3E%3Ccircle cx='86' cy='25' r='5' fill='%237c3aed' fill-opacity='0.12'/%3E%3Cpath d='M75 115 a6 6 0 0 1 8 0 a6 6 0 0 1 8 0 l-8 10 z'/%3E%3Cpath d='M75 70 l2 5 h5 l-4 3 l2 5 l-5-3 l-5 3 l2-5 l-4-3 h5 z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px 180px',
        }}
      >
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

      {/* Message Input Container */}
      <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'rgba(255, 255, 255, 0.95)', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <Box sx={{ maxWidth: 860, mx: 'auto', width: '100%' }}>
          <MessageInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            disabled={loading}
          />
        </Box>
      </Box>

    </Box>
  );
};

export default ChatWindow;

