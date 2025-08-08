import express from 'express';
import messageController from '../controllers/message.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get messages between two users
router.get('/conversation/:userId', authMiddleware, messageController.getConversation);

// Get messages by appointment
router.get('/appointment/:appointmentId', authMiddleware, messageController.getMessagesByAppointment);

// Send message
router.post('/', authMiddleware, messageController.sendMessage);

// Mark message as read
router.patch('/:id/read', authMiddleware, messageController.markAsRead);

// Delete message
router.delete('/:id', authMiddleware, messageController.deleteMessage);

export default router;
