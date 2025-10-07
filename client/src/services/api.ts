import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if user was previously authenticated (has token)
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // If no token, it's likely a login/register failure, don't redirect
    }
    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  register: (userData: { name: string; email: string; password: string; profile_img?: string }) =>
    api.post('/users/register', userData),
  
  login: (credentials: { email: string; password: string }) =>
    api.post('/users/login', credentials),
  
  getUsers: () =>
    api.get('/users/users'),
  
  getOnlineUsers: () =>
    api.get('/users/online'),
  
  searchUsers: (query: string) =>
    api.get(`/users/search?query=${query}`),
  
  updateProfile: (profileData: { name?: string; profile_img?: string }) =>
    api.put('/users/profile', profileData),
  
  updateUser: (userData: { name?: string; email?: string; bio?: string; profile_img?: string }) =>
    api.put('/users/update', userData),
  
  forgotPassword: (email: { email: string }) =>
    api.post('/users/forgot-password', email),
  
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/users/reset-password', data),
};

// Chat API
export const chatAPI = {
  createChat: (userId: string) =>
    api.post('/chats', { userId }),
  
  getUserChats: () =>
    api.get('/chats'),
  
  createGroupChat: (chatData: { chatName: string; users: string[] }) =>
    api.post('/chats/group', chatData),
  
  renameGroupChat: (chatData: { chatId: string; chatName: string }) =>
    api.put('/chats/group/rename', chatData),
  
  addUserToGroup: (chatData: { chatId: string; userId: string }) =>
    api.put('/chats/group/add-user', chatData),
  
  removeUserFromGroup: (chatData: { chatId: string; userId: string }) =>
    api.put('/chats/group/remove-user', chatData),
};

// Message API
export const messageAPI = {
  getMessages: (chatId: string, page?: number, limit?: number) =>
    api.get(`/messages/${chatId}?page=${page || 1}&limit=${limit || 50}`),
  
  markMessagesAsRead: (chatId: string) =>
    api.put('/messages/mark-read', { chatId }),
  
  getUnreadCount: () =>
    api.get('/messages/unread/count'),
  
  searchMessages: (query: string, chatId?: string) =>
    api.get(`/messages/search?query=${query}${chatId ? `&chatId=${chatId}` : ''}`),
};

export default api;
