const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
  try {
    const dbURI = process.env.MongoDB_URI;
    if (!dbURI) {
      throw new Error("MongoDB_URI is not defined in environment variables");
    }
    
    await mongoose.connect(dbURI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
