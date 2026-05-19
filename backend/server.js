require('dotenv').config();

const http = require('http');

const app = require('./src/app');
const { initSocket } = require('./src/socket/socket');
const authRoutes = require('./src/routes/authRoutes');

const PORT = process.env.PORT || 5001;

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