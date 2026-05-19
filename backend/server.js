require('dotenv').config();

const http = require('http');
const cors = require('cors');

const app = require('./src/app');
const { initSocket } = require('./src/socket/socket');
const authRoutes = require('./src/routes/authRoutes');

const PORT = process.env.PORT || 5001;

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://enterprise-task-management.vercel.app'
];

// CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman, mobile apps, server-to-server requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Handle preflight requests
app.options('*', cors());

// Routes
app.use('/api/auth', authRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 TaskFlow Pro server running on port ${PORT}`);
});