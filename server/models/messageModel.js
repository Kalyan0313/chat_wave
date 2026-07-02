const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: function () {
      return !this.fileUrl; // Content is required if no file
    },
    trim: true,
    maxLength: [1000, "Message content cannot exceed 1000 characters"]
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true
  },
  messageType: {
    type: String,
    enum: ["text", "image", "file", "audio", "video"],
    default: "text"
  },
  fileUrl: {
    type: String,
    default: ""
  },
  fileName: {
    type: String,
    default: ""
  },
  fileSize: {
    type: Number,
    default: 0
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, {
  timestamps: true
});

// Index for better query performance
messageSchema.index({ chat: 1, createdAt: -1 }); // Most common query: messages by chat, sorted by time
messageSchema.index({ chat: 1, createdAt: -1, readBy: 1 }); // For unread messages queries
messageSchema.index({ sender: 1, createdAt: -1 }); // For user's message history
messageSchema.index({ messageType: 1 }); // For filtering by message type
messageSchema.index({ chat: 1, sender: 1 }); // For chat-specific user messages

module.exports = mongoose.model("Message", messageSchema);
