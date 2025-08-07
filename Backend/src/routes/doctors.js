import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const { city, specialization, minRating } = req.query;
    
    const where = {};
    if (city) where.city = city;
    if (specialization) where.specialization = specialization;
    if (minRating) where.avgReview = { gte: parseFloat(minRating) };

    const doctors = await prisma.doctorProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true }
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            patient: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, email: true }
        },
        reviews: {
          include: {
            patient: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        appointments: {
          select: {
            id: true,
            date: true,
            status: true,
            patient: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// Update doctor profile
router.put('/:id', authenticateToken, authorizeRole('DOCTOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const doctorData = req.body;

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    if (doctor.user.id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const updatedDoctor = await prisma.doctorProfile.update({
      where: { id: parseInt(id) },
      data: doctorData,
      include: {
        user: {
          select: { id: true, email: true }
        }
      }
    });

    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update doctor profile' });
  }
});

// Get doctor's appointments
router.get('/:id/appointments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const where = { doctorId: parseInt(id) };
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
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

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

export default router;
