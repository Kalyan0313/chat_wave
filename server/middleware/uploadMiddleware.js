const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent path traversal and special characters
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `file-${uniqueSuffix}-${sanitizedName}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Get file extension (lowercase, with dot)
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  // Allowed file extensions
  const allowedExtensions = [
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    // Documents
    '.pdf', '.doc', '.docx', '.txt', '.rtf',
    // Audio
    '.mp3', '.wav', '.ogg', '.m4a', '.aac',
    // Video
    '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'
  ];

  // Check if extension is allowed
  if (allowedExtensions.includes(fileExt)) {
    // Also validate mimetype for additional security
    const allowedMimeTypes = [
      'image/', 'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/', 'audio/', 'video/'
    ];
    
    const isValidMimeType = allowedMimeTypes.some(type => file.mimetype.startsWith(type));
    
    if (isValidMimeType) {
      return cb(null, true);
    }
  }
  
  cb(new Error('Invalid file type. Only images, documents, audio, and video files are allowed.'));
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
