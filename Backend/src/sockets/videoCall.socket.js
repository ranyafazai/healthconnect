import { prisma } from '../app.js';
import logger from '../config/logger.js';

export default function registerVideoCallSocket(io) {
  const videoCallNamespace = io.of('/video-call');

  // Apply auth middleware to video call namespace
  videoCallNamespace.use((socket, next) => {
    try {
      // Check if user ID is provided in auth object for development
      const userId = socket.handshake.auth?.userId;
      if (userId) {
        
        socket.userId = parseInt(userId);
        return next();
      }
      
      // Try to get token from auth or headers
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
      
      if (token) {
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
        socket.userId = payload.id;
        return next();
      }
      
      socket.userId = null;
      return next();
    } catch (err) {
      socket.userId = null;
      return next();
    }
  });

  videoCallNamespace.on('connection', (socket) => {
    logger.info(`Video call socket connected: ${socket.id}`);

    // Ensure user identity is present from auth middleware
    if (!socket.userId) {
      logger.warn('Video socket missing userId from auth middleware, disconnecting');
      socket.disconnect(true);
      return;
    }

    

    // Join user to their personal room
    socket.on('join-user', async (userId) => {
      try {
        // Prevent users from joining rooms other than their own
        if (parseInt(userId) !== socket.userId) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }
        const user = await prisma.user.findUnique({
          where: { id: parseInt(userId) },
          include: {
            doctorProfile: true,
            patientProfile: true
          }
        });

        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        socket.userRole = user.role;
        socket.join(`user-${user.id}`);
        
        logger.info(`User ${user.id} joined video call room`);
        socket.emit('joined', { userId: user.id, role: user.role });
      } catch (error) {
        console.error('❌ Error joining user to video call:', error);
        logger.error('Error joining user to video call:', error);
        socket.emit('error', { message: 'Failed to join video call' });
      }
    });

    // Create or join video call room
    socket.on('join-call', async (data) => {
      try {
        // Check if user has already joined a user room
        if (!socket.userId) {
          socket.emit('error', { message: 'Please join a user room first' });
          return;
        }

        const { appointmentId, roomId } = data;

        const appointment = await prisma.appointment.findUnique({
          where: { id: parseInt(appointmentId) },
          include: {
            doctor: { include: { user: true } },
            patient: { include: { user: true } },
          },
        });

        if (!appointment) {
          socket.emit('error', { message: 'Appointment not found' });
          return;
        }

        // Enforce participant check
        const doctorUserId = appointment.doctor?.user?.id;
        const patientUserId = appointment.patient?.user?.id;
        const isParticipant = socket.userId === doctorUserId || socket.userId === patientUserId;
        if (!isParticipant) {
          socket.emit('error', { message: 'Access denied: not a participant in this appointment' });
          return;
        }

        // Enforce appointment type and time window for calls (VIDEO type only)
        if (appointment.type !== 'VIDEO') {
          socket.emit('error', { message: 'Calls are only available for VIDEO type appointments' });
          return;
        }
        const now = new Date();
        const apptDate = new Date(appointment.date);
        const activeWindowMs = 30 * 60 * 1000;
        const isWithinWindow = Math.abs(now.getTime() - apptDate.getTime()) <= activeWindowMs;
        if (!isWithinWindow) {
          socket.emit('error', { message: 'Calls available only during appointment time window' });
          return;
        }

        // Try to find an existing call for this appointment via the latest VIDEO message
        let videoCall = await prisma.videoCall.findFirst({
          where: { message: { appointmentId: appointment.id, type: 'VIDEO' } },
          orderBy: { createdAt: 'desc' },
        });

        // Create video call if it doesn't exist
        if (!videoCall) {
          const otherUserId =
            socket.userId === appointment.doctor.userId
              ? appointment.patient.userId
              : appointment.doctor.userId;

          // Create a VIDEO message to link the call
          const message = await prisma.message.create({
            data: {
              senderId: socket.userId,
              receiverId: otherUserId,
              appointmentId: appointment.id,
              content: 'Video call initiated',
              type: 'VIDEO',
            },
          });

          // Create video call record
          videoCall = await prisma.videoCall.create({
            data: {
              messageId: message.id,
              roomId: roomId || `room-${appointment.id}-${Date.now()}`,
              status: 'PENDING',
            },
          });
        } else {
          
        }

        // Join the room
        socket.join(`call-${videoCall.roomId}`);
        socket.roomId = videoCall.roomId;
        socket.appointmentId = appointment.id;

        // Update video call status to IN_PROGRESS if not already
        if (videoCall.status === 'PENDING') {
          await prisma.videoCall.update({
            where: { id: videoCall.id },
            data: {
              status: 'IN_PROGRESS',
              startTime: new Date(),
            },
          });
        }

        // Notify other participants
        socket.to(`call-${videoCall.roomId}`).emit('user-joined-call', {
          userId: socket.userId,
          userRole: socket.userRole,
          roomId: videoCall.roomId,
        });

        // Also notify users in their personal rooms about the call
        const otherUserId = socket.userId === appointment.doctor.userId
          ? appointment.patient.userId
          : appointment.doctor.userId;
        
        socket.to(`user-${otherUserId}`).emit('call-joined', {
          roomId: videoCall.roomId,
          appointmentId: appointment.id,
          videoCallId: videoCall.id,
          joinedBy: socket.userId
        });

        logger.info(
          `User ${socket.userId} joined video call room ${videoCall.roomId}`
        );
        socket.emit('call-joined', {
          roomId: videoCall.roomId,
          appointmentId: appointment.id,
          videoCallId: videoCall.id,
        });
      } catch (error) {
        console.error('❌ Error joining video call:', error);
        logger.error('Error joining video call:', error);
        socket.emit('error', { message: 'Failed to join video call' });
      }
    });

    // Handle WebRTC signaling
    socket.on('offer', (data) => {
      const { targetUserId, offer, callType } = data;
      socket.to(`user-${targetUserId}`).emit('offer', {
        offer,
        fromUserId: socket.userId,
        appointmentId: socket.appointmentId,
        callType: callType || 'VIDEO'
      });
      logger.info(`Offer sent from ${socket.userId} to ${targetUserId}`);
    });

    socket.on('answer', (data) => {
      const { targetUserId, answer } = data;
      socket.to(`user-${targetUserId}`).emit('answer', {
        answer,
        fromUserId: socket.userId
      });
      logger.info(`Answer sent from ${socket.userId} to ${targetUserId}`);
    });

    socket.on('ice-candidate', (data) => {
      const { targetUserId, candidate } = data;
      socket.to(`user-${targetUserId}`).emit('ice-candidate', {
        candidate,
        fromUserId: socket.userId
      });
    });

    // Caller cancels before receiver joins room
    socket.on('cancel-call', (data) => {
      try {
        const { targetUserId, appointmentId } = data || {};
        if (!targetUserId) return;
        videoCallNamespace.to(`user-${targetUserId}`).emit('call-cancelled', {
          cancelledBy: socket.userId,
          appointmentId: appointmentId || socket.appointmentId || null,
        });
        logger.info(`Call cancelled by ${socket.userId} for ${targetUserId}`);
      } catch (err) {
        logger.error('Error handling cancel-call:', err);
      }
    });

    // Handle call controls
    socket.on('mute-audio', (isMuted) => {
      if (socket.roomId) {
        socket.to(`call-${socket.roomId}`).emit('user-muted-audio', {
          userId: socket.userId,
          isMuted
        });
      }
    });

    socket.on('mute-video', (isMuted) => {
      if (socket.roomId) {
        socket.to(`call-${socket.roomId}`).emit('user-muted-video', {
          userId: socket.userId,
          isMuted
        });
      }
    });

    socket.on('screen-share', (isSharing) => {
      if (socket.roomId) {
        socket.to(`call-${socket.roomId}`).emit('user-screen-share', {
          userId: socket.userId,
          isSharing
        });
      }
    });

    // Handle call recording
    socket.on('start-recording', async () => {
      try {
        if (!socket.roomId) {
          socket.emit('error', { message: 'Not in a call room' });
          return;
        }

        // Notify other participants
        socket.to(`call-${socket.roomId}`).emit('recording-started', {
          startedBy: socket.userId
        });

        logger.info(`Recording started in room ${socket.roomId} by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error starting recording:', error);
        socket.emit('error', { message: 'Failed to start recording' });
      }
    });

    socket.on('stop-recording', async () => {
      try {
        if (!socket.roomId) {
          socket.emit('error', { message: 'Not in a call room' });
          return;
        }

        // Notify other participants
        socket.to(`call-${socket.roomId}`).emit('recording-stopped', {
          stoppedBy: socket.userId
        });

        logger.info(`Recording stopped in room ${socket.roomId} by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error stopping recording:', error);
        socket.emit('error', { message: 'Failed to stop recording' });
      }
    });

    // Handle call end
    socket.on('end-call', async () => {
      try {
        if (!socket.roomId || !socket.appointmentId) {
          socket.emit('error', { message: 'Not in a call' });
          return;
        }

        // Update video call status
        const videoCall = await prisma.videoCall.findFirst({
          where: { roomId: socket.roomId }
        });

        if (videoCall) {
          await prisma.videoCall.update({
            where: { id: videoCall.id },
            data: { 
              status: 'COMPLETED',
              endTime: new Date()
            }
          });
        }

        // Notify other participants in the room
        socket.to(`call-${socket.roomId}`).emit('call-ended', {
          endedBy: socket.userId
        });

        // Also notify the other user in their personal room (in case they haven't joined the call room yet)
        try {
          const appointment = await prisma.appointment.findUnique({
            where: { id: socket.appointmentId },
            include: { doctor: { include: { user: true } }, patient: { include: { user: true } } },
          });
          if (appointment) {
            const otherUserId = socket.userId === appointment.doctor.user.id
              ? appointment.patient.user.id
              : appointment.doctor.user.id;
            videoCallNamespace.to(`user-${otherUserId}`).emit('call-ended', {
              endedBy: socket.userId,
              appointmentId: socket.appointmentId,
            });
          }
        } catch {}

        // Leave the room
        socket.leave(`call-${socket.roomId}`);
        
        logger.info(`Call ended in room ${socket.roomId} by user ${socket.userId}`);
        socket.emit('call-ended-confirmation');
      } catch (error) {
        logger.error('Error ending call:', error);
        socket.emit('error', { message: 'Failed to end call' });
      }
    });

    // Handle call decline
    socket.on('call-declined', (data) => {
      const { targetUserId } = data;
      socket.to(`user-${targetUserId}`).emit('call-declined', {
        declinedBy: socket.userId
      });
      logger.info(`Call declined by ${socket.userId} for ${targetUserId}`);
    });

    // Handle call timeout
    socket.on('call-timeout', async () => {
      try {
        if (!socket.roomId) {
          return;
        }

        // Update video call status
        const videoCall = await prisma.videoCall.findFirst({
          where: { roomId: socket.roomId }
        });

        if (videoCall) {
          await prisma.videoCall.update({
            where: { id: videoCall.id },
            data: { 
              status: 'CANCELLED',
              endTime: new Date()
            }
          });
        }

        // Notify all participants
        videoCallNamespace.to(`call-${socket.roomId}`).emit('call-timeout');
        
        logger.info(`Call timed out in room ${socket.roomId}`);
      } catch (error) {
        logger.error('Error handling call timeout:', error);
      }
    });

    // Handle connection quality
    socket.on('connection-quality', (quality) => {
      if (socket.roomId) {
        socket.to(`call-${socket.roomId}`).emit('user-connection-quality', {
          userId: socket.userId,
          quality
        });
      }
    });

    // Handle disconnection with cleanup
    socket.on('disconnect', async () => {
      try {
        try { socket.removeAllListeners(); } catch {}
        if (socket.roomId) {
          // Notify other participants
          socket.to(`call-${socket.roomId}`).emit('user-disconnected', {
            userId: socket.userId
          });

          // Check if room is empty
          const room = await videoCallNamespace.in(`call-${socket.roomId}`).fetchSockets();
          if (room.length === 0) {
            // Update video call status if room is empty
            const videoCall = await prisma.videoCall.findFirst({
              where: { roomId: socket.roomId }
            });

            if (videoCall && videoCall.status === 'IN_PROGRESS') {
              await prisma.videoCall.update({
                where: { id: videoCall.id },
                data: { 
                  status: 'COMPLETED',
                  endTime: new Date()
                }
              });
            }
          }
        }

        logger.info(`Video call socket disconnected: ${socket.id}`);
      } catch (error) {
        logger.error('Error handling video call disconnect:', error);
      }
    });
  });

  return videoCallNamespace;
}
