import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

/**
 * Custom hook that connects to the backend socket.io server.
 * The token from localStorage is sent in the handshake auth object.
 * Returns the socket instance so components can subscribe to events.
 */
function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    // create socket connection with auth token
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket conectado:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Error de conexion socket:', err.message);
    });

    // cleanup when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
}

export default useSocket;
