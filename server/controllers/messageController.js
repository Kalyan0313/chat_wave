const MessageModel = require("../models/messageModel");
const ChatModel = require("../models/chatModel");
const UserModel = require("../models/userModel");

async function sendMessage(req, res) {
  try {
    const { content, chatId, messageType = 'text', fileUrl = '', fileName = '', fileSize = 0 } = req.body;
    const senderId = req.user.userId;

    if (!content && !fileUrl) {
      return res.status(400).json({
        status: false,
        message: "Message content or file is required"
      });
    }

    if (!chatId) {
      return res.status(400).json({
        status: false,
        message: "Chat ID is required"
      });
    }

    // Check if user is part of the chat
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        status: false,
        message: "Chat not found"
      });
    }

    if (!chat.users.includes(senderId)) {
      return res.status(403).json({
        status: false,
        message: "You are not part of this chat"
      });
    }

    const newMessage = await MessageModel.create({
      sender: senderId,
      content: content || '',
      chat: chatId,
      messageType,
      fileUrl,
      fileName,
      fileSize,
      readBy: [senderId]
    });

    const message = await MessageModel.findById(newMessage._id)
      .populate("sender", "name email profile_img")
      .populate("chat");

    await ChatModel.findByIdAndUpdate(chatId, {
      latestMessage: newMessage._id
    });

    res.status(201).json({
      status: true,
      message: "Message sent successfully",
      messageData: message
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

async function getMessages(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    if (!chatId) {
      return res.status(400).json({
        status: false,
        message: "Chat ID is required"
      });
    }

    // Check if user is part of the chat
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        status: false,
        message: "Chat not found"
      });
    }

    if (!chat.users.includes(userId)) {
      return res.status(403).json({
        status: false,
        message: "You are not part of this chat"
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const messages = await MessageModel.find({ chat: chatId })
      .populate("sender", "name email profile_img")
      .populate("readBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    await MessageModel.updateMany(
      { 
        chat: chatId, 
        sender: { $ne: userId },
        readBy: { $nin: [userId] }
      },
      { $push: { readBy: userId } }
    );

    res.status(200).json({
      status: true,
      message: "Messages fetched successfully",
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total: await MessageModel.countDocuments({ chat: chatId })
      }
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

async function markMessagesAsRead(req, res) {
  try {
    const { chatId } = req.body;
    const userId = req.user.userId;

    if (!chatId) {
      return res.status(400).json({
        status: false,
        message: "Chat ID is required"
      });
    }

    const result = await MessageModel.updateMany(
      { 
        chat: chatId, 
        sender: { $ne: userId },
        readBy: { $nin: [userId] }
      },
      { $push: { readBy: userId } }
    );

    res.status(200).json({
      status: true,
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

async function getUnreadCount(req, res) {
  try {
    const userId = req.user.userId;

    const userChats = await ChatModel.find({ users: { $in: [userId] } });
    const chatIds = userChats.map(chat => chat._id);

    const unreadCount = await MessageModel.countDocuments({
      chat: { $in: chatIds },
      readBy: { $nin: [userId] },
      sender: { $ne: userId }
    });

    res.status(200).json({
      status: true,
      message: "Unread count fetched successfully",
      unreadCount
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

async function searchMessages(req, res) {
  try {
    const { query, chatId } = req.query;
    const userId = req.user.userId;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        status: false,
        message: "Search query is required"
      });
    }

    if (query.trim().length < 2) {
      return res.status(400).json({
        status: false,
        message: "Search query must be at least 2 characters"
      });
    }

    let searchFilter = {
      content: { $regex: query, $options: 'i' }
    };

    if (chatId) {
      const chat = await ChatModel.findById(chatId);
      if (!chat || !chat.users.includes(userId)) {
        return res.status(403).json({
          status: false,
          message: "You are not part of this chat"
        });
      }
      searchFilter.chat = chatId;
    } else {
      const userChats = await ChatModel.find({ users: { $in: [userId] } });
      const chatIds = userChats.map(chat => chat._id);
      searchFilter.chat = { $in: chatIds };
    }

    const messages = await MessageModel.find(searchFilter)
      .populate("sender", "name email profile_img")
      .populate("chat", "chatName isGroupChat")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      status: true,
      message: "Search completed successfully",
      messages,
      query
    });
  } catch (error) {
    console.error("Error searching messages:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

module.exports = {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  getUnreadCount,
  searchMessages
};
