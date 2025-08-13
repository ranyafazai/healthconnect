import { prisma } from '../app.js';
import socketConfig from '../config/socket.js';
import logger from '../config/logger.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  serverErrorResponse,
  createdResponse,
  messageResponse,
  listResponse
} from '../utils/responseFormatter.js';

class MessageController {
  // Get conversation between two users
  async getConversation(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;

      if (!userId) {
        return res.status(400).json(errorResponse('User ID is required', 400));
      }

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: parseInt(currentUserId), receiverId: parseInt(userId) },
            { senderId: parseInt(userId), receiverId: parseInt(currentUserId) }
          ]
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
        },
        orderBy: { createdAt: 'asc' }
      });

      return res.json(listResponse(messages, 'Conversation retrieved successfully', messages.length));
    } catch (error) {
      console.error('Get conversation error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get conversation'));
    }
  }

  // Get messages by appointment
  async getMessagesByAppointment(req, res) {
    try {
      const { appointmentId } = req.params;

      if (!appointmentId) {
        return res.status(400).json(errorResponse('Appointment ID is required', 400));
      }

      const messages = await prisma.message.findMany({
        where: { appointmentId: parseInt(appointmentId) },
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
        },
        orderBy: { createdAt: 'asc' }
      });

      return res.json(listResponse(messages, 'Appointment messages retrieved successfully', messages.length));
    } catch (error) {
      console.error('Get appointment messages error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get appointment messages'));
    }
  }

  // Get unread message count for current user
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await prisma.message.count({
        where: { receiverId: parseInt(userId), isRead: false }
      });
      return res.json(successResponse({ count }, 'Unread message count retrieved successfully'));
    } catch (error) {
      console.error('Get unread count error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get unread count'));
    }
  }

  // Send message
  async sendMessage(req, res) {
    try {
      const { receiverId, appointmentId, content, type = 'TEXT', fileId } = req.body;
      const senderId = req.user.id;

      if (!receiverId || !content) {
        return res.status(400).json(errorResponse('Receiver ID and content are required', 400));
      }

      // Validate that receiver exists
      const receiver = await prisma.user.findUnique({
        where: { id: parseInt(receiverId) }
      });

      if (!receiver) {
        console.error(`Receiver with ID ${receiverId} not found`);
        return res.status(400).json(errorResponse(`Receiver with ID ${receiverId} not found`, 400));
      }

      // If message is bound to an appointment, enforce participant and time window
      if (appointmentId) {
        const appointment = await prisma.appointment.findUnique({
          where: { id: parseInt(appointmentId) },
          include: { doctor: { include: { user: true } }, patient: { include: { user: true } } }
        });
        if (!appointment) {
          return res.status(404).json(notFoundResponse('Appointment not found'));
        }
        const doctorUserId = appointment.doctor?.user?.id;
        const patientUserId = appointment.patient?.user?.id;
        const isParticipant = parseInt(senderId) === doctorUserId || parseInt(senderId) === patientUserId;
        if (!isParticipant) {
          return res.status(403).json(errorResponse('Access denied: not a participant in this appointment', 403));
        }
        const now = new Date();
        const apptDate = new Date(appointment.date);
        const activeWindowMs = 30 * 60 * 1000;
        const isWithinWindow = Math.abs(now.getTime() - apptDate.getTime()) <= activeWindowMs;
        if (!isWithinWindow) {
          return res.status(403).json(errorResponse('Messaging available only during appointment time window', 403));
        }
      }

      const message = await prisma.message.create({
        data: {
          senderId: parseInt(senderId),
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

      // Emit real-time events to chat namespace so receivers get the message when
      // it is created via REST (not only via socket 'send-message').
      try {
        const io = socketConfig.getIO();
        const chatNs = io.of('/chat');
        
        // Emit to receiver's personal room
        chatNs.to(`user-${message.receiverId}`).emit('new-message', message);
        
        // Emit to appointment room if applicable
        if (message.appointmentId) {
          chatNs.to(`appointment-${message.appointmentId}`).emit('appointment-message', message);
        }
        
        logger.info(`Message emitted via REST: ${message.id} from ${message.senderId} to ${message.receiverId}`);
      } catch (emitErr) {
        // Do not fail the request if socket is not initialized
        console.error('Socket emit error (sendMessage REST):', emitErr);
      }

      // Optional: send push/notification if notification services are available
      try {
        if (global.notificationServices?.sendMessageNotification && content) {
          await global.notificationServices.sendMessageNotification(
            message.senderId,
            message.receiverId,
            content
          );
        }
      } catch (notifyErr) {
        console.error('Notification error (sendMessage REST):', notifyErr);
      }

      return res.status(201).json(messageResponse(message, true));
    } catch (error) {
      console.error('Send message error:', error);
      return res.status(500).json(serverErrorResponse('Failed to send message'));
    }
  }

  // Mark message as read
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id) {
        return res.status(400).json(errorResponse('Message ID is required', 400));
      }

      const message = await prisma.message.findUnique({
        where: { id: parseInt(id) }
      });

      if (!message) {
        return res.status(404).json(notFoundResponse('Message not found'));
      }

      if (message.receiverId !== parseInt(userId)) {
        return res.status(403).json(errorResponse('You can only mark messages sent to you as read', 403));
      }

      const updatedMessage = await prisma.message.update({
        where: { id: parseInt(id) },
        data: { isRead: true }
      });

      return res.json(messageResponse(updatedMessage, true));
    } catch (error) {
      console.error('Mark message as read error:', error);
      return res.status(500).json(serverErrorResponse('Failed to mark message as read'));
    }
  }

  // Delete message
  async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id) {
        return res.status(400).json(errorResponse('Message ID is required', 400));
      }

      const message = await prisma.message.findUnique({
        where: { id: parseInt(id) }
      });

      if (!message) {
        return res.status(404).json(notFoundResponse('Message not found'));
      }

      if (message.senderId !== parseInt(userId)) {
        return res.status(403).json(errorResponse('You can only delete your own messages', 403));
      }

      await prisma.message.delete({
        where: { id: parseInt(id) }
      });

      return res.json(successResponse(null, 'Message deleted successfully'));
    } catch (error) {
      console.error('Delete message error:', error);
      return res.status(500).json(serverErrorResponse('Failed to delete message'));
    }
  }
}

export default new MessageController();
