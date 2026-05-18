const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(socket.userId);
    console.log(`Socket connected: ${socket.userId}`);

    socket.on('join-company', (companyId) => {
      socket.join(`company-${companyId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
