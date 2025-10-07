import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateUser } from '../../store/slices/authSlice';
import { emitUserOnline, emitUserOffline } from '../../services/socketRedux';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  Divider,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { uploadFile } from '../../services/fileUpload';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  
  // Show loading if user data is not available
  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading profile...</Typography>
      </Box>
    );
  }
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    profile_img: user?.profile_img || '',
  });

  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    onlineStatus: true,
    readReceipts: true,
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('chatSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        // Settings loaded from localStorage
      } catch (error) {
        // Error loading settings
      }
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      profile_img: user?.profile_img || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      profile_img: user?.profile_img || '',
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await dispatch(updateUser(formData));
      setIsEditing(false);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const result = await uploadFile(file);
      if (result.success) {
        setFormData(prev => ({ ...prev, profile_img: result.fileUrl }));
        setSnackbar({ open: true, message: 'Profile image updated!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Failed to upload image', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to upload image', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (setting: string, value: boolean) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    try {
      localStorage.setItem('chatSettings', JSON.stringify(newSettings));
    } catch (error) {
      // Silent fail for localStorage errors
    }
    
    // Handle online status changes
    if (setting === 'onlineStatus') {
      if (value) {
        emitUserOnline();
      } else {
        emitUserOffline();
      }
    }
    
    setSnackbar({ open: true, message: 'Settings updated!', severity: 'success' });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  return (
    <Box sx={{ 
      p: 3, 
      maxWidth: 800, 
      mx: 'auto',
      minHeight: '100vh',
      overflow: 'auto',
      pb: 4,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with Back Button - Fixed */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3, 
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        bgcolor: 'background.default',
        zIndex: 1,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/chat')}
          sx={{ 
            mr: 2,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Back to Chat
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Profile Settings
        </Typography>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        pr: 1,
        pb: 2,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(0,0,0,0.3)',
        },
      }}>

      {/* Profile Information */}
      <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Personal Information
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Profile Image */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={isEditing ? formData.profile_img : user?.profile_img}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  border: '3px solid',
                  borderColor: 'primary.main'
                }}
              >
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
              
              {isEditing && (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  size="small"
                  disabled={loading}
                >
                  Change Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
              )}
            </Box>
          </Grid>

          {/* Form Fields */}
          <Grid item xs={12} sm={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ borderRadius: 2 }}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {/* Settings */}
      <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Preferences
          </Typography>
        </Box>

         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
           
           <FormControlLabel
             control={
               <Switch
                 checked={settings.onlineStatus}
                 onChange={(e) => handleSettingsChange('onlineStatus', e.target.checked)}
                 color="primary"
               />
             }
             label={
               <Box>
                 <Typography variant="body1" sx={{ fontWeight: 500 }}>
                   Show Online Status
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                   Let others see when you're online
                 </Typography>
               </Box>
             }
           />

           <FormControlLabel
             control={
               <Switch
                 checked={settings.readReceipts}
                 onChange={(e) => handleSettingsChange('readReceipts', e.target.checked)}
                 color="primary"
               />
             }
             label={
               <Box>
                 <Typography variant="body1" sx={{ fontWeight: 500 }}>
                   Read Receipts
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                   Send read receipts for your messages
                 </Typography>
               </Box>
             }
           />
         </Box>
      </Paper>

      {/* Account Information */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SecurityIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Account Information
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Member Since
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              User ID
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
              {user?._id || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
