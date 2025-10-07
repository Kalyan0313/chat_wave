const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Access token required"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid token"
      });
    }

    req.user = { userId: user._id.toString() };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      status: false,
      message: "Invalid token"
    });
  }
};

module.exports = { authenticateToken };
