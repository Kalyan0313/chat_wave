const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
  const dbURI = process.env.MongoDB_URI;
  if (!dbURI) {
    throw new Error("MongoDB_URI is not defined in environment variables");
  }

  await mongoose.connect(dbURI, {
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    family: 4
  });

  console.log("MongoDB connected successfully");
};

module.exports = connectDB;
