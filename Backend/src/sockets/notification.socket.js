import { prisma } from '../app.js';
import logger from '../config/logger.js';

export default function registerNotificationSocket(io) {
  const notificationNamespace = io.of('/notifications');

  notificationNamespace.on('connection', (socket) => {
    logger.info(`Notification socket connected: ${socket.id}`);

    // Join user to their notification room
    socket.on('join-user', async (userId) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(userId) }
        });

        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        socket.join(`user-${user.id}`);
        
        logger.info(`User ${user.id} joined notification room`);
        socket.emit('joined', { userId: user.id, role: user.role });
      } catch (error) {
        logger.error('Error joining user to notifications:', error);
        socket.emit('error', { message: 'Failed to join notifications' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Notification socket disconnected: ${socket.id}`);
    });
  });

  // Function to send notification to specific user
  const sendNotification = async (userId, notificationData) => {
    try {
      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId: parseInt(userId),
          type: notificationData.type,
          content: notificationData.content
        }
      });

      // Emit to user's notification room
      notificationNamespace.to(`user-${userId}`).emit('new-notification', notification);
      
      logger.info(`Notification sent to user ${userId}: ${notificationData.type}`);
      return notification;
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  };

  // Function to send appointment notifications
  const sendAppointmentNotification = async (appointmentId, type, content) => {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(appointmentId) },
        include: {
          doctor: { include: { user: true } },
          patient: { include: { user: true } }
        }
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Send to both doctor and patient
      await sendNotification(appointment.doctor.userId, {
        type: 'APPOINTMENT',
        content: content
      });

      await sendNotification(appointment.patient.userId, {
        type: 'APPOINTMENT',
        content: content
      });

      logger.info(`Appointment notification sent for appointment ${appointmentId}`);
    } catch (error) {
      logger.error('Error sending appointment notification:', error);
      throw error;
    }
  };

  // Function to send message notifications
  const sendMessageNotification = async (senderId, receiverId, messageContent) => {
    try {
      const sender = await prisma.user.findUnique({
        where: { id: parseInt(senderId) },
        include: {
          doctorProfile: true,
          patientProfile: true
        }
      });

      if (!sender) {
        throw new Error('Sender not found');
      }

      const senderName = sender.doctorProfile 
        ? `${sender.doctorProfile.firstName} ${sender.doctorProfile.lastName}`
        : `${sender.patientProfile.firstName} ${sender.patientProfile.lastName}`;

      await sendNotification(receiverId, {
        type: 'MESSAGE',
        content: `New message from ${senderName}: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`
      });

      logger.info(`Message notification sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      logger.error('Error sending message notification:', error);
      throw error;
    }
  };

  // Function to send review notifications
  const sendReviewNotification = async (doctorId, patientId, rating) => {
    try {
      const patient = await prisma.patientProfile.findUnique({
        where: { id: parseInt(patientId) },
        include: { user: true }
      });

      if (!patient) {
        throw new Error('Patient not found');
      }

      const patientName = `${patient.firstName} ${patient.lastName}`;

      await sendNotification(doctorId, {
        type: 'REVIEW',
        content: `New ${rating}-star review from ${patientName}`
      });

      logger.info(`Review notification sent to doctor ${doctorId}`);
    } catch (error) {
      logger.error('Error sending review notification:', error);
      throw error;
    }
  };

  // Function to send system notifications
  const sendSystemNotification = async (userId, content) => {
    try {
      await sendNotification(userId, {
        type: 'SYSTEM',
        content: content
      });

      logger.info(`System notification sent to user ${userId}`);
    } catch (error) {
      logger.error('Error sending system notification:', error);
      throw error;
    }
  };

  // Function to mark notification as read
  const markNotificationAsRead = async (notificationId, userId) => {
    try {
      const notification = await prisma.notification.update({
        where: { 
          id: parseInt(notificationId),
          userId: parseInt(userId)
        },
        data: { isRead: true }
      });

      // Emit to user that notification was read
      notificationNamespace.to(`user-${userId}`).emit('notification-read', {
        notificationId: parseInt(notificationId)
      });

      logger.info(`Notification ${notificationId} marked as read by user ${userId}`);
      return notification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  };

  // Export functions for use in other parts of the application
  return {
    sendNotification,
    sendAppointmentNotification,
    sendMessageNotification,
    sendReviewNotification,
    sendSystemNotification,
    markNotificationAsRead
  };
}
