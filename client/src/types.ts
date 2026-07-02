export interface User {
  _id: string;
  name: string;
  email: string;
  profile_img: string;
  status: 'online' | 'offline';
  lastSeen: string;
  isActive?: boolean;
}

export interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: User[];
  latestMessage?: Message;
  groupAdmin?: User;
  unreadCount?: { [userId: string]: number };
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat | string;
  readBy: User[];
  messageType: 'text' | 'image' | 'file' | 'audio';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  profile_img?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface TypingUser {
  chatId: string;
  userId: string;
  userName: string;
}

export interface ChatState {
  chats: Chat[];
  users: User[];
  onlineUsers: User[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  typingUsers: TypingUser[];
  socketConnected: boolean;
}
