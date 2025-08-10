import { prisma } from '../app.js';
import logger from '../config/logger.js';

export default function registerVideoCallSocket(io) {
  const videoCallNamespace = io.of('/video-call');

  videoCallNamespace.on('connection', (socket) => {
    logger.info(`Video call socket connected: ${socket.id}`);

    // Join user to their personal room
    socket.on('join-user', async (userId) => {
      try {
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

        socket.userId = user.id;
        socket.userRole = user.role;
        socket.join(`user-${user.id}`);
        
        logger.info(`User ${user.id} joined video call room`);
        socket.emit('joined', { userId: user.id, role: user.role });
      } catch (error) {
        logger.error('Error joining user to video call:', error);
        socket.emit('error', { message: 'Failed to join video call' });
      }
    });

    // Create or join video call room
    socket.on('join-call', async (data) => {
      try {
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

        // Check if user is part of this appointment
        if (
          socket.userId !== appointment.doctor.userId &&
          socket.userId !== appointment.patient.userId
        ) {
          socket.emit('error', { message: 'Access denied' });
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

        logger.info(
          `User ${socket.userId} joined video call room ${videoCall.roomId}`
        );
        socket.emit('call-joined', {
          roomId: videoCall.roomId,
          appointmentId: appointment.id,
          videoCallId: videoCall.id,
        });
      } catch (error) {
        logger.error('Error joining video call:', error);
        socket.emit('error', { message: 'Failed to join video call' });
      }
    });

    // Handle WebRTC signaling
    socket.on('offer', (data) => {
      const { targetUserId, offer } = data;
      socket.to(`user-${targetUserId}`).emit('offer', {
        offer,
        fromUserId: socket.userId
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

        // Notify other participants
        socket.to(`call-${socket.roomId}`).emit('call-ended', {
          endedBy: socket.userId
        });

        // Leave the room
        socket.leave(`call-${socket.roomId}`);
        
        logger.info(`Call ended in room ${socket.roomId} by user ${socket.userId}`);
        socket.emit('call-ended-confirmation');
      } catch (error) {
        logger.error('Error ending call:', error);
        socket.emit('error', { message: 'Failed to end call' });
      }
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

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
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
