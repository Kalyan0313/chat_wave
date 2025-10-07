import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  loadChats, 
  loadUsers, 
  loadOnlineUsers
} from '../../store/slices/chatSlice';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import {
  Box,
  Drawer,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';

const ChatDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentChat, chats, users } = useAppSelector((state) => state.chat);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load data on component mount
  useEffect(() => {
    dispatch(loadChats());
    dispatch(loadUsers());
    dispatch(loadOnlineUsers());
  }, [dispatch]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleChatSelect = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerWidth = 360;

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
      <ChatList onChatSelect={handleChatSelect} />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100%', bgcolor: 'background.default' }}>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            height: '100%',
            borderRight: '1px solid',
            borderColor: 'grey.200',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            height: '100%',
            position: 'relative',
            borderRight: '1px solid',
            borderColor: 'grey.200',
            bgcolor: 'background.paper',
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main chat area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100%',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        <ChatWindow 
          onBack={isMobile ? handleDrawerToggle : undefined}
          onMenuClick={isMobile ? handleDrawerToggle : undefined}
        />
      </Box>
    </Box>
  );
};

export default ChatDashboard;
