import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatAPI, messageAPI, userAPI } from '../../services/api';
import { User, Chat, Message, ChatState, TypingUser } from '../../types';

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  users: [],
  onlineUsers: [],
  typingUsers: [],
  loading: false,
  error: null,
};

// Async thunks
export const loadChats = createAsyncThunk(
  'chat/loadChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getUserChats();
      if (response.data.status) {
        return response.data.chats;
      } else {
        return rejectWithValue(response.data.message || 'Failed to load chats');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load chats');
    }
  }
);

export const loadMessages = createAsyncThunk(
  'chat/loadMessages',
  async (chatId: string, { rejectWithValue }) => {
    try {
      const response = await messageAPI.getMessages(chatId);
      if (response.data.status) {
        return response.data.messages;
      } else {
        return rejectWithValue(response.data.message || 'Failed to load messages');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load messages');
    }
  }
);

export const loadUsers = createAsyncThunk(
  'chat/loadUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUsers();
      if (response.data.status) {
        return response.data.users;
      } else {
        return rejectWithValue(response.data.message || 'Failed to load users');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load users');
    }
  }
);

export const loadOnlineUsers = createAsyncThunk(
  'chat/loadOnlineUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getOnlineUsers();
      if (response.data.status) {
        return response.data.onlineUsers;
      } else {
        return rejectWithValue(response.data.message || 'Failed to load online users');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load online users');
    }
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await chatAPI.createChat(userId);
      if (response.data.status) {
        return response.data.chat;
      } else {
        return rejectWithValue(response.data.message || 'Failed to create chat');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create chat');
    }
  }
);

export const createGroupChat = createAsyncThunk(
  'chat/createGroupChat',
  async (chatData: { chatName: string; users: string[] }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.createGroupChat(chatData);
      if (response.data.status) {
        return response.data.chat;
      } else {
        return rejectWithValue(response.data.message || 'Failed to create group chat');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create group chat');
    }
  }
);


const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action: PayloadAction<Chat | null>) => {
      state.currentChat = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      
      // Update latest message in chat
      const chatIndex = state.chats.findIndex(chat => chat._id === action.payload.chat);
      if (chatIndex !== -1) {
        state.chats[chatIndex].latestMessage = action.payload;
      }
    },
    updateChat: (state, action: PayloadAction<Chat>) => {
      const index = state.chats.findIndex(chat => chat._id === action.payload._id);
      if (index !== -1) {
        state.chats[index] = action.payload;
      } else {
        state.chats.unshift(action.payload);
      }
    },
    setTypingUsers: (state, action: PayloadAction<TypingUser[]>) => {
      state.typingUsers = action.payload;
    },
    addTypingUser: (state, action: PayloadAction<{ chatId: string; userId: string; userName: string }>) => {
      const { chatId, userId, userName } = action.payload;
      const existingIndex = state.typingUsers.findIndex(
        user => user.userId === userId && user.chatId === chatId
      );
      if (existingIndex === -1) {
        state.typingUsers.push({ chatId, userId, userName });
      }
    },
    removeTypingUser: (state, action: PayloadAction<{ chatId: string; userId: string }>) => {
      const { chatId, userId } = action.payload;
      state.typingUsers = state.typingUsers.filter(
        user => !(user.userId === userId && user.chatId === chatId)
      );
    },
    updateUserStatus: (state, action: PayloadAction<{ userId: string; status: 'online' | 'offline' }>) => {
      const { userId, status } = action.payload;
      
      // Update in users array
      const userIndex = state.users.findIndex(user => user._id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].status = status;
      }
      
      // Update in online users array
      if (status === 'online') {
        const exists = state.onlineUsers.find(user => user._id === userId);
        if (!exists) {
          const user = state.users.find(user => user._id === userId);
          if (user) {
            state.onlineUsers.push({ ...user, status: 'online' });
          }
        }
      } else {
        state.onlineUsers = state.onlineUsers.map(user => 
          user._id === userId ? { ...user, status: 'offline' } : user
        );
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Chats
      .addCase(loadChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(loadChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Load Users
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      
      // Load Online Users
      .addCase(loadOnlineUsers.fulfilled, (state, action) => {
        state.onlineUsers = action.payload;
      })
      
      // Create Chat
      .addCase(createChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.loading = false;
        state.chats.unshift(action.payload);
        state.currentChat = action.payload;
      })
      .addCase(createChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Group Chat
      .addCase(createGroupChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroupChat.fulfilled, (state, action) => {
        state.loading = false;
        state.chats.unshift(action.payload);
        state.currentChat = action.payload;
      })
      .addCase(createGroupChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Load Messages
      .addCase(loadMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(loadMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
  },
});

export const {
  setCurrentChat,
  addMessage,
  updateChat,
  setTypingUsers,
  addTypingUser,
  removeTypingUser,
  updateUserStatus,
  clearError,
  clearMessages,
} = chatSlice.actions;


export default chatSlice.reducer;
