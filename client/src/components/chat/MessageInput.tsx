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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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
          alignItems: 'flex-end',
          p: 2,
          gap: 1,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'grey.200',
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.1)',
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
        ref={textareaRef}
        multiline
        maxRows={4}
        placeholder="Type a message..."
        value={message}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        variant="outlined"
        size="small"
        sx={{
          flexGrow: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
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
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: 2,
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.05)',
              },
              '&:disabled': {
                bgcolor: 'grey.300',
                color: 'grey.500',
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

