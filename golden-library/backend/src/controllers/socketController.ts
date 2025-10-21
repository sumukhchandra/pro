import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Channel from '../models/Channel';
import DirectMessage from '../models/DirectMessage';
import Message from '../models/Message';

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
      const user = await User.findById(decoded.userId).select('-passwordHash');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.data.user.username} connected`);

    // Join channel
    socket.on('join_channel', async (channelId) => {
      try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
          socket.emit('error', { message: 'Channel not found' });
          return;
        }

        // Add user to channel if not already a member
        if (!channel.members.includes(socket.data.user._id)) {
          await Channel.findByIdAndUpdate(channelId, {
            $addToSet: { members: socket.data.user._id }
          });
        }

        socket.join(channelId);
        socket.emit('joined_channel', { channelId, channelName: channel.name });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join channel' });
      }
    });

    // Leave channel
    socket.on('leave_channel', (channelId) => {
      socket.leave(channelId);
      socket.emit('left_channel', { channelId });
    });

    // Send message to channel
    socket.on('send_message', async (data) => {
      try {
        const { channelId, content } = data;
        
        const message = new Message({
          channelId,
          senderId: socket.data.user._id,
          content
        });

        await message.save();
        await message.populate('senderId', 'username');

        io.to(channelId).emit('new_message', {
          id: message._id,
          content: message.content,
          sender: {
            id: message.senderId._id,
            username: message.senderId.username
          },
          createdAt: message.createdAt
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Start direct message conversation
    socket.on('start_dm', async (otherUserId) => {
      try {
        // Find or create direct message conversation
        let dm = await DirectMessage.findOne({
          participants: { $all: [socket.data.user._id, otherUserId] }
        });

        if (!dm) {
          dm = new DirectMessage({
            participants: [socket.data.user._id, otherUserId]
          });
          await dm.save();
        }

        socket.join(dm._id.toString());
        socket.emit('dm_started', { dmId: dm._id });
      } catch (error) {
        socket.emit('error', { message: 'Failed to start direct message' });
      }
    });

    // Send direct message
    socket.on('send_dm', async (data) => {
      try {
        const { dmId, content } = data;
        
        const message = new Message({
          directMessageId: dmId,
          senderId: socket.data.user._id,
          content
        });

        await message.save();
        await message.populate('senderId', 'username');

        io.to(dmId).emit('new_dm', {
          id: message._id,
          content: message.content,
          sender: {
            id: message.senderId._id,
            username: message.senderId.username
          },
          createdAt: message.createdAt
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send direct message' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.data.user.username} disconnected`);
    });
  });
};