const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/socket/socket');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 TaskFlow Pro server running on port ${PORT}`);
});
