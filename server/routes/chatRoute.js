const express = require('express');
const { 
  createOrGetChat, 
  getUserChats, 
  createGroupChat, 
  renameGroupChat, 
  addUserToGroup, 
  removeUserFromGroup 
} = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');
const { chatCreationLimiter } = require('../middleware/rateLimiter');

const chatRouter = express.Router();

// All routes require authentication
chatRouter.use(authenticateToken);

// Chat routes
chatRouter.post('/', chatCreationLimiter, createOrGetChat); // Create or get one-on-one chat
chatRouter.get('/', getUserChats); // Get all chats for user
chatRouter.post('/group', chatCreationLimiter, createGroupChat); // Create group chat
chatRouter.put('/group/rename', renameGroupChat); // Rename group chat
chatRouter.put('/group/add-user', addUserToGroup); // Add user to group
chatRouter.put('/group/remove-user', removeUserFromGroup); // Remove user from group

module.exports = chatRouter;
