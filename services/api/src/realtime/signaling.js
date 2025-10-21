import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

const signaling = (io) => {
  const users = new Map(); // Map to store userId -> socketId

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
      console.log(`User ${socket.userId} connected with socket ${socket.id}`);
    } catch (error) {
      console.log('Invalid token, disconnecting socket');
      return socket.disconnect();
    }

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from socket ${socket.id}`);
      users.delete(socket.userId);
    });

    socket.on('sendMessage', async ({ recipientId, content }) => {
      try {
        const senderId = socket.userId;

        const newMessage = await Message.create({
          sender: senderId,
          recipient: recipientId,
          content,
        });

        // Emit to sender
        io.to(socket.id).emit('message', newMessage);

        // Emit to recipient if online
        const recipientSocketId = users.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message', newMessage);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Existing chat message event (can be removed or repurposed)
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
  });
};

export default signaling;
