const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');
const UserRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');
const User = require('./models/User');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// MongoDB connection
connectDB().then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

app.use(cookieParser());

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000, // Increase ping timeout to prevent premature disconnects
  pingInterval: 25000  // Interval to check connection
});

// Add authentication middleware for Socket.io
io.use(async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.token;

    if (!token) {
      return next(new Error('No token found'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('User not found'));
    }

    // Attach user to socket instance
    socket.user = user;
    next();
  } catch (err) {
    console.error('Socket auth error:', err.message);
    next(new Error('Authentication error'));
  }
});

// Track active connections for monitoring
let activeConnections = 0;

// Socket.io connection handler
io.on('connection', (socket) => {
  activeConnections++;
  console.log(`Client connected: ${socket.id}. Total connections: ${activeConnections}`);

  // Join a room based on user ID for targeted messages
  if (socket.user) {
    socket.join(`user:${socket.user._id}`);
    console.log(`User ${socket.user.name || socket.user.email} joined their room`);
  }

  // Handle ping from client to ensure connection is alive
  socket.on('ping', (callback) => {
    if (typeof callback === 'function') {
      callback({ status: 'ok', timestamp: new Date().toISOString() });
    }
  });

  // Handle client requesting server status
  socket.on('checkServerStatus', (callback) => {
    if (typeof callback === 'function') {
      callback({
        status: 'online',
        connections: activeConnections,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    }
  });

  socket.on('disconnect', (reason) => {
    activeConnections--;
    console.log(`Client disconnected: ${socket.id}. Reason: ${reason}. Total connections: ${activeConnections}`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Add io to request object 
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    connections: activeConnections,
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', UserRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in production, just log the error
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});