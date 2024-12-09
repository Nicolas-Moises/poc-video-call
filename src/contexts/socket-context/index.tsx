/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { ReactNode, useContext, createContext, useState, useEffect } from 'react';
import { Socket } from 'socket.io';
import { io, ManagerOptions, SocketOptions } from 'socket.io-client';

export interface ChatMessageProps {
  userName: string
  message: string
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  chatMessages: ChatMessageProps[]
}

const SocketContext = createContext<SocketContextType>({ 
  socket: null, 
  isConnected: false,
  chatMessages: [],
});

export function SocketContextProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageProps[]>([]);

  useEffect(() => {

    const options: Partial<ManagerOptions & SocketOptions> = {
      path: '/api/socket',
    }

    const newSocket = io('/', options);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('me', (id) => {
      console.log(id);
    });

    newSocket.on('disconnect', () => {
      console.log("SOCKET DISCONNECTED!");
      setIsConnected(false);
    });

    newSocket.on("message", (message: ChatMessageProps) => {
      console.log('new message')
      setChatMessages(prev => [...prev, message]);
    });

    newSocket.on('connect_error', (error) => {
      console.error("Socket Connection Error:", error);
      
      if (!newSocket.active) {
        // If connection is completely denied, attempt manual reconnection
        newSocket.connect();
      }
    });

    // Set the socket in state
    setSocket(newSocket as unknown as Socket);

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      newSocket.disconnect();
    };

  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected, chatMessages }}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
};