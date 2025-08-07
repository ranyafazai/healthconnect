import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await prisma.patientProfile.findMany({
      include: {
        user: {
          select: { id: true, email: true }
        },
        appointments: {
          select: { id: true, date: true, status: true }
        },
        medicalRecords: {
          select: { id: true, title: true, createdAt: true }
        }
      }
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patientProfile.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, email: true }
        },
        appointments: {
          include: {
            doctor: {
              include: {
                user: {
                  select: { email: true }
                }
              }
            }
          }
        },
        medicalRecords: true,
        reviews: {
          include: {
            doctor: {
              include: {
                user: {
                  select: { email: true }
                }
              }
            }
          }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Update patient profile
router.put('/:id', authenticateToken, authorizeRole('PATIENT'), async (req, res) => {
  try {
    const { id } = req.params;
    const patientData = req.body;

    const patient = await prisma.patientProfile.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (patient.user.id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const updatedPatient = await prisma.patientProfile.update({
      where: { id: parseInt(id) },
      data: patientData,
      include: {
        user: {
          select: { id: true, email: true }
        }
      }
    });

    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update patient profile' });
  }
});

// Get patient's appointments
router.get('/:id/appointments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const where = { patientId: parseInt(id) };
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
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

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient appointments' });
  }
});

// Get patient's medical records
router.get('/:id/medical-records', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: { patientId: parseInt(id) },
      include: {
        patient: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(medicalRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
});

export default router;
