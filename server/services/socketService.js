const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const ChatModel = require("../models/chatModel");
const MessageModel = require("../models/messageModel");
const cacheService = require("./cacheService");

class SocketService {
  constructor(io) {
    this.io = io;
    this.setupSocketMiddleware();
    this.setupSocketHandlers();
  }

  setupSocketMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
        if (!token) {
          return next(new Error("Authentication error: Token required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.userId).select("-password");

        if (!user) {
          return next(new Error("Authentication error: User not found"));
        }

        const existingSocketId = await cacheService.getUserSocket(user._id.toString());
        if (existingSocketId && existingSocketId !== socket.id) {
          const existingSocket = this.io.sockets.sockets.get(existingSocketId);
          if (existingSocket) {
            existingSocket.emit("auth_error", { message: "New connection established" });
            existingSocket.disconnect();
          }
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        console.error("Socket authentication error:", error.message);
        if (error.name === 'TokenExpiredError') {
          return next(new Error("Authentication error: Token expired"));
        } else if (error.name === 'JsonWebTokenError') {
          return next(new Error("Authentication error: Invalid token"));
        } else {
          return next(new Error("Authentication error: Verification failed"));
        }
      }
    });
  }

  setupSocketHandlers() {
    this.io.on("connection", async (socket) => {
      try {
        await cacheService.mapUserSocket(socket.userId, socket.id);
        await cacheService.addOnlineUser(socket.userId);

        await UserModel.findByIdAndUpdate(socket.userId, {
          status: "online",
          lastSeen: new Date()
        });

        socket.emit("authenticated", { user: socket.user });
        await this.notifyUserStatusChange(socket.userId, "online", socket.user);
      } catch (error) {
        console.error("Error finalizing socket connection:", error);
      }

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

      socket.on("leave_chat", (data) => {
        const { chatId } = data;
        if (chatId) {
          socket.leave(chatId);
          socket.emit("left_chat", { chatId });
        }
      });

      socket.on("send_message", async (data) => {
        try {
          const { content, chatId, messageType = "text", fileUrl, fileName, fileSize } = data;

          if (!content && !fileUrl) {
            socket.emit("error", { message: "Message content or file is required" });
            return;
          }

          if (content && content.trim().length > 1000) {
            socket.emit("error", { message: "Message content cannot exceed 1000 characters" });
            return;
          }

          if (!chatId) {
            socket.emit("error", { message: "Chat ID is required" });
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
          await message.populate('chat', 'chatName isGroupChat users');

          await ChatModel.findByIdAndUpdate(chatId, {
            latestMessage: message._id
          });

          await cacheService.invalidateChatCaches(chatId, chat.users.map(u => u.toString()));
          this.io.to(chatId).emit("new_message", { message });

        } catch (error) {
          console.error("Send message error:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

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

      socket.on("mark_messages_read", async (data) => {
        try {
          const { chatId } = data;
          if (!chatId) return;

          const chat = await ChatModel.findById(chatId);
          if (!chat || !chat.users.includes(socket.userId)) {
            return;
          }

          await MessageModel.updateMany(
            {
              chat: chatId,
              sender: { $ne: socket.userId },
              readBy: { $nin: [socket.userId] }
            },
            { $addToSet: { readBy: socket.userId } }
          );

          await cacheService.invalidateChatMessages(chatId);
          await cacheService.invalidateUnreadCount(socket.userId);

          socket.to(chatId).emit("messages_read", {
            userId: socket.userId,
            chatId
          });

        } catch (error) {
          console.error("Mark messages read error:", error);
        }
      });

      socket.on("user_online", async () => {
        if (socket.userId) {
          await UserModel.findByIdAndUpdate(socket.userId, {
            status: "online",
            lastSeen: new Date()
          });
          await cacheService.addOnlineUser(socket.userId);
          await this.notifyUserStatusChange(socket.userId, "online", socket.user);
        }
      });

      socket.on("user_offline", async () => {
        if (socket.userId) {
          await UserModel.findByIdAndUpdate(socket.userId, {
            status: "offline",
            lastSeen: new Date()
          });
          await cacheService.removeOnlineUser(socket.userId);
          await this.notifyUserStatusChange(socket.userId, "offline", socket.user);
        }
      });

      socket.on("disconnect", async (reason) => {
        if (socket.userId) {
          const currentSocketId = await cacheService.getUserSocket(socket.userId);
          
          if (currentSocketId === socket.id) {
            await cacheService.removeUserSocket(socket.userId);
            await cacheService.removeOnlineUser(socket.userId);

            await UserModel.findByIdAndUpdate(socket.userId, {
              status: "offline",
              lastSeen: new Date()
            });

            await this.notifyUserStatusChange(socket.userId, "offline", socket.user);
          }
        }
      });
    });
  }

  async notifyUserStatusChange(userId, status, user) {
    try {
      const chats = await ChatModel.find({ users: userId }).select('users');
      const relevantUserIds = new Set();
      chats.forEach(chat => {
        chat.users.forEach(uid => {
          const uidStr = uid.toString();
          if (uidStr !== userId) {
            relevantUserIds.add(uidStr);
          }
        });
      });

      const event = status === "online" ? "user_online" : "user_offline";
      for (const targetUserId of relevantUserIds) {
        const socketId = await cacheService.getUserSocket(targetUserId);
        if (socketId) {
          this.io.to(socketId).emit(event, { userId, user });
        }
      }
    } catch (error) {
      console.error("Error notifying user status change:", error);
    }
  }

  async sendToUser(userId, event, data) {
    const socketId = await cacheService.getUserSocket(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  sendToChat(chatId, event, data) {
    this.io.to(chatId).emit(event, data);
  }

  broadcast(event, data) {
    this.io.emit(event, data);
  }
}

module.exports = SocketService;
