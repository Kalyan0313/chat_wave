const path = require('path');
const fs = require('fs');

async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "No file uploaded"
      });
    }

    const file = req.file;
    const fileUrl = `/uploads/${file.filename}`;
    const fileExtension = path.extname(file.originalname).toLowerCase();
    let messageType = 'file';
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv'];
    
    if (imageExtensions.includes(fileExtension)) {
      messageType = 'image';
    } else if (audioExtensions.includes(fileExtension)) {
      messageType = 'audio';
    } else if (videoExtensions.includes(fileExtension)) {
      messageType = 'video';
    }

    res.status(200).json({
      status: true,
      message: "File uploaded successfully",
      fileData: {
        fileUrl: fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        messageType: messageType
      }
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

async function deleteFile(req, res) {
  try {
    const { filename } = req.params;
    
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        status: false,
        message: "Invalid filename"
      });
    }
    
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = path.join(__dirname, '../uploads', sanitizedFilename);
    const uploadsDir = path.resolve(__dirname, '../uploads');
    const resolvedPath = path.resolve(filePath);
    
    if (!resolvedPath.startsWith(uploadsDir)) {
      return res.status(403).json({
        status: false,
        message: "Access denied"
      });
    }
    
    try {
      await fs.promises.unlink(filePath);
      res.status(200).json({
        status: true,
        message: "File deleted successfully"
      });
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({
          status: false,
          message: "File not found"
        });
      }
      throw err;
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

module.exports = {
  uploadFile,
  deleteFile
};
