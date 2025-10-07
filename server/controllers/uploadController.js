const path = require('path');
const fs = require('fs');

// Upload file
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
    
    // Get file type based on extension
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
    console.log("Error uploading file:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
}

// Delete file
async function deleteFile(req, res) {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({
        status: true,
        message: "File deleted successfully"
      });
    } else {
      res.status(404).json({
        status: false,
        message: "File not found"
      });
    }
  } catch (error) {
    console.log("Error deleting file:", error);
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
