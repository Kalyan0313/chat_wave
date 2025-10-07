const mongoose = require('mongoose');
const UserModel = require('./models/userModel');
const ChatModel = require('./models/chatModel');
const MessageModel = require('./models/messageModel');
require('dotenv').config();

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MongoDB_URI);
    console.log('✅ Connected to database');

    // Clear all collections
    await UserModel.deleteMany({});
    await ChatModel.deleteMany({});
    await MessageModel.deleteMany({});
    
    console.log('🗑️ Database cleared successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearDatabase();
