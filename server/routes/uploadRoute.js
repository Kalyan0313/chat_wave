const express = require('express');
const router = express.Router();
const { uploadFile, deleteFile } = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Upload file (protected route)
router.post('/upload', authenticateToken, upload.single('file'), uploadFile);

// Delete file (protected route)
router.delete('/delete/:filename', authenticateToken, deleteFile);

module.exports = router;
