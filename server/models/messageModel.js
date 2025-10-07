const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: function() {
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
messageSchema.index({ chat: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ messageType: 1 });

module.exports = mongoose.model("Message", messageSchema);
