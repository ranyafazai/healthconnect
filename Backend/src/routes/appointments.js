import express from 'express';
import prisma from '../config/database';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

// Get all appointments for authenticated user
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { role, id } = req.user;
    
    let appointments;
    
    if (role === 'DOCTOR') {
      appointments = await prisma.appointment.findMany({
        where: { doctorId: id },
        include: {
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
    } else {
      appointments = await prisma.appointment.findMany({
        where: { patientId: id },
        include: {
          doctor: {
            include: {
              user: {
                select: { email: true }
              }
            }
          }
        },
        orderBy: { date: 'asc' }
      });
    }

    res.json({ appointments });
  } catch (error) {
    next(error);
  }
});

// Create appointment
router.post('/', authenticateToken, authorizeRole(['PATIENT']), async (req, res, next) => {
  try {
    const { doctorId, date, type, reason } = req.body;

    if (!doctorId || !date || !type) {
      const error = new Error('Doctor ID, date, and type are required');
      error.statusCode = 400;
      throw error;
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: parseInt(doctorId),
        patientId: req.user.id,
        date: new Date(date),
        type,
        reason,
        status: 'PENDING',
      },
      include: {
        doctor: {
          select: {
            userId: true,
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
        userId: appointment.doctor.userId,
        type: 'APPOINTMENT',
        content: `New appointment request from patient ${req.user.email}`,
      }
    });

    res.status(201).json({ appointment });
  } catch (error) {
    next(error);
  }
});

// Update appointment status
router.patch('/:id/status', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        doctor: {
          select: {
            userId: true,
            user: {
              select: { email: true }
            }
          }
        },
        patient: {
          select: {
            userId: true,
            user: {
              select: { email: true }
            }
          }
        }
      }
    });

    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user is authorized to update this appointment
    if (req.user.role === 'DOCTOR' && appointment.doctor.userId !== req.user.id) {
      const error = new Error('Not authorized to update this appointment');
      error.statusCode = 403;
      throw error;
    }

    if (req.user.role === 'PATIENT' && appointment.patient.userId !== req.user.id) {
      const error = new Error('Not authorized to update this appointment');
      error.statusCode = 403;
      throw error;
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        doctor: {
          select: {
            user: {
              select: { email: true }
            }
          }
        },
        patient: {
          select: {
            user: {
              select: { email: true }
            }
          }
        }
      }
    });

    // Create notification for the other party
    const recipientId = req.user.role === 'DOCTOR' 
      ? appointment.patient.userId 
      : appointment.doctor.userId;
    
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'APPOINTMENT',
        content: `Appointment status updated to ${status}`,
      }
    });

    res.json({ appointment: updatedAppointment });
  } catch (error) {
    next(error);
  }
});

export default router;
