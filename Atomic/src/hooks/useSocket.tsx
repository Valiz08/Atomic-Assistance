import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useSocket = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket = io('http://localhost:3088', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log('Conectado al servidor Socket.IO');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Desconectado del servidor Socket.IO');
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const joinRoom = (userId: string) => {
    if (socket) {
      socket.emit('join_room', userId);
    }
  };

  const sendMessage = (userId: string, clientId: string, message: string) => {
    if (socket) {
      socket.emit('send_message', { userId, clientId, message });
    }
  };

  const onReceiveMessage = (callback: (data: any) => void) => {
    if (socket) {
      socket.off('receive_message');
      socket.on('receive_message', callback);
    }
  };

  return {
    connected,
    joinRoom,
    sendMessage,
    onReceiveMessage,
    socket
  };
};
