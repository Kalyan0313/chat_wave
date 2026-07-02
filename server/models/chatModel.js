const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  chatName: {
    type: String,
    trim: true,
    maxLength: [100, "Chat name cannot exceed 100 characters"]
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

// Index for better query performance
chatSchema.index({ users: 1, updatedAt: -1 }); // User's chats sorted by recent activity
chatSchema.index({ isGroupChat: 1, updatedAt: -1 }); // Filter group/direct chats
chatSchema.index({ users: 1, isGroupChat: 1 }); // Combined filter
chatSchema.index({ updatedAt: -1 }); // Sort by recent activity

module.exports = mongoose.model("Chat", chatSchema);
