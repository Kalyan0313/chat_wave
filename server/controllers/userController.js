const UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const cacheService = require("../services/cacheService");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

async function RegisterUser(req, res) {
  try {
    const { name, email, password, profile_img } = req.body;
    
    const existEmail = await UserModel.findOne({ email });
    if (existEmail) {
      return res.status(400).json({
        status: false,
        message: "Email already exists"
      });
    }

    const user = await UserModel.create({
      name,
      email,
      profile_img: profile_img || "",
      password,
    });
    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profile_img: user.profile_img,
      status: user.status,
      lastSeen: user.lastSeen
    };

    res.status(201).json({
      status: true,
      message: "User created successfully",
      userInfo: userResponse,
      token
    });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

async function LoginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password"
      });
    }

    await UserModel.findByIdAndUpdate(user._id, { 
      status: 'online',
      lastSeen: new Date()
    });

    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profile_img: user.profile_img,
      status: 'online',
      lastSeen: new Date()
    };

    res.status(200).json({
      status: true,
      message: "Login successful",
      userInfo: userResponse,
      token
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

async function GetAllUsers(req, res) {
  try {
    const userId = req.user.userId;
    
    const users = await UserModel.find({ 
      isActive: true,
      _id: { $ne: userId }
    })
      .select("-password")
      .sort({ name: 1 });

    res.status(200).json({
      status: true,
      message: "Users fetched successfully",
      users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

async function UpdateProfile(req, res) {
  try {

    const { name, profile_img, bio } = req.body;
    const userId = req.user.userId;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (profile_img !== undefined) updateData.profile_img = profile_img;
    if (bio !== undefined) updateData.bio = bio;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      userInfo: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

async function GetOnlineUsers(req, res) {
  try {
    const onlineUserIds = await cacheService.getOnlineUsers();
    
    if (onlineUserIds.length === 0) {
      return res.status(200).json({
        status: true,
        message: "Online users fetched successfully",
        onlineUsers: []
      });
    }

    const onlineUsers = await UserModel.find({ 
      _id: { $in: onlineUserIds },
      isActive: true 
    }).select("-password");

    res.status(200).json({
      status: true,
      message: "Online users fetched successfully",
      onlineUsers
    });
  } catch (error) {
    console.error("Error fetching online users:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

async function SearchUsers(req, res) {
  try {
    const { query } = req.query;
    const userId = req.user.userId;

    if (!query) {
      return res.status(400).json({
        status: false,
        message: "Search query is required"
      });
    }

    const users = await UserModel.find({
      _id: { $ne: userId },
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select("-password")
    .sort({ name: 1 })
    .limit(20);

    res.status(200).json({
      status: true,
      message: "User search completed successfully",
      users
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

async function UpdateUser(req, res) {
  try {

    const { name, email, bio, profile_img } = req.body;
    const userId = req.user.userId;

    if (email) {
      const existingUser = await UserModel.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          status: false,
          message: "Email already exists"
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (profile_img !== undefined) updateData.profile_img = profile_img;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      status: true,
      message: "User updated successfully",
      userInfo: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

module.exports = {
  RegisterUser,
  LoginUser,
  GetAllUsers,
  UpdateProfile,
  UpdateUser,
  GetOnlineUsers,
  SearchUsers
};
