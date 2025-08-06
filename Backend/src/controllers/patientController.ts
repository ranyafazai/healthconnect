import { Request, Response } from 'express';
import prisma from '../prisma';

export const patientController = {
  // Get all patients
  async getAllPatients(req: Request, res: Response) {
    try {
      const patients = await prisma.patient.findMany({
        include: {
          user: true,
          appointments: true,
          ratings: true,
        },
      });
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch patients' });
    }
  },

  // Get patient by ID
  async getPatientById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patient = await prisma.patient.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: true,
          appointments: true,
          ratings: true,
        },
      });
      
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch patient' });
    }
  },

  // Create new patient
  async createPatient(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      
      const patient = await prisma.patient.create({
        data: {
          userId,
        },
      });
      
      res.status(201).json(patient);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create patient' });
    }
  },

  // Delete patient
  async deletePatient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.patient.delete({
        where: { id: parseInt(id) },
      });
      
      res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete patient' });
    }
  },
};
