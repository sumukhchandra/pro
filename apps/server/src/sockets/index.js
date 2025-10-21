export function configureSockets(io) {
  io.on('connection', (socket) => {
    socket.on('joinChannel', (channelId) => {
      socket.join(`channel:${channelId}`);
    });
    socket.on('leaveChannel', (channelId) => {
      socket.leave(`channel:${channelId}`);
    });
    socket.on('channelMessage', ({ channelId, message }) => {
      io.to(`channel:${channelId}`).emit('channelMessage', message);
    });
    socket.on('directMessage', ({ dmId, message, toUserId }) => {
      io.to(`dm:${dmId}`).emit('directMessage', message);
    });
    socket.on('joinDM', (dmId) => socket.join(`dm:${dmId}`));
    socket.on('leaveDM', (dmId) => socket.leave(`dm:${dmId}`));
  });
}
