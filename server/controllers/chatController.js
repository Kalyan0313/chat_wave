const ChatModel = require("../models/chatModel");
const UserModel = require("../models/userModel");

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

    const newChat = await ChatModel.create({
      chatName: "",
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
    console.error("Error creating chat:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

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
    console.error("Error fetching chats:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

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

    // Validate chat name
    if (typeof chatName !== 'string' || chatName.trim().length === 0) {
      return res.status(400).json({
        status: false,
        message: "Chat name cannot be empty"
      });
    }

    if (chatName.trim().length > 100) {
      return res.status(400).json({
        status: false,
        message: "Chat name cannot exceed 100 characters"
      });
    }

    if (!Array.isArray(users) || users.length < 2) {
      return res.status(400).json({
        status: false,
        message: "Group chat must have at least 2 users"
      });
    }

    const validUsers = await UserModel.find({ _id: { $in: users }, isActive: true });
    if (validUsers.length !== users.length) {
      return res.status(400).json({
        status: false,
        message: "One or more users are invalid or inactive"
      });
    }

    const uniqueUsers = [...new Set([...users, currentUserId])];
    
    if (uniqueUsers.length < 3) {
      return res.status(400).json({
        status: false,
        message: "Group chat must have at least 2 other users (excluding yourself)"
      });
    }

    const groupChat = await ChatModel.create({
      chatName: chatName.trim(),
      isGroupChat: true,
      users: uniqueUsers,
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
    console.error("Error creating group chat:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

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

    // Validate chat name
    if (typeof chatName !== 'string' || chatName.trim().length === 0) {
      return res.status(400).json({
        status: false,
        message: "Chat name cannot be empty"
      });
    }

    if (chatName.trim().length > 100) {
      return res.status(400).json({
        status: false,
        message: "Chat name cannot exceed 100 characters"
      });
    }

    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        status: false,
        message: "Chat not found"
      });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({
        status: false,
        message: "This is not a group chat"
      });
    }

    if (chat.groupAdmin.toString() !== currentUserId) {
      return res.status(403).json({
        status: false,
        message: "Only group admin can rename the chat"
      });
    }

    const updatedChat = await ChatModel.findByIdAndUpdate(
      chatId,
      { chatName: chatName.trim() },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json({
      status: true,
      message: "Group chat renamed successfully",
      chat: updatedChat
    });
  } catch (error) {
    console.error("Error renaming group chat:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

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

    if (!chat.isGroupChat) {
      return res.status(400).json({
        status: false,
        message: "This is not a group chat"
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

    const userToAdd = await UserModel.findById(userId);
    if (!userToAdd || !userToAdd.isActive) {
      return res.status(400).json({
        status: false,
        message: "User not found or inactive"
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
    console.error("Error adding user to group:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

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

    if (!chat.isGroupChat) {
      return res.status(400).json({
        status: false,
        message: "This is not a group chat"
      });
    }

    if (chat.groupAdmin.toString() !== currentUserId) {
      return res.status(403).json({
        status: false,
        message: "Only group admin can remove users"
      });
    }

    if (userId === currentUserId || userId === chat.groupAdmin.toString()) {
      return res.status(400).json({
        status: false,
        message: "Cannot remove group admin from the group"
      });
    }

    if (chat.users.length <= 2) {
      return res.status(400).json({
        status: false,
        message: "Group must have at least 2 members"
      });
    }

    if (!chat.users.includes(userId)) {
      return res.status(400).json({
        status: false,
        message: "User is not in this group"
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
    console.error("Error removing user from group:", error);
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
