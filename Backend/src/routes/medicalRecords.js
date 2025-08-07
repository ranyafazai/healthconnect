import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create medical record
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, title, description, fileId } = req.body;

    if (!patientId || !title) {
      return res.status(400).json({ error: 'Patient ID and title are required' });
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { id: parseInt(patientId) }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId: parseInt(patientId),
        title,
        description,
        fileId: fileId ? parseInt(fileId) : null
      },
      include: {
        patient: {
          include: {
            user: {
              select: { email: true }
            }
          }
        },
        file: true
      }
    });

    res.status(201).json(medicalRecord);
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ error: 'Failed to create medical record' });
  }
});

// Get all medical records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.query;

    let where = {};
    if (patientId) where.patientId = parseInt(patientId);

    // If patient, only show their own records
    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({
        where: { userId: req.user.id }
      });
      where.patientId = patient.id;
    }

    const medicalRecords = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: {
          include: {
            user: {
              select: { email: true }
            }
          }
        },
        file: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(medicalRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
});

// Get medical record by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: {
          include: {
            user: {
              select: { email: true }
            }
          }
        },
        file: true
      }
    });

    if (!medicalRecord) {
      return res.status(404).json({ error: 'Medical record not found' });
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && medicalRecord.patient.user.id === req.user.id;
    const isDoctor = req.user.role === 'DOCTOR';

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ error: 'Unauthorized to view this medical record' });
    }

    res.json(medicalRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medical record' });
  }
});

// Get medical records for a specific patient
router.get('/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && parseInt(patientId) === (await prisma.patientProfile.findUnique({ where: { userId: req.user.id } }))?.id;
    const isDoctor = req.user.role === 'DOCTOR';

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ error: 'Unauthorized to view these medical records' });
    }

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: { patientId: parseInt(patientId) },
      include: {
        patient: {
          include: {
            user: {
              select: { email: true }
            }
          }
        },
        file: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(medicalRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
});

// Update medical record
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, fileId } = req.body;

    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: {
          include: { user: true }
        }
      }
    });

    if (!medicalRecord) {
      return res.status(404).json({ error: 'Medical record not found' });
    }

    // Check authorization
    const isDoctor = req.user.role === 'DOCTOR';
    const isPatient = req.user.role === 'PATIENT' && medicalRecord.patient.user.id === req.user.id;

    if (!isDoctor && !isPatient) {
      return res.status(403).json({ error: 'Unauthorized to update this medical record' });
    }

    const updatedMedicalRecord = await prisma.medicalRecord.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        fileId: fileId ? parseInt(fileId) : null
      },
      include: {
        patient: {
          include: {
            user: {
              select: { email: true }
            }
          }
        },
        file: true
      }
    });

    res.json(updatedMedicalRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update medical record' });
  }
});

// Delete medical record
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: {
          include: { user: true }
        }
      }
    });

    if (!medicalRecord) {
      return res.status(404).json({ error: 'Medical record not found' });
    }

    // Check authorization
    const isDoctor = req.user.role === 'DOCTOR';
    const isPatient = req.user.role === 'PATIENT' && medicalRecord.patient.user.id === req.user.id;

    if (!isDoctor && !isPatient) {
      return res.status(403).json({ error: 'Unauthorized to delete this medical record' });
    }

    await prisma.medicalRecord.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete medical record' });
  }
});

export default router;
