import { Request, Response } from 'express';
import prisma from '../prisma';

export const availabilityController = {
  // Get all availability slots
  async getAllAvailability(req: Request, res: Response) {
    try {
      const availability = await prisma.availability.findMany({
        include: {
          doctor: {
            include: { user: true }
          },
        },
      });
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch availability' });
    }
  },

  // Get availability by ID
  async getAvailabilityById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const availability = await prisma.availability.findUnique({
        where: { id: parseInt(id) },
        include: {
          doctor: {
            include: { user: true }
          },
        },
      });
      
      if (!availability) {
        return res.status(404).json({ error: 'Availability not found' });
      }
      
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch availability' });
    }
  },

  // Create new availability
  async createAvailability(req: Request, res: Response) {
    try {
      const { doctorId, day, startTime, endTime } = req.body;
      
      const availability = await prisma.availability.create({
        data: {
          doctorId,
          day,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        },
      });
      
      res.status(201).json(availability);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create availability' });
    }
  },

  // Update availability
  async updateAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { day, startTime, endTime } = req.body;
      
      const availability = await prisma.availability.update({
        where: { id: parseInt(id) },
        data: {
          day,
          startTime: startTime ? new Date(startTime) : undefined,
          endTime: endTime ? new Date(endTime) : undefined,
        },
      });
      
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update availability' });
    }
  },

  // Delete availability
  async deleteAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.availability.delete({
        where: { id: parseInt(id) },
      });
      
      res.json({ message: 'Availability deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete availability' });
    }
  },

  // Get availability by doctor
  async getAvailabilityByDoctor(req: Request, res: Response) {
    try {
      const { doctorId } = req.params;
      
      const availability = await prisma.availability.findMany({
        where: { doctorId: parseInt(doctorId) },
        orderBy: {
          startTime: 'asc',
        },
      });
      
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch availability by doctor' });
    }
  },
};
