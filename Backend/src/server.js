// backend/src/server.js
import http from "http";
// import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import app from "./app.js";
import { prisma } from "./app.js";
import socketConfig from "./config/socket.js";
import registerChatSocket from "./sockets/chat.socket.js";
import registerVideoCallSocket from "./sockets/videoCall.socket.js";
import registerNotificationSocket from "./sockets/notification.socket.js";
import logger from "./config/logger.js";
import cron from 'node-cron';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
const io = socketConfig.initSocket(server);

// Register socket namespaces with auth already enforced by initSocket
const chatNamespace = registerChatSocket(io);
const videoCallNamespace = registerVideoCallSocket(io);
const notificationServices = registerNotificationSocket(io);

// Make notification services available globally
global.notificationServices = notificationServices;

// WebRTC STUN/TURN server configuration
const webRTCConfig = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302'
      ]
    }
  ],
  iceCandidatePoolSize: 10
};

// Add TURN servers if configured
if (process.env.TURN_SERVER_URL && process.env.TURN_USERNAME && process.env.TURN_CREDENTIAL) {
  webRTCConfig.iceServers.push({
    urls: process.env.TURN_SERVER_URL,
    username: process.env.TURN_USERNAME,
    credential: process.env.TURN_CREDENTIAL
  });
}

// Make WebRTC config available to socket namespaces
io.webRTCConfig = webRTCConfig;

// Socket connection logging
io.on('connection', (socket) => {
  logger.info(`Main socket connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Main socket disconnected: ${socket.id}`);
  });
});

// Override WebRTC configuration endpoint with actual data
app.get('/api/webrtc-config', (req, res) => {
  res.json({
    iceServers: webRTCConfig.iceServers,
    iceCandidatePoolSize: webRTCConfig.iceCandidatePoolSize
  });
});

// Override Socket status endpoint with actual data
app.get('/api/socket-status', (req, res) => {
  const socketStatus = {
    chat: chatNamespace.connected ? Object.keys(chatNamespace.connected).length : 0,
    videoCall: videoCallNamespace.connected ? Object.keys(videoCallNamespace.connected).length : 0,
    notifications: io.of('/notifications').connected ? Object.keys(io.of('/notifications').connected).length : 0,
    total: io.engine.clientsCount
  };
  
  res.json(socketStatus);
});

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 Socket.IO initialized`);
  logger.info(`🌐 WebRTC configured with ${webRTCConfig.iceServers.length} ICE servers`);
  logger.info(`🔗 Chat namespace: /chat`);
  logger.info(`📹 Video call namespace: /video-call`);
  logger.info(`🔔 Notification namespace: /notifications`);
});

// Cron job: appointment reminders (runs every hour)
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const upcoming = await prisma.appointment.findMany({
      where: {
        date: { gte: now, lte: in24h },
        status: 'CONFIRMED'
      },
      include: { doctor: true, patient: true }
    });
    for (const apt of upcoming) {
      try {
        await prisma.notification.create({
          data: {
            userId: apt.patient.userId,
            type: 'APPOINTMENT',
            content: `Reminder: Appointment with Dr. ${apt.doctor.firstName} ${apt.doctor.lastName} at ${apt.date.toLocaleString()}`
          }
        });
        // Emit via socket if connected
        const notificationNs = io.of('/notifications');
        notificationNs.to(`user-${apt.patient.userId}`).emit('new-notification', {
          type: 'APPOINTMENT',
          content: `Reminder: Appointment with Dr. ${apt.doctor.firstName} ${apt.doctor.lastName} at ${apt.date.toLocaleString()}`
        });
      } catch (e) {
        logger.warn('Failed to create/send reminder notification', e);
      }
    }
    logger.info(`⏰ Appointment reminder cron ran. Processed: ${upcoming.length}`);
  } catch (e) {
    logger.error('Cron job error (appointment reminders):', e);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down server gracefully');
  socketConfig.closeSocket();
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down server gracefully');
  socketConfig.closeSocket();
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { server, io };
