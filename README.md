# HackerNews Clone - Simple Example App

A minimalist Hacker News clone built for vibe coding demonstrations.

## Features

- Browse posts with scores and comment counts
- View post details with comments
- Submit new posts (with URL or text content)
- Add comments to posts
- Upvote posts
- SQLite database with seed data
- Hot-reloading for both frontend and backend

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run the application**:

   ```bash
   npm start [PORT_NUMBER]
   ```

   The PORT_NUMBER parameter determines which ports to use:

   - Frontend will run on `3000 + PORT_NUMBER`
   - Backend will run on `8000 + PORT_NUMBER`

   Examples:

   - `npm start` or `npm start 0` → Frontend: 3000, Backend: 8000
   - `npm start 1` → Frontend: 3001, Backend: 8001
   - `npm start 2` → Frontend: 3002, Backend: 8002

3. **Access the app**:
   Open your browser to the frontend URL (e.g., http://localhost:3001 if you used `npm start 1`)

4. **Health check** (optional):

   ```bash
   ./healthcheck.sh [PORT_NUMBER]
   ```

   Run this to verify both frontend and backend are running correctly. Uses the same PORT_NUMBER as the app.

   - Returns exit code 0 if all checks pass
   - Returns exit code 1 if any check fails

## How It Works

- The database (`backend/database.db`) is created and seeded automatically on first run
- Hot-reloading is enabled for both frontend (Vite) and backend (nodemon)
- The database persists across hot-reloads - only frontend and backend code changes trigger reloads
- No authentication required - all features are publicly accessible

## Project Structure

```
.
├── backend/
│   ├── server.js       # Express API server
│   └── db.js          # SQLite database setup & seed data
├── src/
│   ├── App.jsx        # Main React component
│   ├── components/    # React components
│   └── *.css          # Styling
├── run.js             # Startup script
└── package.json       # Dependencies & scripts
```

## API Endpoints

- `GET /api` - Health check endpoint (returns "Healthy")
- `GET /api/posts` - List all posts
- `GET /api/posts/:id` - Get post with comments
- `POST /api/posts` - Create new post
- `POST /api/posts/:id/comments` - Add comment
- `POST /api/posts/:id/upvote` - Upvote post

## Health Check

The `healthcheck.sh` script performs the following checks:

1. ✓ Backend health endpoint returns "Healthy"
2. ✓ Frontend server is responding
3. ✓ Frontend HTML contains expected content
4. ✓ Frontend JavaScript module is loading
5. ✓ Frontend-backend connectivity (CORS)

This is useful for CI/CD pipelines, monitoring, or just verifying the app is working correctly.
