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

    // Handle room joining
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    // Handle room leaving
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User left room: ${roomId}`);
    });

    // Handle typing status with rooms
    socket.on('typing_start', (data) => {
      const { userId, roomId } = data;
      socket.to(roomId).emit('user_typing', {
        userId,
        roomId,
        typing: true
      });
    });

    socket.on('typing_end', (data) => {
      const { userId, roomId } = data;
      socket.to(roomId).emit('user_typing', {
        userId,
        roomId,
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
