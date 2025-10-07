const MessageModel = require("../models/messageModel");
const ChatModel = require("../models/chatModel");
const UserModel = require("../models/userModel");

// Send a message
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

    // Create new message
    const newMessage = await MessageModel.create({
      sender: senderId,
      content: content || '',
      chat: chatId,
      messageType,
      fileUrl,
      fileName,
      fileSize
    });

    // Populate the message with sender details
    const message = await MessageModel.findById(newMessage._id)
      .populate("sender", "name email profile_img")
      .populate("chat");

    // Update latest message in chat
    await ChatModel.findByIdAndUpdate(chatId, {
      latestMessage: newMessage._id
    });

    res.status(201).json({
      status: true,
      message: "Message sent successfully",
      messageData: message
    });
  } catch (error) {
    console.log("Error sending message:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Get all messages for a chat
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

    // Get messages with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await MessageModel.find({ chat: chatId })
      .populate("sender", "name email profile_img")
      .populate("readBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark messages as read for current user
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
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total: await MessageModel.countDocuments({ chat: chatId })
      }
    });
  } catch (error) {
    console.log("Error fetching messages:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Mark messages as read
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

    // Mark all unread messages in the chat as read
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
    console.log("Error marking messages as read:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Get unread message count for a user
async function getUnreadCount(req, res) {
  try {
    const userId = req.user.userId;

    const unreadCount = await MessageModel.countDocuments({
      readBy: { $nin: [userId] },
      sender: { $ne: userId }
    });

    res.status(200).json({
      status: true,
      message: "Unread count fetched successfully",
      unreadCount
    });
  } catch (error) {
    console.log("Error fetching unread count:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Search messages
async function searchMessages(req, res) {
  try {
    const { query, chatId } = req.query;
    const userId = req.user.userId;

    if (!query) {
      return res.status(400).json({
        status: false,
        message: "Search query is required"
      });
    }

    let searchFilter = {
      content: { $regex: query, $options: 'i' }
    };

    if (chatId) {
      // Check if user is part of the chat
      const chat = await ChatModel.findById(chatId);
      if (!chat || !chat.users.includes(userId)) {
        return res.status(403).json({
          status: false,
          message: "You are not part of this chat"
        });
      }
      searchFilter.chat = chatId;
    } else {
      // Search in all user's chats
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
    console.log("Error searching messages:", error);
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
