import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { doctorId, rating, comment } = req.body;

    if (!doctorId || !rating) {
      return res.status(400).json({ error: 'Doctor ID and rating are required' });
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        doctorId: parseInt(doctorId),
        patientId: patient.id
      }
    });

    if (existingReview) {
      return res.status(409).json({ error: 'You have already reviewed this doctor' });
    }

    const review = await prisma.review.create({
      data: {
        doctorId: parseInt(doctorId),
        patientId: patient.id,
        rating: parseInt(rating),
        comment
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

    // Update doctor's average rating
    const doctorReviews = await prisma.review.findMany({
      where: { doctorId: parseInt(doctorId) }
    });

    const avgRating = doctorReviews.reduce((sum, review) => sum + review.rating, 0) / doctorReviews.length;

    await prisma.doctorProfile.update({
      where: { id: parseInt(doctorId) },
      data: { avgReview: avgRating }
    });

    // Create notification for doctor
    await prisma.notification.create({
      data: {
        userId: review.doctor.user.id,
        type: 'REVIEW',
        content: `New review from ${patient.firstName} ${patient.lastName}`
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Get all reviews for a doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { doctorId: parseInt(doctorId) },
      include: {
        patient: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get reviews by patient
router.get('/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { patientId: parseInt(patientId) },
      include: {
        doctor: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get review by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
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

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Update review
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: {
          include: { user: true }
        }
      }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.patient.user.id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this review' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        ...(rating && { rating: parseInt(rating) }),
        ...(comment && { comment })
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

    // Update doctor's average rating
    const doctorReviews = await prisma.review.findMany({
      where: { doctorId: updatedReview.doctorId }
    });

    const avgRating = doctorReviews.reduce((sum, review) => sum + review.rating, 0) / doctorReviews.length;

    await prisma.doctorProfile.update({
      where: { id: updatedReview.doctorId },
      data: { avgReview: avgRating }
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: {
          include: { user: true }
        }
      }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.patient.user.id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this review' });
    }

    const doctorId = review.doctorId;
    await prisma.review.delete({
      where: { id: parseInt(id) }
    });

    // Update doctor's average rating
    const doctorReviews = await prisma.review.findMany({
      where: { doctorId }
    });

    const avgRating = doctorReviews.length > 0 
      ? doctorReviews.reduce((sum, review) => sum + review.rating, 0) / doctorReviews.length 
      : 0;

    await prisma.doctorProfile.update({
      where: { id: doctorId },
      data: { avgReview: avgRating }
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
