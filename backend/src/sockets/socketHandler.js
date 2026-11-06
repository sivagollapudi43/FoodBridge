import { Server } from 'socket.io';
import Notification from '../models/Notification.js';

let ioInstance = null;

/**
 * Initialize Socket.IO with HTTP server
 */
export const initSocket = (httpServer, allowedOrigin) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: [
        allowedOrigin,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    // User joins personal room on login
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // User joins role room (e.g., 'role_ngo', 'role_volunteer', 'role_donor')
    socket.on('join_role', (role) => {
      if (role) {
        socket.join(`role_${role}`);
      }
    });

    socket.on('disconnect', () => {
      // Socket disconnected
    });
  });

  console.log('[Socket.IO] Real-time notification engine initialized');
  return ioInstance;
};

/**
 * Get Socket.IO instance
 */
export const getIO = () => {
  return ioInstance;
};

/**
 * Create notification in database and emit in real-time
 */
export const createAndSendNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = '',
  data = {},
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      data,
    });

    if (ioInstance) {
      ioInstance.to(`user_${recipient}`).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('[Notification Dispatch Error]', error.message);
  }
};

/**
 * Broadcast event to role room
 */
export const emitToRole = (role, event, data) => {
  if (ioInstance) {
    ioInstance.to(`role_${role}`).emit(event, data);
  }
};
