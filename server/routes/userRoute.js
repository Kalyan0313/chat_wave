const express = require('express');
const { RegisterUser, LoginUser, GetAllUsers, UpdateProfile, UpdateUser, GetOnlineUsers, SearchUsers } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin, validateProfileUpdate } = require('../middleware/validationMiddleware');

const userRouter = express.Router();

// Public routes
userRouter.post('/register', validateRegister, RegisterUser);
userRouter.post('/login', validateLogin, LoginUser);

// Protected routes
userRouter.get('/users', authenticateToken, GetAllUsers);
userRouter.get('/online', authenticateToken, GetOnlineUsers);
userRouter.get('/search', authenticateToken, SearchUsers);
userRouter.put('/profile', authenticateToken, validateProfileUpdate, UpdateProfile);
userRouter.put('/update', authenticateToken, UpdateUser);

module.exports = userRouter;