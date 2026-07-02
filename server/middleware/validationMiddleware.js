const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: errors.array()
    });
  }
  next();
};

// Validate MongoDB ObjectId
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName] || req.body[paramName] || req.query[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: `Invalid ${paramName} format`
      });
    }
    next();
  };
};

// User registration validation
const validateRegister = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Bio cannot exceed 200 characters"),
  handleValidationErrors
];

// User update validation (full update including email)
const validateUserUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Bio cannot exceed 200 characters"),
  body("profile_img")
    .optional()
    .isString()
    .withMessage("Profile image must be a valid string"),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateUserUpdate,
  validateObjectId,
  handleValidationErrors
};
