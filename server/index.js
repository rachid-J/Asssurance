const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); // Added missing JWT import
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
connectDB();
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
  transports: ['websocket', 'polling'], // Add explicit transports
  allowEIO3: true // For legacy compatibility
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

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Add io to request object - Add this middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes - These should come after adding io to the request
app.use('/api/auth', authRoutes);
app.use('/api/users', UserRoutes);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

io.of('/').use(async (socket, next) => {
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

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Status namespace (no authentication)
const statusNamespace = io.of('/status');
statusNamespace.on('connection', (socket) => {
  console.log('Status client connected:', socket.id);
  socket.emit('status', 'online');
  socket.on('disconnect', () => {
    console.log('Status client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT ;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});