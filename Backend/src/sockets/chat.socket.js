import { prisma } from '../app.js';
import logger from '../config/logger.js';

export default function registerChatSocket(io) {
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    logger.info(`Chat socket connected: ${socket.id}`);

    // Ensure user identity is present from auth middleware
    if (!socket.userId) {
      logger.warn('Chat socket missing userId from auth middleware, disconnecting');
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
        
        logger.info(`User ${user.id} joined chat room`);
        socket.emit('joined', { userId: user.id, role: user.role });
      } catch (error) {
        logger.error('Error joining user to chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Join appointment room for real-time messaging
    socket.on('join-appointment', async (appointmentId) => {
      try {
        // Check if user has already joined a user room
        if (!socket.userId) {
          socket.emit('error', { message: 'Please join a user room first' });
          return;
        }

        const appointment = await prisma.appointment.findUnique({
          where: { id: parseInt(appointmentId) },
          include: {
            doctor: { include: { user: true } },
            patient: { include: { user: true } }
          }
        });

        if (!appointment) {
          socket.emit('error', { message: 'Appointment not found' });
          return;
        }

        // Debug logging to understand the data structure
        logger.info(`Appointment data for ${appointmentId}:`, {
          appointmentId: appointment.id,
          doctorProfileId: appointment.doctorId,
          patientProfileId: appointment.patientId,
          doctorUserId: appointment.doctor?.user?.id,
          patientUserId: appointment.patient?.user?.id,
          socketUserId: socket.userId
        });

        // Check if user is part of this appointment by comparing user IDs
        // appointment.doctor.user.id and appointment.patient.user.id are the actual user IDs
        if (socket.userId !== appointment.doctor.user.id && 
            socket.userId !== appointment.patient.user.id) {
          logger.error(`Access denied for user ${socket.userId} to appointment ${appointmentId}`);
          logger.error(`Expected: doctor.user.id=${appointment.doctor.user.id} or patient.user.id=${appointment.patient.user.id}`);
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        socket.join(`appointment-${appointmentId}`);
        logger.info(`User ${socket.userId} joined appointment ${appointmentId}`);
        
        socket.emit('appointment-joined', { appointmentId });
      } catch (error) {
        logger.error('Error joining appointment:', error);
        socket.emit('error', { message: 'Failed to join appointment' });
      }
    });

    // Handle new message
    socket.on('send-message', async (data) => {
      try {
        const { receiverId, appointmentId, content, type = 'TEXT', fileId } = data;

        if (!socket.userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            senderId: socket.userId,
            receiverId: parseInt(receiverId),
            appointmentId: appointmentId ? parseInt(appointmentId) : null,
            content,
            type,
            fileId: fileId ? parseInt(fileId) : null
          },
          include: {
            sender: {
              include: {
                doctorProfile: true,
                patientProfile: true
              }
            },
            receiver: {
              include: {
                doctorProfile: true,
                patientProfile: true
              }
            },
            file: true
          }
        });

        // Emit to receiver's personal room
        chatNamespace.to(`user-${receiverId}`).emit('new-message', message);
        
        // Emit to appointment room if applicable
        if (appointmentId) {
          chatNamespace.to(`appointment-${appointmentId}`).emit('appointment-message', message);
        }

        // Send confirmation to sender
        socket.emit('message-sent', message);

        logger.info(`Message sent from ${socket.userId} to ${receiverId}`);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message read status
    socket.on('mark-read', async (messageId) => {
      try {
        const message = await prisma.message.update({
          where: { id: parseInt(messageId) },
          data: { isRead: true }
        });

        // Notify sender that message was read
        chatNamespace.to(`user-${message.senderId}`).emit('message-read', {
          messageId: parseInt(messageId),
          readBy: socket.userId
        });

        logger.info(`Message ${messageId} marked as read by ${socket.userId}`);
      } catch (error) {
        logger.error('Error marking message as read:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      const { receiverId, appointmentId } = data;
      
      chatNamespace.to(`user-${receiverId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: true
      });

      if (appointmentId) {
        chatNamespace.to(`appointment-${appointmentId}`).emit('appointment-typing', {
          userId: socket.userId,
          isTyping: true
        });
      }
    });

    socket.on('typing-stop', (data) => {
      const { receiverId, appointmentId } = data;
      
      chatNamespace.to(`user-${receiverId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: false
      });

      if (appointmentId) {
        chatNamespace.to(`appointment-${appointmentId}`).emit('appointment-typing', {
          userId: socket.userId,
          isTyping: false
        });
      }
    });

    // Handle disconnection and cleanup
    socket.on('disconnect', () => {
      try {
        socket.removeAllListeners();
      } catch {}
      logger.info(`Chat socket disconnected: ${socket.id}`);
    });
  });

  return chatNamespace;
}
