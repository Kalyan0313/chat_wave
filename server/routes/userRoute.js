const express = require('express');
const { RegisterUser, LoginUser, GetAllUsers, UpdateProfile, UpdateUser, GetOnlineUsers, SearchUsers } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin, validateProfileUpdate, validateUserUpdate } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

const userRouter = express.Router();

// Public routes (with rate limiting)
userRouter.post('/register', authLimiter, validateRegister, RegisterUser);
userRouter.post('/login', authLimiter, validateLogin, LoginUser);

// Protected routes
userRouter.get('/users', authenticateToken, GetAllUsers);
userRouter.get('/online', authenticateToken, GetOnlineUsers);
userRouter.get('/search', authenticateToken, SearchUsers);
userRouter.put('/profile', authenticateToken, validateProfileUpdate, UpdateProfile);
userRouter.put('/update', authenticateToken, validateUserUpdate, UpdateUser);

module.exports = userRouter;