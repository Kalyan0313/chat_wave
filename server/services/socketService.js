const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const ChatModel = require("../models/chatModel");
const MessageModel = require("../models/messageModel");

class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Handle authentication
      socket.on("authenticate", async (data) => {
        try {
          const { token } = data;
          if (!token) {
            socket.emit("auth_error", { message: "Token required" });
            return;
          }

          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await UserModel.findById(decoded.userId).select("-password");
          
          if (!user) {
            socket.emit("auth_error", { message: "User not found" });
            return;
          }

          socket.userId = user._id.toString();
          socket.user = user;
          this.connectedUsers.set(user._id.toString(), socket.id);

          // Update user status to online
          await UserModel.findByIdAndUpdate(user._id, { 
            status: "online",
            lastSeen: new Date()
          });

          socket.emit("authenticated", { user });
          this.io.emit("user_online", { userId: user._id, user });

          console.log(`User authenticated: ${user.name}`);
        } catch (error) {
          console.error("Authentication error:", error);
          socket.emit("auth_error", { message: "Invalid token" });
        }
      });

      // Handle joining a chat
      socket.on("join_chat", async (data) => {
        try {
          const { chatId } = data;
          if (!chatId) return;

          const chat = await ChatModel.findById(chatId);
          if (!chat || !chat.users.includes(socket.userId)) {
            socket.emit("error", { message: "Chat not found or access denied" });
            return;
          }

          socket.join(chatId);
          socket.emit("joined_chat", { chatId });
        } catch (error) {
          console.error("Join chat error:", error);
          socket.emit("error", { message: "Failed to join chat" });
        }
      });

      // Handle leaving a chat
      socket.on("leave_chat", (data) => {
        const { chatId } = data;
        if (chatId) {
          socket.leave(chatId);
          socket.emit("left_chat", { chatId });
        }
      });

      // Handle sending messages
      socket.on("send_message", async (data) => {
        try {
          const { content, chatId, messageType = "text", fileUrl, fileName, fileSize } = data;
          
          if (!content && !fileUrl) {
            socket.emit("error", { message: "Message content or file is required" });
            return;
          }

          const chat = await ChatModel.findById(chatId);
          if (!chat || !chat.users.includes(socket.userId)) {
            socket.emit("error", { message: "Chat not found or access denied" });
            return;
          }

          const message = new MessageModel({
            sender: socket.userId,
            content,
            chat: chatId,
            messageType,
            fileUrl,
            fileName,
            fileSize,
            readBy: [socket.userId]
          });

          await message.save();
          await message.populate('sender', 'name email profile_img');

          // Update chat's latest message
          await ChatModel.findByIdAndUpdate(chatId, {
            latestMessage: message._id
          });

          // Emit to all users in the chat
          this.io.to(chatId).emit("new_message", { message });

        } catch (error) {
          console.error("Send message error:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      // Handle typing indicators
      socket.on("typing_start", (data) => {
        const { chatId } = data;
        if (chatId) {
          socket.to(chatId).emit("user_typing", { 
            chatId,
            userId: socket.userId, 
            userName: socket.user?.name 
          });
        }
      });

      socket.on("typing_stop", (data) => {
        const { chatId } = data;
        if (chatId) {
          socket.to(chatId).emit("user_stopped_typing", { 
            chatId,
            userId: socket.userId, 
            userName: socket.user?.name 
          });
        }
      });

      // Handle message read status
      socket.on("mark_messages_read", async (data) => {
        try {
          const { chatId } = data;
          if (!chatId) return;

          const chat = await ChatModel.findById(chatId);
          if (!chat || !chat.users.includes(socket.userId)) {
            return;
          }

          // Update messages that are not from the current user
          await MessageModel.updateMany(
            { 
              chat: chatId, 
              sender: { $ne: socket.userId },
              readBy: { $ne: socket.userId }
            },
            { $addToSet: { readBy: socket.userId } }
          );

          socket.to(chatId).emit("messages_read", { 
            userId: socket.userId,
            chatId 
          });

        } catch (error) {
          console.error("Mark messages read error:", error);
        }
      });

      // Handle user online status
      socket.on("user_online", async () => {
        if (socket.userId) {
          await UserModel.findByIdAndUpdate(socket.userId, { 
            status: "online",
            lastSeen: new Date()
          });
          this.io.emit("user_online", { 
            userId: socket.userId, 
            user: socket.user 
          });
        }
      });

      // Handle user offline status
      socket.on("user_offline", async () => {
        if (socket.userId) {
          await UserModel.findByIdAndUpdate(socket.userId, { 
            status: "offline",
            lastSeen: new Date()
          });
          this.io.emit("user_offline", { 
            userId: socket.userId, 
            user: socket.user 
          });
        }
      });

      // Handle disconnection
      socket.on("disconnect", async () => {
        console.log(`User disconnected: ${socket.id}`);
        
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          
          // Update user status to offline
          await UserModel.findByIdAndUpdate(socket.userId, { 
            status: "offline",
            lastSeen: new Date()
          });
          
          this.io.emit("user_offline", { 
            userId: socket.userId, 
            user: socket.user 
          });
        }
      });
    });
  }

  // Method to send message to specific user
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Method to send message to chat room
  sendToChat(chatId, event, data) {
    this.io.to(chatId).emit(event, data);
  }

  // Method to broadcast to all connected users
  broadcast(event, data) {
    this.io.emit(event, data);
  }
}

module.exports = SocketService;
