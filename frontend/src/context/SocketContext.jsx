import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [liveAlert, setLiveAlert] = useState(null);

  useEffect(() => {
    // Socket server host
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    // Join personal room and role room
    socket.emit('join_user', user._id);
    socket.emit('join_role', user.role);

    const handleNotification = (notification) => {
      setLiveAlert({
        id: Date.now(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
      });

      // Clear alert after 6 seconds
      setTimeout(() => {
        setLiveAlert(null);
      }, 6000);
    };

    const handleNewDonation = (donation) => {
      if (user.role === 'ngo') {
        setLiveAlert({
          id: Date.now(),
          title: '🍲 New Food Donation Nearby!',
          message: `${donation.title} (${donation.quantity}) is available in ${donation.city}.`,
          type: 'donation_new',
        });
        setTimeout(() => setLiveAlert(null), 6000);
      }
    };

    socket.on('new_notification', handleNotification);
    socket.on('new_donation_available', handleNewDonation);

    return () => {
      socket.off('new_notification', handleNotification);
      socket.off('new_donation_available', handleNewDonation);
    };
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket, liveAlert, clearAlert: () => setLiveAlert(null) }}>
      {children}
      {/* Real-time floating toast banner */}
      {liveAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 animate-bounce duration-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-emerald-400">{liveAlert.title}</p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{liveAlert.message}</p>
            </div>
            <button
              onClick={() => setLiveAlert(null)}
              className="text-slate-400 hover:text-white text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

