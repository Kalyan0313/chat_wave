const express = require('express');
const router = express.Router();
const { uploadFile, deleteFile } = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: false,
        message: 'File size exceeds the maximum limit of 10MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: false,
        message: 'Too many files uploaded'
      });
    }
    if (err.message && err.message.includes('Invalid file type')) {
      return res.status(400).json({
        status: false,
        message: err.message
      });
    }
    return res.status(400).json({
      status: false,
      message: err.message || 'File upload error'
    });
  }
  next();
};

// Upload file (protected route)
router.post('/upload', authenticateToken, uploadLimiter, upload.single('file'), handleMulterError, uploadFile);

// Delete file (protected route)
router.delete('/delete/:filename', authenticateToken, deleteFile);

module.exports = router;
