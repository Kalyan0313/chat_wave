const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxLength: [50, "Name cannot exceed 50 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [6, "Password must be at least 6 characters"]
  },
  profile_img: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    maxLength: [200, "Bio cannot exceed 200 characters"],
    default: ""
  },
  status: {
    type: String,
    enum: ["online", "offline", "away"],
    default: "offline"
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ status: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model("User", userSchema);
