import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import EmojiPicker from './EmojiPicker';
import FilePreview from './FilePreview';
import { uploadFile, uploadImage } from '../../services/fileUpload';

interface MessageInputProps {
  onSendMessage: (content: string, fileData?: { fileUrl: string; fileName: string; fileSize: number; messageType: string }) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      onTyping(false);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 2 seconds of inactivity
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if ((message.trim() || selectedFile) && !disabled && !isUploading) {
      let fileData = undefined;

      if (selectedFile) {
        setIsUploading(true);
        try {
          const uploadResult = selectedFile.type.startsWith('image/') 
            ? await uploadImage(selectedFile)
            : await uploadFile(selectedFile);

          if (uploadResult.success && uploadResult.fileUrl) {
            fileData = {
              fileUrl: uploadResult.fileUrl,
              fileName: uploadResult.fileName || selectedFile.name,
              fileSize: uploadResult.fileSize || selectedFile.size,
              messageType: selectedFile.type.startsWith('image/') ? 'image' : 'file',
            };
          } else {
            console.error('File upload failed:', uploadResult.error);
            return;
          }
        } catch (error) {
          console.error('File upload error:', error);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      onSendMessage(message.trim(), fileData);
      setMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* File Preview */}
      {selectedFile && (
        <FilePreview file={selectedFile} onRemove={handleRemoveFile} />
      )}

      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: '6px 10px',
          gap: 1,
          borderRadius: '24px',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
          transition: 'all 0.2s ease-in-out',
          '&:focus-within': {
            borderColor: '#7c3aed',
            boxShadow: '0 8px 30px rgba(124, 58, 237, 0.16)',
          }
        }}
      >
      {/* Attachment Button */}
      <Tooltip title="Attach file">
        <IconButton
          size="small"
          disabled={disabled}
          component="label"
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'grey.100',
              color: 'primary.main'
            }
          }}
        >
          <AttachFileIcon />
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt,.zip,.rar"
          />
        </IconButton>
      </Tooltip>

      {/* Image Button */}
      <Tooltip title="Send image">
        <IconButton
          size="small"
          disabled={disabled}
          component="label"
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'grey.100',
              color: 'primary.main'
            }
          }}
        >
          <ImageIcon />
          <input
            type="file"
            hidden
            onChange={handleImageUpload}
            accept="image/*"
          />
        </IconButton>
      </Tooltip>

      {/* Emoji Picker */}
      <EmojiPicker onEmojiSelect={handleEmojiSelect} disabled={disabled} />

      {/* Message Input */}
      <TextField
        multiline
        minRows={1}
        maxRows={4}
        placeholder="Type a message..."
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        variant="outlined"
        size="small"
        sx={{
          flexGrow: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            px: 1,
            py: 0.5,
            fontSize: '0.95rem',
            color: '#0f172a',
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
            },
          },
        }}
      />

      {/* Send Button */}
      <Tooltip title="Send message">
        <span>
          <IconButton
            onClick={handleSendMessage}
            disabled={(!message.trim() && !selectedFile) || disabled || isUploading}
            sx={{
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              borderRadius: '50px',
              width: 40,
              height: 40,
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
              '&:hover': {
                backgroundColor: '#6d28d9',
                boxShadow: '0 6px 16px rgba(124, 58, 237, 0.4)',
                transform: 'scale(1.04)',
              },
              '&:disabled': {
                backgroundColor: '#cbd5e1',
                color: '#94a3b8',
                boxShadow: 'none',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      </Paper>
    </Box>
  );
};

export default MessageInput;

