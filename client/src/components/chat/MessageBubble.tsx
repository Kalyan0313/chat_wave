import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Link,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
} from '@mui/icons-material';
import { formatFileSize, getFileType } from '../../services/fileUpload';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwn, 
  showAvatar = true 
}) => {
  const getFileIcon = (messageType: string) => {
    switch (messageType) {
      case 'image':
        return <ImageIcon />;
      case 'audio':
        return <AudioIcon />;
      case 'video':
        return <VideoIcon />;
      default:
        return <FileIcon />;
    }
  };

  const handleDownload = () => {
    if (message.fileUrl) {
      const link = document.createElement('a');
      link.href = message.fileUrl;
      link.download = message.fileName || 'download';
      link.click();
    }
  };

  const renderMessageContent = () => {
    if (message.messageType === 'image' && message.fileUrl) {
      return (
        <Box sx={{ maxWidth: 300, minWidth: 0 }}>
          <img
            src={message.fileUrl}
            alt={message.content || 'Image'}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 8,
              cursor: 'pointer',
            }}
            onClick={handleDownload}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {message.content && (
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap'
              }}
            >
              {message.content}
            </Typography>
          )}
        </Box>
      );
    }

    if (message.messageType === 'file' && message.fileUrl) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            {getFileIcon(message.messageType)}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '100%'
                }}
              >
                {message.fileName || 'File'}
              </Typography>
              {message.fileSize && (
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(message.fileSize)}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton size="small" onClick={handleDownload} sx={{ flexShrink: 0 }}>
            <DownloadIcon />
          </IconButton>
        </Box>
      );
    }

    // Text message
    return (
      <Typography 
        variant="body2" 
        sx={{ 
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          hyphens: 'auto',
          maxWidth: '100%',
          minWidth: 0
        }}
      >
        {message.content}
      </Typography>
    );
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          bgcolor: isOwn ? 'primary.main' : 'background.paper',
          color: isOwn ? 'white' : 'text.primary',
          border: isOwn ? 'none' : '1px solid',
          borderColor: 'grey.200',
          boxShadow: isOwn 
            ? '0 2px 8px rgba(99, 102, 241, 0.3)' 
            : '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          wordWrap: 'break-word',
          minWidth: 0
        }}
      >
        {renderMessageContent()}
      </Paper>

      <Box
        sx={{
          display: 'flex',
          justifyContent: isOwn ? 'flex-end' : 'flex-start',
          alignItems: 'center',
          gap: 0.5,
          mt: 0.5,
          px: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {formatTime(message.createdAt)}
        </Typography>
        
        {isOwn && (
          <Chip
            size="small"
            label={message.readBy?.length > 1 ? 'Read' : 'Sent'}
            sx={{
              height: 16,
              fontSize: '0.7rem',
              bgcolor: message.readBy?.length > 1 ? 'success.light' : 'grey.300',
              color: message.readBy?.length > 1 ? 'success.contrastText' : 'grey.600',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default MessageBubble;

