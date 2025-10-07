import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { formatFileSize, getFileType } from '../../services/fileUpload';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  if (!file) {
    return null;
  }
  
  const fileType = getFileType(file.name);
  const fileSize = formatFileSize(file.size);

  const getFileIcon = () => {
    switch (fileType) {
      case 'image':
        return <ImageIcon color="primary" />;
      case 'audio':
        return <AudioIcon color="primary" />;
      case 'video':
        return <VideoIcon color="primary" />;
      default:
        return <FileIcon color="primary" />;
    }
  };

  const getFilePreview = () => {
    if (fileType === 'image') {
      return (
        <Avatar
          src={URL.createObjectURL(file)}
          alt={file.name}
          variant="rounded"
          sx={{ width: 48, height: 48 }}
        />
      );
    }
    return (
      <Avatar
        sx={{ width: 48, height: 48, bgcolor: 'primary.light' }}
        variant="rounded"
      >
        {getFileIcon()}
      </Avatar>
    );
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1.5,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'primary.main',
        maxWidth: 'fit-content',
        minWidth: 200,
      }}
    >
      {getFilePreview()}
      
      <Box sx={{ minWidth: 0, maxWidth: 200 }}>
        <Typography
          variant="body2"
          noWrap
          sx={{ fontWeight: 500, fontSize: '0.875rem' }}
        >
          {file.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          {fileSize}
        </Typography>
      </Box>

      <IconButton
        size="small"
        onClick={onRemove}
        sx={{ 
          color: 'text.secondary',
          ml: 0.5,
          '&:hover': {
            bgcolor: 'action.hover',
          }
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
};

export default FilePreview;

