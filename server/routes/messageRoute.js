const express = require('express');
const { 
  sendMessage, 
  getMessages, 
  markMessagesAsRead, 
  getUnreadCount, 
  searchMessages 
} = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/authMiddleware');

const messageRouter = express.Router();

// All routes require authentication
messageRouter.use(authenticateToken);

// Message routes
messageRouter.post('/', sendMessage); // Send a message
messageRouter.get('/search', searchMessages); // Search messages
messageRouter.get('/unread/count', getUnreadCount); // Get unread message count
messageRouter.put('/mark-read', markMessagesAsRead); // Mark messages as read
messageRouter.get('/:chatId', getMessages); // Get messages for a chat

module.exports = messageRouter;
