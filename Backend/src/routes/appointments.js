import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { doctorId, date, type, reason } = req.body;

    if (!doctorId || !date || !type) {
      return res.status(400).json({ error: 'Doctor ID, date, and type are required' });
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: parseInt(doctorId),
        patientId: patient.id,
        date: new Date(date),
        type,
        reason,
        status: 'PENDING'
      },
      include: {
        doctor: {
          include: {
            user: {
              select: { email: true }
            }
          }
        },
        patient: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      }
    });

    // Create notification for doctor
    await prisma.notification.create({
      data: {
        userId: appointment.doctor.user.id,
        type: 'APPOINTMENT',
        content: `New appointment request from ${patient.firstName} ${patient.lastName}`
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Get all appointments (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, doctorId, patientId } = req.query;
    
    let where = {};
    
    if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctorProfile.findUnique({
        where: { userId: req.user.id }
      });
      where.doctorId = doctor.id;
    } else if (req.user.role === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({
        where: { userId: req.user.id }
      });
      where.patientId = patient.id;
    }

    if (status) where.status = status;
    if (doctorId) where.doctorId = parseInt(doctorId);
    if (patientId) where.patientId = parseInt(patientId);

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          include: {
            user: {
              select: { email: true }
            }
          }
        },
        patient: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        doctor: {
          include: {
            user: {
              select: { email: true }
            }
          }
        },
        patient: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check authorization
    const isDoctor = req.user.role === 'DOCTOR' && appointment.doctor.user.id === req.user.id;
    const isPatient = req.user.role === 'PATIENT' && appointment.patient.user.id === req.user.id;

    if (!isDoctor && !isPatient) {
      return res.status(403).json({ error: 'Unauthorized to view this appointment' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Update appointment status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        doctor: {
          include: { user: true }
        },
        patient: {
          include: { user: true }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check authorization
    const isDoctor = req.user.role === 'DOCTOR' && appointment.doctor.user.id === req.user.id;
    const isPatient = req.user.role === 'PATIENT' && appointment.patient.user.id === req.user.id;

    if (!isDoctor && !isPatient) {
      return res.status(403).json({ error: 'Unauthorized to update this appointment' });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        doctor: {
          include: {
            user: {
              select: { email: true }
            }
          }
        },
        patient: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      }
    });

    // Create notification
    const notificationUserId = req.user.role === 'DOCTOR' ? 
      appointment.patient.user.id : appointment.doctor.user.id;
    
    await prisma.notification.create({
      data: {
        userId: notificationUserId,
        type: 'APPOINTMENT',
        content: `Appointment status updated to ${status}`
      }
    });

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Update appointment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, type, reason, notes } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        doctor: {
          include: { user: true }
        },
        patient: {
          include: { user: true }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check authorization
    const isDoctor = req.user.role === 'DOCTOR' && appointment.doctor.user.id === req.user.id;
    const isPatient = req.user.role === 'PATIENT' && appointment.patient.user.id === req.user.id;

    if (!isDoctor && !isPatient) {
      return res.status(403).json({ error: 'Unauthorized to update this appointment' });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        ...(date && { date: new Date(date) }),
        ...(type && { type }),
        ...(reason && { reason }),
        ...(notes && { notes })
      },
      include: {
        doctor: {
          include: {
            user: {
              select: { email: true }
            }
          }
        },
        patient: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      }
    });

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Delete appointment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        doctor: {
          include: { user: true }
        },
        patient: {
          include: { user: true }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check authorization
    const isDoctor = req.user.role === 'DOCTOR' && appointment.doctor.user.id === req.user.id;
    const isPatient = req.user.role === 'PATIENT' && appointment.patient.user.id === req.user.id;

    if (!isDoctor && !isPatient) {
      return res.status(403).json({ error: 'Unauthorized to delete this appointment' });
    }

    await prisma.appointment.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

export default router;
