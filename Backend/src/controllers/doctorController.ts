import { Request, Response } from 'express';
import prisma from '../prisma';

export const doctorController = {
  // Get all doctors
  async getAllDoctors(req: Request, res: Response) {
    try {
      const doctors = await prisma.doctor.findMany({
        include: {
          user: true,
          availability: true,
          appointments: true,
          ratings: true,
        },
      });
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch doctors' });
    }
  },

  // Get doctor by ID
  async getDoctorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doctor = await prisma.doctor.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: true,
          availability: true,
          appointments: true,
          ratings: true,
        },
      });
      
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }
      
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch doctor' });
    }
  },

  // Create new doctor
  async createDoctor(req: Request, res: Response) {
    try {
      const { userId, specialization, qualifications, experience, bio } = req.body;
      
      const doctor = await prisma.doctor.create({
        data: {
          userId,
          specialization,
          qualifications,
          experience,
          bio,
        },
      });
      
      res.status(201).json(doctor);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create doctor' });
    }
  },

  // Update doctor
  async updateDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { specialization, qualifications, experience, bio } = req.body;
      
      const doctor = await prisma.doctor.update({
        where: { id: parseInt(id) },
        data: {
          specialization,
          qualifications,
          experience,
          bio,
        },
      });
      
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update doctor' });
    }
  },

  // Delete doctor
  async deleteDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.doctor.delete({
        where: { id: parseInt(id) },
      });
      
      res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete doctor' });
    }
  },

  // Get doctors by specialization
  async getDoctorsBySpecialization(req: Request, res: Response) {
    try {
      const { specialization } = req.params;
      
      const doctors = await prisma.doctor.findMany({
        where: { specialization },
        include: {
          user: true,
          availability: true,
          ratings: true,
        },
      });
      
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch doctors by specialization' });
    }
  },
};
