# Chat Wave - Backend Server

This is the backend service for Chat Wave, providing a REST API and Socket.IO real-time messaging capabilities.

## Architecture & Design Decisions

- **Database & Indexing:** Uses MongoDB with Mongoose. Fields frequently queried (like chat lookups and message timestamps) are indexed for speed.
- **In-Memory Caching:** Includes a lightweight caching layer for session and configuration data to reduce database hits.
- **Real-time Engine:** Built on Socket.IO. Currently configured for single-instance scale, but can be scaled horizontally with a Redis adapter.
- **Graceful Shutdown:** Cleans up database connections, active socket connections, and server listeners when receiving termination signals (SIGINT/SIGTERM).

## Setup & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the server directory. You can use `.env.example` as a template:
```bash
cp .env.example .env
```

Ensure the following variables are defined:
- `PORT`: Server port (defaults to `3002`)
- `MongoDB_URI`: Connection string for MongoDB (local or Atlas)
- `JWT_SECRET`: Secret key used to sign JSON Web Tokens
- `CLIENT_URL`: URL of the client application (for CORS configuration)

### 3. Start the Server

**Development Mode (auto-reloads on file changes):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

## API & Testing

### Health & Metrics
- `GET /health` - Returns 200 OK if the server is healthy and connected to MongoDB.
- `GET /metrics` - Returns basic server metrics (memory usage, active socket connections, uptime).

### Rate Limits
The server enforces rate limiting to prevent spam and abuse:
- **General API:** 100 requests per 15 minutes per IP.
- **Authentication:** 5 login/registration requests per 15 minutes per IP.
- **Messages:** 30 messages per minute per user.
- **Uploads:** 10 file uploads per hour per user.

## Troubleshooting

### Port already in use
If you see an error like `EADDRINUSE`, the port (default `3002`) is being used by another process. You can change the port in your `.env` file or kill the existing process.

### MongoDB Connection Failures
Ensure that your MongoDB daemon is running locally (`mongod`) or that your network has access to the Atlas cluster configured in your `MongoDB_URI`.
