import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Send message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiverId, content, type, appointmentId, fileId } = req.body;

    if (!receiverId || !content || !type) {
      return res.status(400).json({ error: 'Receiver ID, content, and type are required' });
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId: parseInt(receiverId),
        content,
        type,
        appointmentId: appointmentId ? parseInt(appointmentId) : null,
        fileId: fileId ? parseInt(fileId) : null
      },
      include: {
        sender: {
          select: { id: true, email: true }
        },
        receiver: {
          select: { id: true, email: true }
        }
      }
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: parseInt(receiverId),
        type: 'MESSAGE',
        content: `New message from ${req.user.email}`
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId, appointmentId } = req.query;
    
    let where = {
      OR: [
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ]
    };

    if (userId) {
      where.OR = [
        { senderId: req.user.id, receiverId: parseInt(userId) },
        { senderId: parseInt(userId), receiverId: req.user.id }
      ];
    }

    if (appointmentId) {
      where.appointmentId = parseInt(appointmentId);
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: { id: true, email: true }
        },
        receiver: {
          select: { id: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get conversation between two users
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: parseInt(userId) },
          { senderId: parseInt(userId), receiverId: req.user.id }
        ]
      },
      include: {
        sender: {
          select: { id: true, email: true }
        },
        receiver: {
          select: { id: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Mark message as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

export default router;
