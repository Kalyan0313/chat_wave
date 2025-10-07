const ChatModel = require("../models/chatModel");
const UserModel = require("../models/userModel");

// Create or get one-on-one chat
async function createOrGetChat(req, res) {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.userId;

    if (!userId) {
      return res.status(400).json({
        status: false,
        message: "User ID is required"
      });
    }

    if (userId === currentUserId) {
      return res.status(400).json({
        status: false,
        message: "Cannot chat with yourself"
      });
    }

    // Check if chat already exists
    let chat = await ChatModel.findOne({
      isGroupChat: false,
      users: { $all: [currentUserId, userId] }
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (chat) {
      return res.status(200).json({
        status: true,
        message: "Chat found",
        chat
      });
    }

    // Create new chat
    const newChat = await ChatModel.create({
      chatName: "sender",
      isGroupChat: false,
      users: [currentUserId, userId]
    });

    const fullChat = await ChatModel.findOne({ _id: newChat._id })
      .populate("users", "-password");

    res.status(201).json({
      status: true,
      message: "Chat created successfully",
      chat: fullChat
    });
  } catch (error) {
    console.log("Error creating chat:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Get all chats for a user
async function getUserChats(req, res) {
  try {
    const userId = req.user.userId;

    const chats = await ChatModel.find({ users: { $in: [userId] } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      status: true,
      message: "Chats fetched successfully",
      chats
    });
  } catch (error) {
    console.log("Error fetching chats:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Create group chat
async function createGroupChat(req, res) {
  try {
    const { chatName, users } = req.body;
    const currentUserId = req.user.userId;

    if (!chatName || !users) {
      return res.status(400).json({
        status: false,
        message: "Chat name and users are required"
      });
    }

    if (users.length < 2) {
      return res.status(400).json({
        status: false,
        message: "Group chat must have at least 2 users"
      });
    }

    // Add current user to the group
    users.push(currentUserId);

    const groupChat = await ChatModel.create({
      chatName,
      isGroupChat: true,
      users,
      groupAdmin: currentUserId
    });

    const fullGroupChat = await ChatModel.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json({
      status: true,
      message: "Group chat created successfully",
      chat: fullGroupChat
    });
  } catch (error) {
    console.log("Error creating group chat:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Rename group chat
async function renameGroupChat(req, res) {
  try {
    const { chatId, chatName } = req.body;
    const currentUserId = req.user.userId;

    if (!chatId || !chatName) {
      return res.status(400).json({
        status: false,
        message: "Chat ID and chat name are required"
      });
    }

    const updatedChat = await ChatModel.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).json({
        status: false,
        message: "Chat not found"
      });
    }

    res.status(200).json({
      status: true,
      message: "Group chat renamed successfully",
      chat: updatedChat
    });
  } catch (error) {
    console.log("Error renaming group chat:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Add user to group
async function addUserToGroup(req, res) {
  try {
    const { chatId, userId } = req.body;
    const currentUserId = req.user.userId;

    if (!chatId || !userId) {
      return res.status(400).json({
        status: false,
        message: "Chat ID and user ID are required"
      });
    }

    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        status: false,
        message: "Chat not found"
      });
    }

    if (chat.groupAdmin.toString() !== currentUserId) {
      return res.status(403).json({
        status: false,
        message: "Only group admin can add users"
      });
    }

    if (chat.users.includes(userId)) {
      return res.status(400).json({
        status: false,
        message: "User already in group"
      });
    }

    const updatedChat = await ChatModel.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json({
      status: true,
      message: "User added to group successfully",
      chat: updatedChat
    });
  } catch (error) {
    console.log("Error adding user to group:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Remove user from group
async function removeUserFromGroup(req, res) {
  try {
    const { chatId, userId } = req.body;
    const currentUserId = req.user.userId;

    if (!chatId || !userId) {
      return res.status(400).json({
        status: false,
        message: "Chat ID and user ID are required"
      });
    }

    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        status: false,
        message: "Chat not found"
      });
    }

    if (chat.groupAdmin.toString() !== currentUserId) {
      return res.status(403).json({
        status: false,
        message: "Only group admin can remove users"
      });
    }

    const updatedChat = await ChatModel.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json({
      status: true,
      message: "User removed from group successfully",
      chat: updatedChat
    });
  } catch (error) {
    console.log("Error removing user from group:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

module.exports = {
  createOrGetChat,
  getUserChats,
  createGroupChat,
  renameGroupChat,
  addUserToGroup,
  removeUserFromGroup
};
