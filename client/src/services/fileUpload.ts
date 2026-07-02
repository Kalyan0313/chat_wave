import { messageAPI } from './api';

export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api/v1';
const SERVER_URL = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:3002';

export const uploadFile = async (file: File): Promise<FileUploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }

    const response = await fetch(`${API_BASE_URL}/upload/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.status) {
      return {
        success: true,
        fileUrl: `${SERVER_URL}${data.fileData.fileUrl}`,
        fileName: data.fileData.fileName,
        fileSize: data.fileData.fileSize,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Upload failed',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to upload file',
    };
  }
};

export const uploadImage = async (file: File): Promise<FileUploadResult> => {
  try {
    // Validate image file
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Please select a valid image file',
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Image size must be less than 5MB',
      };
    }

    return await uploadFile(file);
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: 'Failed to upload image',
    };
  }
};

export const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const audioTypes = ['mp3', 'wav', 'ogg', 'm4a'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  
  if (imageTypes.includes(extension || '')) return 'image';
  if (audioTypes.includes(extension || '')) return 'audio';
  if (videoTypes.includes(extension || '')) return 'video';
  if (documentTypes.includes(extension || '')) return 'file';
  
  return 'file';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

