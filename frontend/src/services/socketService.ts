import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
      
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Typing indicator methods
  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('leave_room', roomId);
    }
  }

  emitTypingStart(userId: string, roomId: string) {
    if (this.socket) {
      this.socket.emit('typing_start', { userId, roomId });
    }
  }

  emitTypingEnd(userId: string, roomId: string) {
    if (this.socket) {
      this.socket.emit('typing_end', { userId, roomId });
    }
  }

  onUserTyping(callback: (data: { userId: string; roomId: string; typing: boolean }) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  // Cleanup method
  removeTypingListener() {
    if (this.socket) {
      this.socket.off('user_typing');
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
