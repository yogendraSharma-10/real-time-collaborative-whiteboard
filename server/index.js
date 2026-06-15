require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const config = require('./config');
const authMiddleware = require('./middleware/auth');
const whiteboardSessionService = require('./services/whiteboardSession');

const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: config.clientUrl, // Allow requests from the client URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Whiteboard Service', version: '1.0.0' });
});

// Authentication routes (placeholder - actual implementation might be in a dedicated auth service)
// For this project, we'll simulate basic auth for session creation/joining.
app.post('/api/auth/login', (req, res) => {
  // In a real app, this would validate credentials and return a JWT
  const { username, password } = req.body;
  if (username && password) { // Basic check
    const token = `mock-jwt-for-${username}`; // Mock token
    const userId = `user-${username}`; // Mock user ID
    res.status(200).json({ message: 'Login successful', token, userId });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  // In a real app, this would create a new user
  const { username, password } = req.body;
  if (username && password) {
    res.status(201).json({ message: 'Registration successful', username });
  } else {
    res.status(400).json({ message: 'Username and password are required' });
  }
});

// Whiteboard session management routes
// All session routes require authentication
app.use('/api/sessions', authMiddleware.authenticateToken);

// Create a new whiteboard session
app.post('/api/sessions', (req, res) => {
  const { name, description } = req.body;
  const ownerId = req.user.userId; // userId from auth middleware
  if (!name) {
    return res.status(400).json({ message: 'Session name is required.' });
  }
  const newSession = whiteboardSessionService.createSession(name, description, ownerId);
  res.status(201).json(newSession);
});

// Get all available whiteboard sessions
app.get('/api/sessions', (req, res) => {
  const sessions = whiteboardSessionService.getAllSessions();
  res.status(200).json(sessions);
});

// Get a specific whiteboard session by ID
app.get('/api/sessions/:id', (req, res) => {
  const { id } = req.params;
  const session = whiteboardSessionService.getSession(id);
  if (session) {
    res.status(200).json(session);
  } else {
    res.status(404).json({ message: 'Session not found.' });
  }
});

// Placeholder for cross-project integration (e.g., fetching user profiles from Social Media Dashboard)
app.get('/api/users/:userId/profile', authMiddleware.authenticateToken, (req, res) => {
  // This endpoint could proxy a request to the Micro Social Media Dashboard
  // or fetch cached user data relevant to the whiteboard.
  console.log(`Attempting to fetch profile for user: ${req.params.userId} from Social Media Dashboard.`);
  res.status(200).json({
    message: `User profile for ${req.params.userId} (simulated from Social Media Dashboard)`,
    userId: req.params.userId,
    username: `user_${req.params.userId}`,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${req.params.userId}`,
    // Add more profile data as needed
  });
});

// --- WebSocket Setup ---
const io = new Server(server, {
  cors: {
    origin: config.clientUrl, // Allow WebSocket connections from the client URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Optional: Path for the WebSocket server
  path: '/ws',
});

// WebSocket authentication middleware (simplified for example)
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (token && token.startsWith('mock-jwt-for-')) {
    // In a real app, verify JWT and extract user info
    socket.user = {
      userId: token.replace('mock-jwt-for-', 'user-'),
      username: token.replace('mock-jwt-for-', ''),
    };
    next();
  } else {
    console.warn('WebSocket connection denied: No valid token provided.');
    next(new Error('Authentication error: No valid token.'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.user.username} (${socket.user.userId}) connected via WebSocket.`);

  // Event: Client wants to join a specific whiteboard session
  socket.on('joinSession', (sessionId) => {
    if (!sessionId) {
      console.warn(`User ${socket.user.username} tried to join without a sessionId.`);
      return socket.emit('sessionError', 'Session ID is required.');
    }

    const session = whiteboardSessionService.getSession(sessionId);
    if (!session) {
      console.warn(`User ${socket.user.username} tried to join non-existent session: ${sessionId}`);
      return socket.emit('sessionError', 'Session not found.');
    }

    // Add user to the session and Socket.IO room
    whiteboardSessionService.addUserToSession(sessionId, socket.user.userId, socket.user.username);
    socket.join(sessionId);
    socket.sessionId = sessionId; // Store session ID on the socket for easy access

    console.log(`User ${socket.user.username} joined session: ${sessionId}`);

    // Emit the current state of the whiteboard to the joining user
    socket.emit('sessionState', session.canvasHistory);

    // Notify others in the session that a new user has joined
    io.to(sessionId).emit('userJoined', {
      userId: socket.user.userId,
      username: socket.user.username,
      activeUsers: whiteboardSessionService.getActiveUsersInSession(sessionId),
    });
  });

  // Event: Client sends drawing data
  socket.on('drawing', (data) => {
    const { sessionId } = socket;
    if (sessionId) {
      // Add drawing action to session history
      whiteboardSessionService.addDrawingAction(sessionId, data);
      // Broadcast drawing data to all other clients in the same session
      socket.to(sessionId).emit('drawing', data);
    }
  });

  // Event: Client sends erasing data
  socket.on('erasing', (data) => {
    const { sessionId } = socket;
    if (sessionId) {
      // Add erasing action to session history
      whiteboardSessionService.addDrawingAction(sessionId, data); // Erasing is also a drawing action
      // Broadcast erasing data to all other clients in the same session
      socket.to(sessionId).emit('erasing', data);
    }
  });

  // Event: Client wants to clear the canvas
  socket.on('clearCanvas', () => {
    const { sessionId } = socket;
    if (sessionId) {
      whiteboardSessionService.clearCanvas(sessionId);
      // Broadcast clear canvas event to all clients in the same session
      io.to(sessionId).emit('clearCanvas');
      console.log(`Session ${sessionId} canvas cleared by ${socket.user.username}.`);
    }
  });

  // Event: Client disconnects
  socket.on('disconnect', () => {
    const { sessionId } = socket;
    if (sessionId) {
      whiteboardSessionService.removeUserFromSession(sessionId, socket.user.userId);
      console.log(`User ${socket.user.username} left session: ${sessionId}`);
      // Notify others in the session that a user has left
      io.to(sessionId).emit('userLeft', {
        userId: socket.user.userId,
        username: socket.user.username,
        activeUsers: whiteboardSessionService.getActiveUsersInSession(sessionId),
      });
    }
    console.log(`User ${socket.user.username} (${socket.user.userId}) disconnected.`);
  });

  // Generic error handling for socket
  socket.on('error', (err) => {
    console.error(`Socket error for user ${socket.user?.username || 'unknown'}:`, err);
  });
});

// --- Serve React Client Static Files ---
// In production, serve the static files of the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  // For any other GET request, serve the React app's index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
} else {
  console.log('Running in development mode. Client served by Webpack Dev Server.');
}

// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'An unexpected error occurred.',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// --- Start Server ---
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`Whiteboard server running on port ${PORT}`);
  console.log(`Client URL: ${config.clientUrl}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});