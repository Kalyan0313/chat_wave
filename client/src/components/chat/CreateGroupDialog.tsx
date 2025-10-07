import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createGroupChat } from '../../store/slices/chatSlice';
import { User } from '../../types';

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.chat);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter users (exclude current user and filter by search)
  const filteredUsers = users.filter(user => 
    user._id !== currentUser?._id &&
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedUsers.length >= 2) {
      try {
        const result = await dispatch(createGroupChat({
          chatName: groupName.trim(),
          users: selectedUsers,
        }));

        if (createGroupChat.fulfilled.match(result)) {
          onClose();
          setGroupName('');
          setSelectedUsers([]);
          setSearchQuery('');
        }
      } catch (error) {
        console.error('Failed to create group chat:', error);
      }
    }
  };

  const handleClose = () => {
    onClose();
    setGroupName('');
    setSelectedUsers([]);
    setSearchQuery('');
  };

  const getSelectedUserNames = () => {
    return selectedUsers.map(userId => 
      users.find(user => user._id === userId)?.name
    ).filter(Boolean);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: 500 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Create Group Chat</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Group Name */}
          <TextField
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            fullWidth
            placeholder="Enter group name..."
            variant="outlined"
          />

          {/* Search Users */}
          <TextField
            label="Search Users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            placeholder="Search by name..."
            variant="outlined"
            size="small"
          />

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Selected Users ({selectedUsers.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {getSelectedUserNames().map((name, index) => (
                  <Chip
                    key={selectedUsers[index]}
                    label={name}
                    onDelete={() => handleUserToggle(selectedUsers[index])}
                    deleteIcon={<RemoveIcon />}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Users List */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Select Users (minimum 2)
            </Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {filteredUsers.map((user) => (
                <ListItem
                  key={user._id}
                  button
                  onClick={() => handleUserToggle(user._id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={user.profile_img} alt={user.name}>
                      {user.name[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={user.email}
                  />
                  <ListItemSecondaryAction>
                    <Checkbox
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleUserToggle(user._id)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleCreateGroup}
          variant="contained"
          disabled={!groupName.trim() || selectedUsers.length < 2 || loading}
          startIcon={<AddIcon />}
        >
          Create Group
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupDialog;

