# Chat Wave - Backend API

## Part 1: Backend Foundation Complete ✅
## Part 2: Real-time Communication Setup Complete ✅

### Features Implemented:

#### Part 1 - Backend Foundation:
- ✅ User Registration with validation
- ✅ User Login with JWT authentication
- ✅ Password hashing with bcrypt
- ✅ User profile management
- ✅ Get all users endpoint
- ✅ JWT middleware for protected routes
- ✅ Input validation with express-validator
- ✅ Database models (User, Chat, Message)
- ✅ Socket.IO basic setup
- ✅ Error handling middleware

#### Part 2 - Real-time Communication:
- ✅ Complete Chat Management System
- ✅ Real-time Messaging with Socket.IO
- ✅ Online/Offline Status Tracking
- ✅ Message Broadcasting
- ✅ Typing Indicators
- ✅ Message Read Status
- ✅ Group Chat Functionality
- ✅ Message Search
- ✅ Unread Message Count
- ✅ Socket.IO Authentication

### API Endpoints:

#### User Routes:
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login user
- `GET /api/v1/users/users` - Get all users (protected)
- `GET /api/v1/users/online` - Get online users (protected)
- `PUT /api/v1/users/profile` - Update user profile (protected)

#### Chat Routes (all protected):
- `POST /api/v1/chats` - Create or get one-on-one chat
- `GET /api/v1/chats` - Get all chats for user
- `POST /api/v1/chats/group` - Create group chat
- `PUT /api/v1/chats/group/rename` - Rename group chat
- `PUT /api/v1/chats/group/add-user` - Add user to group
- `PUT /api/v1/chats/group/remove-user` - Remove user from group

#### Message Routes (all protected):
- `POST /api/v1/messages` - Send a message
- `GET /api/v1/messages/:chatId` - Get messages for a chat
- `PUT /api/v1/messages/mark-read` - Mark messages as read
- `GET /api/v1/messages/unread/count` - Get unread message count
- `GET /api/v1/messages/search` - Search messages

### Setup Instructions:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```env
   # Server Configuration
   PORT=3002
   NODE_ENV=development

   # Database Configuration
   MongoDB_URI=mongodb://localhost:27017/chat_wave

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

   # Client URL (for CORS)
   CLIENT_URL=http://localhost:5173
   ```

   **⚠️ CRITICAL:** You must create this `.env` file manually in the `server` directory for the application to work!

3. **Start MongoDB:**
   Make sure MongoDB is running on your system

4. **Run the server:**
   ```bash
   npm run dev
   ```

### Testing the API:

#### Register a new user:
```bash
curl -X POST http://localhost:3002/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:3002/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

#### Get all users (with JWT token):
```bash
curl -X GET http://localhost:3002/api/v1/users/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Create a chat:
```bash
curl -X POST http://localhost:3002/api/v1/chats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_TO_CHAT_WITH"
  }'
```

#### Send a message:
```bash
curl -X POST http://localhost:3002/api/v1/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, how are you?",
    "chatId": "CHAT_ID"
  }'
```

### Database Models:

#### User Model:
- name, email, password (hashed)
- profile_img, status (online/offline)
- lastSeen, isActive
- timestamps

#### Chat Model:
- chatName, isGroupChat
- users (array of user IDs)
- latestMessage, groupAdmin
- timestamps

#### Message Model:
- sender, content, chat
- readBy (array of user IDs)
- messageType (text/image/file/audio)
- fileUrl, fileName, fileSize
- timestamps

### Socket.IO Events:

#### Client to Server:
- `authenticate` - Authenticate user with JWT token
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `mark_messages_read` - Mark messages as read

#### Server to Client:
- `authenticated` - Authentication successful
- `auth_error` - Authentication failed
- `new_message` - New message received
- `message_notification` - Message notification
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `messages_read` - Messages marked as read
- `user_online` - User came online
- `user_offline` - User went offline
- `error` - Error occurred

### Next Steps (Part 3):
- React frontend setup
- Authentication UI
- Chat interface
- Real-time messaging UI
- User management interface
