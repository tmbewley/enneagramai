const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle typing status
    socket.on('typing_start', (data) => {
      socket.broadcast.emit('user_typing', {
        userId: data.userId,
        typing: true
      });
    });

    socket.on('typing_end', (data) => {
      socket.broadcast.emit('user_typing', {
        userId: data.userId,
        typing: false
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
};
