import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import Content from '../models/Content.js';
import User from '../models/User.js';
import Calendar from '../models/Calendar.js';
import Diary from '../models/Diary.js';
import Media from '../models/Media.js';
import Album from '../models/Album.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

const signaling = (io) => {
  const users = new Map(); // Map to store userId -> socketId
  const userRooms = new Map(); // Map to store userId -> Set of room names

  // Helper function to emit to user
  const emitToUser = (userId, event, data) => {
    const socketId = users.get(userId);
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  };

  // Helper function to emit to room
  const emitToRoom = (room, event, data) => {
    io.to(room).emit(event, data);
  };

  // Helper function to broadcast to all users
  const broadcastToAll = (event, data) => {
    io.emit(event, data);
  };

  io.on('connection', async (socket) => {
    console.log('a user connected');

    const token = socket.handshake.auth.token;
    if (!token) {
      console.log('No token, disconnecting socket');
      return socket.disconnect();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      users.set(socket.userId, socket.id);
      userRooms.set(socket.userId, new Set());
      console.log(`User ${socket.userId} connected with socket ${socket.id}`);
    } catch (error) {
      console.log('Invalid token, disconnecting socket');
      return socket.disconnect();
    }

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from socket ${socket.id}`);
      users.delete(socket.userId);
      userRooms.delete(socket.userId);
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    userRooms.get(socket.userId).add(`user_${socket.userId}`);

    // Content-related realtime events
    socket.on('join-content-room', (contentId) => {
      const roomName = `content_${contentId}`;
      socket.join(roomName);
      userRooms.get(socket.userId).add(roomName);
      console.log(`User ${socket.userId} joined content room ${contentId}`);
    });

    socket.on('leave-content-room', (contentId) => {
      const roomName = `content_${contentId}`;
      socket.leave(roomName);
      userRooms.get(socket.userId)?.delete(roomName);
      console.log(`User ${socket.userId} left content room ${contentId}`);
    });

    // Calendar-related realtime events
    socket.on('join-calendar-room', (calendarId) => {
      const roomName = `calendar_${calendarId}`;
      socket.join(roomName);
      userRooms.get(socket.userId).add(roomName);
      console.log(`User ${socket.userId} joined calendar room ${calendarId}`);
    });

    socket.on('leave-calendar-room', (calendarId) => {
      const roomName = `calendar_${calendarId}`;
      socket.leave(roomName);
      userRooms.get(socket.userId)?.delete(roomName);
      console.log(`User ${socket.userId} left calendar room ${calendarId}`);
    });

    // Media/Album-related realtime events
    socket.on('join-media-room', (mediaId) => {
      const roomName = `media_${mediaId}`;
      socket.join(roomName);
      userRooms.get(socket.userId).add(roomName);
      console.log(`User ${socket.userId} joined media room ${mediaId}`);
    });

    socket.on('join-album-room', (albumId) => {
      const roomName = `album_${albumId}`;
      socket.join(roomName);
      userRooms.get(socket.userId).add(roomName);
      console.log(`User ${socket.userId} joined album room ${albumId}`);
    });

    // Diary-related realtime events
    socket.on('join-diary-room', (diaryId) => {
      const roomName = `diary_${diaryId}`;
      socket.join(roomName);
      userRooms.get(socket.userId).add(roomName);
      console.log(`User ${socket.userId} joined diary room ${diaryId}`);
    });

    // Chat message events
    socket.on('sendMessage', async ({ recipientId, content }) => {
      try {
        const senderId = socket.userId;

        const newMessage = await Message.create({
          sender: senderId,
          recipient: recipientId,
          content,
        });

        // Emit to sender
        emitToUser(senderId, 'message', newMessage);

        // Emit to recipient if online
        emitToUser(recipientId, 'message', newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Generic chat message event for backward compatibility
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });

    // User status events
    socket.on('update-status', (status) => {
      const userStatus = {
        userId: socket.userId,
        status,
        timestamp: new Date()
      };
      broadcastToAll('user-status-updated', userStatus);
    });

    // Typing indicators
    socket.on('typing-start', (data) => {
      const { recipientId, contentId } = data;
      if (recipientId) {
        emitToUser(recipientId, 'user-typing', {
          userId: socket.userId,
          isTyping: true,
          contentId
        });
      } else if (contentId) {
        emitToRoom(`content_${contentId}`, 'user-typing', {
          userId: socket.userId,
          isTyping: true,
          contentId
        });
      }
    });

    socket.on('typing-stop', (data) => {
      const { recipientId, contentId } = data;
      if (recipientId) {
        emitToUser(recipientId, 'user-typing', {
          userId: socket.userId,
          isTyping: false,
          contentId
        });
      } else if (contentId) {
        emitToRoom(`content_${contentId}`, 'user-typing', {
          userId: socket.userId,
          isTyping: false,
          contentId
        });
      }
    });

    // Real-time collaboration events
    socket.on('content-edit-start', (contentId) => {
      emitToRoom(`content_${contentId}`, 'user-editing', {
        userId: socket.userId,
        isEditing: true,
        contentId,
        timestamp: new Date()
      });
    });

    socket.on('content-edit-stop', (contentId) => {
      emitToRoom(`content_${contentId}`, 'user-editing', {
        userId: socket.userId,
        isEditing: false,
        contentId,
        timestamp: new Date()
      });
    });

    // Notification events
    socket.on('mark-notification-read', (notificationId) => {
      emitToUser(socket.userId, 'notification-read', { notificationId });
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Export helper functions for use in routes
  return {
    emitToUser,
    emitToRoom,
    broadcastToAll,
    users,
    userRooms
  };
};

export default signaling;
