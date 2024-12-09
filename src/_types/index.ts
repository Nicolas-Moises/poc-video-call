import { NextApiResponse } from "next";
import { Socket as NetSocket } from 'node:net';
import { Server as HTTPServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: NetSocket & {
    server: HTTPServer & {
      io: SocketIOServer;
    };
  };
}