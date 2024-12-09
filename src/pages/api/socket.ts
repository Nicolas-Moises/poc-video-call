import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';

import { NextApiResponseWithSocket } from '@/_types';

const socketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('Socket is initializing');

    const httpServer = res.socket.server;
    const io = new ServerIO(httpServer, { 
      path: '/api/socket', 
      cors: {
        origin: '*',
        methods: [ "GET", "POST" ],
      }
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      socket.emit("me", socket.id);

      socket.on('room:join', ({ room, user }) => {
        console.table({
          'room-id': room,
          'used-id': user.id,
          'user-name': user.name,
        });

        socket.join(room);

        socket.to(room).emit('user:joined', user);

        socket.on('disconnect', () => {
          socket.to(room).emit('user:left', user.id);
        });

        socket.on('user:leave', (userId) => {
          socket.to(room).emit('user:left', userId);
        });

        socket.on('host:mute-user', (userId) => {
          socket.to(room).emit('host:muted-user', userId);
        });

        socket.on('host:remove-user-shared-screen', () => {
          socket.to(room).emit('host:removed-user-shared-screen');
        });

        socket.on('user:toggle-audio', (userId) => {
          socket.to(room).emit('user:toggled-audio', userId);
        });

        socket.on('user:toggle-video', (userId) => {
          socket.to(room).emit('user:toggled-video', userId);
        });

        socket.on('user:share-screen', (username) => {
          socket.to(room).emit('user:shared-screen', username);
        });

        socket.on('user:stop-share-screen', () => {
          socket.to(room).emit('user:stopped-screen-share', user.name);
        });

        socket.on('chat:post', (message) => {
          socket.to(room).emit('chat:get', message);
        });
      });
    });
  }

  res.end();
};

export default socketHandler;
