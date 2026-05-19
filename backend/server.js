const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/socket/socket');
const authRoutes = require ("./src/routes/authRoutes")
require('dotenv').config();

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);
initSocket(server);

const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5173',
  'https://enterprise-task-management.vercel.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman/mobile)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.options('*', cors());
app.use('/api/auth', authRoutes);

server.listen(PORT, () => {
  console.log(`🚀 TaskFlow Pro server running on port ${PORT}`);
});
