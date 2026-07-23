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
              (e.currentTarget as HTMLImageElement).style.display = 'none';
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        width: '100%',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: '8px 14px 6px 14px',
          borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          backgroundImage: isOwn
            ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
            : 'none',
          backgroundColor: isOwn ? '#7c3aed' : '#ffffff',
          color: isOwn ? '#ffffff' : '#0f172a',
          boxShadow: isOwn
            ? '0 3px 12px rgba(124, 58, 237, 0.22)'
            : '0 2px 8px rgba(15, 23, 42, 0.06)',
          border: isOwn ? 'none' : '1px solid rgba(226, 232, 240, 0.9)',
          maxWidth: '100%',
          position: 'relative',
          wordBreak: 'break-word',
          overflow: 'hidden',
        }}
      >
        {/* Message Content */}
        {renderMessageContent()}

        {/* Telegram Web Embedded Time & Read Status */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.4,
            float: 'right',
            ml: 2,
            mt: 0.4,
            mb: -0.1,
            userSelect: 'none',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.675rem',
              color: isOwn ? 'rgba(255, 255, 255, 0.75)' : '#94a3b8',
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            {formatTime(message.createdAt)}
          </Typography>

          {isOwn && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.725rem',
                fontWeight: 700,
                color: message.readBy?.length > 1 ? '#4ade80' : 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1,
                ml: 0.2,
              }}
            >
              {message.readBy?.length > 1 ? '✓✓' : '✓'}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default MessageBubble;

