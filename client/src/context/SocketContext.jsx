import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user?._id) return;
    const s = io('https://skillssync-a4r9.onrender.com', { withCredentials: true });
    socketRef.current = s;
    setSocket(s);
    s.emit('join', user._id);
    return () => { s.disconnect(); };
  }, [user?._id]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);

