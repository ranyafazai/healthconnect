import { Request, Response } from 'express';
import prisma from '../prisma';

export const appointmentController = {
  // Get all appointments
  async getAllAppointments(req: Request, res: Response) {
    try {
      const appointments = await prisma.appointment.findMany({
        include: {
          patient: {
            include: { user: true }
          },
          doctor: {
            include: { user: true }
          },
          chatMessages: true,
          ratings: true,
        },
      });
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  },

  // Get appointment by ID
  async getAppointmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) },
        include: {
          patient: {
            include: { user: true }
          },
          doctor: {
            include: { user: true }
          },
          chatMessages: true,
          ratings: true,
        },
      });
      
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch appointment' });
    }
  },

  // Create new appointment
  async createAppointment(req: Request, res: Response) {
    try {
      const { patientId, doctorId, dateTime, duration, status, videoLink } = req.body;
      
      const appointment = await prisma.appointment.create({
        data: {
          patientId,
          doctorId,
          dateTime: new Date(dateTime),
          duration,
          status,
          videoLink,
        },
      });
      
      res.status(201).json(appointment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  },

  // Update appointment
  async updateAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { dateTime, duration, status, videoLink } = req.body;
      
      const appointment = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: {
          dateTime: dateTime ? new Date(dateTime) : undefined,
          duration,
          status,
          videoLink,
        },
      });
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  },

  // Get appointments by patient
  async getAppointmentsByPatient(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      
      const appointments = await prisma.appointment.findMany({
        where: { patientId: parseInt(patientId) },
        include: {
          doctor: {
            include: { user: true }
          },
          ratings: true,
        },
      });
      
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch appointments by patient' });
    }
  },

  // Get appointments by doctor
  async getAppointmentsByDoctor(req: Request, res: Response) {
    try {
      const { doctorId } = req.params;
      
      const appointments = await prisma.appointment.findMany({
        where: { doctorId: parseInt(doctorId) },
        include: {
          patient: {
            include: { user: true }
          },
          ratings: true,
        },
      });
      
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch appointments by doctor' });
    }
  },
};
