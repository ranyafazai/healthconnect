import express from 'express';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { role, id } = req.user;

    let profile;
    if (role === 'DOCTOR') {
      profile = await prisma.doctorProfile.findUnique({
        where: { userId: id },
        include: {
          user: {
            select: { email: true }
          }
        }
      });
    } else {
      profile = await prisma.patientProfile.findUnique({
        where: { userId: id },
        include: {
          user: {
            select: { email: true }
          }
        }
      });
    }

    if (!profile) {
      const error = new Error('Profile not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const updateData = req.body;

    let profile;
    if (role === 'DOCTOR') {
      profile = await prisma.doctorProfile.update({
        where: { userId: id },
        data: updateData
      });
    } else {
      profile = await prisma.patientProfile.update({
        where: { userId: id },
        data: updateData
      });
    }

    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

export default router;
