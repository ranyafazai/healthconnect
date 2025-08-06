import { Request, Response } from 'express';
import prisma from '../prisma';

export const ratingController = {
  // Get all ratings
  async getAllRatings(req: Request, res: Response) {
    try {
      const ratings = await prisma.rating.findMany({
        include: {
          appointment: true,
          patient: {
            include: { user: true }
          },
          doctor: {
            include: { user: true }
          },
        },
      });
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch ratings' });
    }
  },

  // Get rating by ID
  async getRatingById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rating = await prisma.rating.findUnique({
        where: { id: parseInt(id) },
        include: {
          appointment: true,
          patient: {
            include: { user: true }
          },
          doctor: {
            include: { user: true }
          },
        },
      });
      
      if (!rating) {
        return res.status(404).json({ error: 'Rating not found' });
      }
      
      res.json(rating);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rating' });
    }
  },

  // Create new rating
  async createRating(req: Request, res: Response) {
    try {
      const { appointmentId, patientId, doctorId, rating, review } = req.body;
      
      const existingRating = await prisma.rating.findFirst({
        where: {
          appointmentId: parseInt(appointmentId),
          patientId: parseInt(patientId),
          doctorId: parseInt(doctorId),
        },
      });
      
      if (existingRating) {
        return res.status(400).json({ error: 'Rating already exists for this appointment' });
      }
      
      const newRating = await prisma.rating.create({
        data: {
          appointmentId: parseInt(appointmentId),
          patientId: parseInt(patientId),
          doctorId: parseInt(doctorId),
          rating: parseInt(rating),
          review,
        },
        include: {
          appointment: true,
          patient: {
            include: { user: true }
          },
          doctor: {
            include: { user: true }
          },
        },
      });
      
      res.status(201).json(newRating);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create rating' });
    }
  },

  // Update rating
  async updateRating(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rating, review } = req.body;
      
      const updatedRating = await prisma.rating.update({
        where: { id: parseInt(id) },
        data: {
          rating: rating ? parseInt(rating) : undefined,
          review,
        },
        include: {
          appointment: true,
          patient: {
            include: { user: true }
          },
          doctor: {
            include: { user: true }
          },
        },
      });
      
      res.json(updatedRating);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update rating' });
    }
  },

  // Delete rating
  async deleteRating(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.rating.delete({
        where: { id: parseInt(id) },
      });
      
      res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete rating' });
    }
  },

  // Get ratings by doctor
  async getRatingsByDoctor(req: Request, res: Response) {
    try {
      const { doctorId } = req.params;
      
      const ratings = await prisma.rating.findMany({
        where: { doctorId: parseInt(doctorId) },
        include: {
          appointment: true,
          patient: {
            include: { user: true }
          },
        },
      });
      
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch ratings by doctor' });
    }
  },

  // Get average rating for doctor
  async getAverageRatingForDoctor(req: Request, res: Response) {
    try {
      const { doctorId } = req.params;
      
      const result = await prisma.rating.aggregate({
        where: { doctorId: parseInt(doctorId) },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      });
      
      res.json({
        averageRating: result._avg.rating || 0,
        totalRatings: result._count.rating,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to calculate average rating' });
    }
  },
};
