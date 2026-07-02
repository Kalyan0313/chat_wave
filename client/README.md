# Chat Wave - Frontend (React)

This is the React frontend for the Chat Wave application. It is built using TypeScript, Vite, Material UI, and Redux Toolkit.

## Key Features

- **Authentication:** JWT-based login, registration, profile updates, and protected route wrappers.
- **Real-time Updates:** Full Socket.IO integration synchronized with Redux state for instant message delivery, typing indicators, and user presence tracking.
- **State Management:** Predictable state container using Redux Toolkit, featuring async thunks for API calls.
- **Modern UI:** Responsive layout styled with Material UI components and custom CSS, featuring clean chat channels and messaging views.

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login, Registration, and ProtectedRoute components
│   ├── chat/          # ChatDashboard and chat interface components
│   ├── layout/        # Main layouts and navigation headers
│   └── providers/     # Redux and Socket context providers
├── store/
│   ├── slices/        # Auth and chat Redux state slices
│   └── store.ts       # Redux store setup
└── services/
    ├── api.ts         # Axios instance and API call functions
    └── socket.ts      # Socket.IO connection and event handlers
```

## Setup & Run

### 1. Configure Environment Variables
Create a `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:3002/api/v1
VITE_SOCKET_URL=http://localhost:3002
```
*Note: Make sure the values match the port/URL where your backend server is running.*

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.