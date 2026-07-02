# Chat Wave

A real-time chat application built with React, Node.js, Socket.IO, and MongoDB. It supports direct messaging, group chats, file sharing, online status indicators, and typing indicators.

## Features

- **Real-time Messaging:** Fast message delivery and synchronization via Socket.IO.
- **Conversations:** One-on-one and group chats with member management.
- **File Sharing:** Support for uploading images, documents, audio, and video.
- **Presence & Indicators:** Real-time online status and typing indicators.
- **Search:** Search across messages and user list.
- **Security:** JWT authentication, rate limiting, input validation, and password hashing with bcrypt.
- **Responsive UI:** Clean, responsive interface built with Material UI.

## Project Structure

```
chat_wave/
├── client/          # React frontend (Vite, TypeScript, Material UI)
├── server/          # Node.js Express backend (Socket.IO, MongoDB)
└── Documentation/   # Additional test reports and guides
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or a MongoDB Atlas URI)
- npm or yarn

### 1. Setup the Server

1. Navigate to the server folder and install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Copy the template environment file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your configuration (e.g., `MongoDB_URI` and `JWT_SECRET`).
4. Start the server in development mode:
   ```bash
   npm run dev
   ```

### 2. Setup the Client

1. Navigate to the client folder and install dependencies:
   ```bash
   cd client
   npm install
   ```
2. Copy the template environment file:
   ```bash
   cp .env.example .env
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

Once both servers are running, open your browser and navigate to `http://localhost:5173`.

## API Reference

The backend exposes the following key endpoints:

### Auth & Users
- `POST /api/v1/users/register` - Create a new account
- `POST /api/v1/users/login` - Authenticate and receive a JWT
- `GET /api/v1/users/users` - List all users
- `GET /api/v1/users/online` - List online users
- `PUT /api/v1/users/profile` - Update user profile

### Chats & Groups
- `GET /api/v1/chats` - Retrieve all chats for the authenticated user
- `POST /api/v1/chats` - Create a new chat or retrieve an existing one
- `POST /api/v1/chats/group` - Create a group chat
- `PUT /api/v1/chats/group/add-user` - Add a user to a group chat
- `PUT /api/v1/chats/group/remove-user` - Remove a user from a group chat

### Messages
- `POST /api/v1/messages` - Send a message to a chat
- `GET /api/v1/messages/:chatId` - Retrieve messages for a specific chat
- `GET /api/v1/messages/search` - Search message history

### Files
- `POST /api/v1/upload/upload` - Upload a file (images, docs, audio, video)
- `DELETE /api/v1/upload/delete/:filename` - Delete a previously uploaded file

## Documentation & Guides

For more details on specific topics, refer to:
- [Quick Start Guide](Documentation/QUICK_START.md) - Detailed setup steps and troubleshooting.
- [Deployment Guide](Documentation/DEPLOYMENT_GUIDE.md) - Recommendations for production deployment.
- [Test Report](Documentation/TEST_REPORT.md) - Comprehensive manual and automated test results.

---

ISC License.
