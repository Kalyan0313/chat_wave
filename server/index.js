const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = require("./config/connectDB");
const userRouter = require("./routes/userRoute");
const chatRouter = require("./routes/chatRoute");
const messageRouter = require("./routes/messageRoute");
const uploadRouter = require("./routes/uploadRoute");
const SocketService = require("./services/socketService");
const { apiLimiter } = require("./middleware/rateLimiter");
const cacheService = require("./services/cacheService");

const PORT = process.env.PORT || 3002;
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

async function initializeServer() {
  try {
    await connectDB();

    new SocketService(io);
  } catch (error) {
    console.error('Server initialization error:', error);
    process.exit(1);
  }
}

app.use(cors({
  origin: [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use('/api/', apiLimiter);
app.use('/uploads', express.static('uploads'));
app.use('/api/v1/users', userRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/upload', uploadRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: "1.0.0"
  });
});

app.get('/metrics', async (req, res) => {
  const onlineCount = await cacheService.getOnlineUsersCount();

  res.json({
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      pid: process.pid
    },
    socket: {
      connectedSockets: io.engine.clientsCount || 0
    },
    cache: {
      onlineUsers: onlineCount
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    message: "Welcome to Chat Wave API",
    version: "1.0.0",
    scalability: {
      caching: 'enabled (in-memory)',
      rateLimiting: 'enabled'
    },
    endpoints: {
      register: "POST /api/v1/users/register",
      login: "POST /api/v1/users/login",
      users: "GET /api/v1/users/users",
      onlineUsers: "GET /api/v1/users/online",
      updateProfile: "PUT /api/v1/users/update",
      createChat: "POST /api/v1/chats",
      getUserChats: "GET /api/v1/chats",
      createGroupChat: "POST /api/v1/chats/group",
      renameGroupChat: "PUT /api/v1/chats/group/rename",
      addUserToGroup: "PUT /api/v1/chats/group/add-user",
      removeUserFromGroup: "PUT /api/v1/chats/group/remove-user",
      sendMessage: "POST /api/v1/messages",
      getMessages: "GET /api/v1/messages/:chatId",
      markMessagesRead: "PUT /api/v1/messages/mark-read",
      unreadCount: "GET /api/v1/messages/unread/count",
      searchMessages: "GET /api/v1/messages/search",
      uploadFile: "POST /api/v1/upload/upload",
      deleteFile: "DELETE /api/v1/upload/delete/:filename"
    }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    status: false,
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: false,
      message: "Invalid ID format"
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: false,
      message: "Validation error",
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: false,
      message: "Invalid or expired token"
    });
  }
  
  res.status(err.status || 500).json({
    status: false,
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Process event handlers for safety
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

// Graceful shutdown logic
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('HTTP & Socket.IO server closed.');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database connection close:', err);
      process.exit(1);
    }
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

initializeServer().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
