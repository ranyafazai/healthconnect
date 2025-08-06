import { Request, Response } from 'express';
import prisma from '../prisma';

export const chatMessageController = {
  // Get all chat messages
  async getAllChatMessages(req: Request, res: Response) {
    try {
      const messages = await prisma.chatMessage.findMany({
        include: {
          appointment: true,
          sender: true,
        },
      });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
  },

  // Get chat messages by appointment
  async getChatMessagesByAppointment(req: Request, res: Response) {
    try {
      const { appointmentId } = req.params;
      
      const messages = await prisma.chatMessage.findMany({
        where: { appointmentId: parseInt(appointmentId) },
        include: {
          sender: true,
          appointment: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
  },

  // Create new chat message
  async createChatMessage(req: Request, res: Response) {
    try {
      const { appointmentId, senderId, message } = req.body;
      
      const chatMessage = await prisma.chatMessage.create({
        data: {
          appointmentId,
          senderId,
          message,
        },
        include: {
          sender: true,
          appointment: true,
        },
      });
      
      res.status(201).json(chatMessage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create chat message' });
    }
  },

  // Delete chat message
  async deleteChatMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.chatMessage.delete({
        where: { id: parseInt(id) },
      });
      
      res.json({ message: 'Chat message deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete chat message' });
    }
  },
};
