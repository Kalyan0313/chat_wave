const UserModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register User
async function RegisterUser(req, res) {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { name, email, password, profile_img } = req.body;
    
    // Check if user already exists
    const existEmail = await UserModel.findOne({ email });
    if (existEmail) {
      return res.status(400).json({
        status: false,
        message: "Email already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUserInfo = {
      name,
      email,
      profile_img: profile_img || "",
      password: hashedPassword,
    };
    
    const user = await UserModel.create(newUserInfo);
    
    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
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
    console.log("Error in register:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Login User
async function LoginUser(req, res) {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password"
      });
    }

    // Update user status to online
    await UserModel.findByIdAndUpdate(user._id, { 
      status: 'online',
      lastSeen: new Date()
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
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
    console.log("Error in login:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Get all users (for chat selection)
async function GetAllUsers(req, res) {
  try {
    const users = await UserModel.find({ isActive: true })
      .select("-password")
      .sort({ name: 1 });

    res.status(200).json({
      status: true,
      message: "Users fetched successfully",
      users
    });
  } catch (error) {
    console.log("Error fetching users:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Update user profile
async function UpdateProfile(req, res) {
  try {
    const { name, profile_img } = req.body;
    const userId = req.user.userId;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { name, profile_img },
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
    console.log("Error updating profile:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Get online users
async function GetOnlineUsers(req, res) {
  try {
    // This will be enhanced when we integrate with Socket.IO service
    const onlineUsers = await UserModel.find({ 
      status: 'online',
      isActive: true 
    }).select("-password");

    res.status(200).json({
      status: true,
      message: "Online users fetched successfully",
      onlineUsers
    });
  } catch (error) {
    console.log("Error fetching online users:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Search users
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
    console.log("Error searching users:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Update User
async function UpdateUser(req, res) {
  try {
    const { name, email, bio, profile_img } = req.body;
    const userId = req.user.userId;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await UserModel.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          status: false,
          message: "Email already exists"
        });
      }
    }

    // Update user data
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
    console.log("Error updating user:", error);
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
