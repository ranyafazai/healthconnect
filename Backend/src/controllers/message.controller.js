import { prisma } from '../app.js';
import socketConfig from '../config/socket.js';
import logger from '../config/logger.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  serverErrorResponse,
  messageResponse,
  listResponse
} from '../utils/responseFormatter.js';

class MessageController {
  // Get conversation between two users
  async getConversation(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;

      console.log('Getting conversation between users:', { currentUserId, otherUserId: userId });

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

      console.log('Found messages:', messages.length);
      console.log('Messages:', messages);

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
      const currentUserId = req.user.id;

      console.log('Getting messages for appointment:', { appointmentId, currentUserId });

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

      console.log('Found appointment messages:', messages.length);
      console.log('Appointment messages:', messages);

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

  // Debug endpoint to check all messages for current user
  async getAllMessages(req, res) {
    try {
      const userId = req.user.id;
      console.log('Getting all messages for user:', userId);
      
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: parseInt(userId) },
            { receiverId: parseInt(userId) }
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
          appointment: true
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log('Total messages found:', messages.length);
      console.log('Messages:', messages.map(m => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        appointmentId: m.appointmentId,
        content: m.content?.substring(0, 50),
        createdAt: m.createdAt
      })));

      return res.json(successResponse({ messages, count: messages.length }, 'All messages retrieved successfully'));
    } catch (error) {
      console.error('Get all messages error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get all messages'));
    }
  }

  // Send message
  async sendMessage(req, res) {
    try {
      const { receiverId, appointmentId, content, type = 'TEXT', fileId } = req.body;
      const senderId = req.user.id;

      console.log('Sending message:', { senderId, receiverId, appointmentId, content, type });

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

      // If message is bound to an appointment, enforce participant validation
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
        
        // Allow messaging for confirmed appointments (before, during, and after)
        // Only block messaging for cancelled or rejected appointments
        if (appointment.status === 'CANCELLED' || appointment.status === 'REJECTED') {
          return res.status(403).json(errorResponse('Messaging not available for cancelled or rejected appointments', 403));
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

      console.log('Message created successfully:', message.id);

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

      // Create notification for the receiver
      try {
        if (content) {
          const senderName = message.sender.doctorProfile 
            ? `Dr. ${message.sender.doctorProfile.firstName} ${message.sender.doctorProfile.lastName}`
            : `${message.sender.patientProfile.firstName} ${message.sender.patientProfile.lastName}`;

          await prisma.notification.create({
            data: {
              userId: message.receiverId,
              type: 'MESSAGE',
              content: `New message from ${senderName}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`
            }
          });

          // Emit notification via socket if available
          try {
            const io = socketConfig.getIO();
            const notificationNs = io.of('/notifications');
            notificationNs.to(`user-${message.receiverId}`).emit('new-notification', {
              type: 'MESSAGE',
              content: `New message from ${senderName}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`
            });
          } catch (socketErr) {
            console.error('Socket emit error (message notification):', socketErr);
          }
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
