const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require('dotenv').config();

const connectDB = require("./config/connectDB");
const userRouter = require("./routes/userRoute");
const chatRouter = require("./routes/chatRoute");
const messageRouter = require("./routes/messageRoute");
const uploadRouter = require("./routes/uploadRoute");
const SocketService = require("./services/socketService");

const PORT = process.env.PORT || 3002;
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB().catch(console.error);

// Middleware
app.use(cors({
  origin: [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/upload', uploadRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: "1.0.0"
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      pid: process.pid
    },
    socket: {
      connectedSockets: io.engine.clientsCount || 0
    }
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to Chat Wave API",
    version: "1.0.0",
    endpoints: {
      // User endpoints
      register: "POST /api/v1/users/register",
      login: "POST /api/v1/users/login",
      users: "GET /api/v1/users/users",
      onlineUsers: "GET /api/v1/users/online",
      updateProfile: "PUT /api/v1/users/update",
      
      // Chat endpoints
      createChat: "POST /api/v1/chats",
      getUserChats: "GET /api/v1/chats",
      createGroupChat: "POST /api/v1/chats/group",
      renameGroupChat: "PUT /api/v1/chats/group/rename",
      addUserToGroup: "PUT /api/v1/chats/group/add-user",
      removeUserFromGroup: "PUT /api/v1/chats/group/remove-user",
      
      // Message endpoints
      sendMessage: "POST /api/v1/messages",
      getMessages: "GET /api/v1/messages/:chatId",
      markMessagesRead: "PUT /api/v1/messages/mark-read",
      unreadCount: "GET /api/v1/messages/unread/count",
      searchMessages: "GET /api/v1/messages/search",
      
      // File upload endpoints
      uploadFile: "POST /api/v1/upload/upload",
      deleteFile: "DELETE /api/v1/upload/delete/:filename"
    }
  });
});

// Initialize Socket.IO service
const socketService = new SocketService(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: false,
    message: "Route not found"
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Socket.IO server is ready`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
});
