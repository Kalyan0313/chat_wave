import React, { useEffect, useRef } from 'react';
import { useAppSelector } from '../../store/hooks';
import { Message } from '../../types';
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  Avatar,
} from '@mui/material';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, loading }) => {
  const { user } = useAppSelector((state) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE HH:mm');
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE');
    } else {
      return format(date, 'MMMM dd, yyyy');
    }
  };

  const shouldShowDateHeader = (currentMessage: Message, previousMessage: Message | null) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt);
    const previousDate = new Date(previousMessage.createdAt);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  const shouldShowAvatar = (currentMessage: Message, nextMessage: Message | null) => {
    if (!nextMessage || !nextMessage.sender || !currentMessage.sender) return true;
    
    return (
      currentMessage.sender._id !== nextMessage.sender._id ||
      new Date(nextMessage.createdAt).getTime() - new Date(currentMessage.createdAt).getTime() > 5 * 60 * 1000 // 5 minutes
    );
  };

  const isConsecutiveMessage = (currentMessage: Message, previousMessage: Message | null) => {
    if (!previousMessage || !previousMessage.sender || !currentMessage.sender) return false;
    
    return (
      currentMessage.sender._id === previousMessage.sender._id &&
      new Date(currentMessage.createdAt).getTime() - new Date(previousMessage.createdAt).getTime() <= 5 * 60 * 1000 // 5 minutes
    );
  };

  if (loading && messages.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (messages.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No messages yet
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Start the conversation by sending a message below
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'auto',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
        const isOwnMessage = message.sender?._id === user?._id;
        const showDateHeader = shouldShowDateHeader(message, previousMessage);
        const showAvatar = shouldShowAvatar(message, nextMessage);
        const isConsecutive = isConsecutiveMessage(message, previousMessage);

        return (
          <React.Fragment key={message._id}>
            {showDateHeader && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: 'background.paper',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  {formatDateHeader(message.createdAt)}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                display: 'flex',
                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                mb: isConsecutive ? 0.5 : { xs: 1, sm: 2 },
                px: { xs: 0.5, sm: 1 },
              }}
            >
              {!isOwnMessage && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mr: 1,
                    minWidth: 40,
                  }}
                >
                  {showAvatar ? (
                    <Avatar
                      src={message.sender?.profile_img}
                      alt={message.sender?.name}
                      sx={{ width: 32, height: 32 }}
                    >
                      {message.sender?.name?.[0]}
                    </Avatar>
                  ) : (
                    <Box sx={{ width: 32, height: 32 }} />
                  )}
                </Box>
              )}

              <Box
                sx={{
                  maxWidth: { xs: '85%', sm: '70%' },
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                  overflow: 'hidden',
                }}
              >
                {!isOwnMessage && !isConsecutive && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 0.5, px: 1 }}
                  >
                    {message.sender.name}
                  </Typography>
                )}

                <MessageBubble
                  message={message}
                  isOwn={isOwnMessage}
                  showAvatar={showAvatar}
                />

              </Box>

              {isOwnMessage && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    ml: 1,
                    minWidth: 40,
                  }}
                >
                  {showAvatar ? (
                    <Avatar
                      src={user?.profile_img}
                      alt={user?.name}
                      sx={{ width: 32, height: 32 }}
                    >
                      {user?.name?.[0]}
                    </Avatar>
                  ) : (
                    <Box sx={{ width: 32, height: 32 }} />
                  )}
                </Box>
              )}
            </Box>
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessageList;

