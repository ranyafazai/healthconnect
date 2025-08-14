import { Server as SocketIOServer } from "socket.io";
import jwt from 'jsonwebtoken';

let io;

export default {
  initSocket: (server) => {
    const defaultAllowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:3000'
    ];
    const envOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultAllowedOrigins]));

    io = new SocketIOServer(server, {
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) return callback(null, true);
          return callback(new Error('Socket CORS: Origin not allowed'));
        },
        methods: ["GET", "POST"],
        credentials: true,
      },
      connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000 },
    });
    

    // Global middleware for JWT auth + memory leak prevention
    io.use((socket, next) => {
      try {
        let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '') || null;
        // Try to parse httpOnly cookie header if present
        if (!token && socket.handshake.headers?.cookie) {
          const cookieHeader = socket.handshake.headers.cookie;
          const parts = cookieHeader.split(';').map((c) => c.trim());
          const tokenCookie = parts.find((p) => p.startsWith('token='));
          if (tokenCookie) {
            token = decodeURIComponent(tokenCookie.split('=')[1]);
          }
        }
        
        // For development/testing, allow connections without token temporarily
        if (!token) {
          // Check if user ID is provided in auth object for development
          const userId = socket.handshake.auth?.userId;
          if (userId) {
            socket.userId = parseInt(userId);
          } else {
            socket.userId = null; // Will be set when user joins a room
          }
          return next();
        }
        
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
        socket.userId = payload.id;
        return next();
      } catch (err) {
        // For development/testing, allow connections even with invalid tokens
        const userId = socket.handshake.auth?.userId;
        if (userId) {
          socket.userId = parseInt(userId);
        } else {
          socket.userId = null;
        }
        return next();
      }
    });

    io.on('connection', (socket) => {
      // Defensive cleanup to avoid leaks
      const cleanup = () => {
        try {
          socket.removeAllListeners();
          socket.rooms.forEach((room) => {
            if (room !== socket.id) socket.leave(room);
          });
        } catch (_err) {
          return; // ignore cleanup errors
        }
      };
      socket.on('disconnect', cleanup);
      socket.on('error', cleanup);
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized");
    }
    return io;
  },
  closeSocket: () => {
    if (io) {
      io.close();
    }
  },
};
