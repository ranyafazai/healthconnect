import { prisma } from '../app.js';
import socketConfig from '../config/socket.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  serverErrorResponse,
  // listResponse,
  forbiddenResponse
} from '../utils/responseFormatter.js';

class ReviewController {
  // Get review stats for a doctor
  async getDoctorReviewStats(req, res) {
    try {
      const { doctorId } = req.params;
      if (!doctorId) {
        return res.status(400).json(errorResponse('Doctor ID is required', 400));
      }

      const id = parseInt(doctorId);

      // Aggregate stats
      const [totalReviews, avgResult, distribution] = await Promise.all([
        prisma.review.count({ where: { doctorId: id } }),
        prisma.review.aggregate({
          _avg: { rating: true },
          where: { doctorId: id },
        }),
        prisma.review.groupBy({
          by: ['rating'],
          _count: { rating: true },
          where: { doctorId: id },
        })
      ]);

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      distribution.forEach((row) => {
        ratingDistribution[row.rating] = row._count.rating;
      });

      const averageRating = Number(avgResult._avg.rating || 0);

      // Basic analysis placeholder (can be expanded later)
      const analysis = {
        topFeedback: {},
        commonKeywords: [],
        sentiment: averageRating >= 4 ? 'positive' : averageRating >= 3 ? 'mixed' : 'negative',
      };

      const stats = {
        totalReviews,
        averageRating,
        ratingDistribution,
        analysis,
      };

      return res.json(successResponse(stats, 'Doctor review stats retrieved successfully'));
    } catch (error) {
      console.error('Get doctor review stats error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get doctor review stats'));
    }
  }
  // Create a review
  async createReview(req, res) {
    try {
      const { doctorId, rating, comment, appointmentId } = req.body;
      const patientId = req.user.patientProfile?.id;

      if (!patientId) {
        return res.status(403).json(errorResponse('Access denied. Patient profile required.', 403));
      }

      if (!doctorId || !rating) {
        return res.status(400).json(errorResponse('Missing required fields: doctorId, rating', 400));
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json(errorResponse('Rating must be between 1 and 5', 400));
      }

      // Check if patient has already reviewed this doctor
      const existingReview = await prisma.review.findFirst({
        where: {
          doctorId: parseInt(doctorId),
          patientId: parseInt(patientId)
        }
      });

      let resultReview;
      let action = 'created';

      if (existingReview) {
        // Update existing review instead of returning 400
        action = 'updated';
        resultReview = await prisma.review.update({
          where: { id: existingReview.id },
          data: {
            rating: parseInt(rating),
            comment: comment || null,
            appointmentId: appointmentId ? parseInt(appointmentId) : existingReview.appointmentId || null
          },
          include: {
            doctor: {
              select: {
                userId: true,
                firstName: true,
                lastName: true
              }
            },
            patient: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        });
      } else {
        // Create a new review
        resultReview = await prisma.review.create({
          data: {
            doctorId: parseInt(doctorId),
            patientId: parseInt(patientId),
            rating: parseInt(rating),
            comment: comment || null,
            appointmentId: appointmentId ? parseInt(appointmentId) : null
          },
          include: {
            doctor: {
              select: {
                userId: true,
                firstName: true,
                lastName: true
              }
            },
            patient: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        });
      }

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
      try {
        await prisma.notification.create({
          data: {
            userId: resultReview.doctor.userId,
            type: 'REVIEW',
            content: action === 'created'
              ? `New ${rating}-star review from ${resultReview.patient.firstName} ${resultReview.patient.lastName}`
              : `Updated review: ${rating}-star from ${resultReview.patient.firstName} ${resultReview.patient.lastName}`
          }
        });
      } catch (notifErr) {
        console.error('Notification create error (review):', notifErr);
      }

      // Emit notification via socket if available
      try {
        const io = socketConfig.getIO();
        const notificationNs = io.of('/notifications');
        notificationNs.to(`user-${resultReview.doctor.userId}`).emit('new-notification', {
          type: 'REVIEW',
          content: action === 'created'
            ? `New ${rating}-star review from ${resultReview.patient.firstName} ${resultReview.patient.lastName}`
            : `Updated review: ${rating}-star from ${resultReview.patient.firstName} ${resultReview.patient.lastName}`
        });
      } catch (socketErr) {
        console.error('Socket emit error (review notification):', socketErr);
      }

      return res.json(successResponse(resultReview, action === 'created' ? 'Review created successfully' : 'Review updated successfully'));
    } catch (error) {
      console.error('Create review error:', error);
      return res.status(500).json(serverErrorResponse('Failed to create review'));
    }
  }

  // Get reviews by doctor ID
  async getReviewsByDoctor(req, res) {
    try {
      const { doctorId } = req.params;

      if (!doctorId) {
        return res.status(400).json(errorResponse('Doctor ID is required', 400));
      }

      const reviews = await prisma.review.findMany({
        where: { doctorId: parseInt(doctorId) },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(successResponse(reviews, 'Doctor reviews retrieved successfully'));
    } catch (error) {
      console.error('Get doctor reviews error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get doctor reviews'));
    }
  }

  // Get reviews by patient ID
  async getReviewsByPatient(req, res) {
    try {
      const { patientId } = req.params;
      const requestingPatientId = req.user.patientProfile?.id;

      if (!patientId) {
        return res.status(400).json(errorResponse('Patient ID is required', 400));
      }

      // Ensure the requesting user can only see their own reviews
      if (parseInt(patientId) !== requestingPatientId) {
        return res.status(403).json(forbiddenResponse('You can only view your own reviews'));
      }

      const reviews = await prisma.review.findMany({
        where: { patientId: parseInt(patientId) },
        include: {
          doctor: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(successResponse(reviews, 'Patient reviews retrieved successfully'));
    } catch (error) {
      console.error('Get patient reviews error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get patient reviews'));
    }
  }

  // Get review by ID
  async getReviewById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(errorResponse('Review ID is required', 400));
      }

      const review = await prisma.review.findUnique({
        where: { id: parseInt(id) },
        include: {
          doctor: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          patient: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!review) {
        return res.status(404).json(notFoundResponse('Review not found'));
      }

      return res.json(successResponse(review, 'Review retrieved successfully'));
    } catch (error) {
      console.error('Get review error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get review'));
    }
  }

  // Update review
  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const patientId = req.user.patientProfile?.id;

      if (!patientId) {
        return res.status(403).json(errorResponse('Access denied. Patient profile required.', 403));
      }

      if (!id) {
        return res.status(400).json(errorResponse('Review ID is required', 400));
      }

      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json(errorResponse('Rating must be between 1 and 5', 400));
      }

      const review = await prisma.review.findUnique({
        where: { id: parseInt(id) }
      });

      if (!review) {
        return res.status(404).json(notFoundResponse('Review not found'));
      }

      if (review.patientId !== parseInt(patientId)) {
        return res.status(403).json(forbiddenResponse('You can only update your own reviews'));
      }

      const updatedReview = await prisma.review.update({
        where: { id: parseInt(id) },
        data: {
          rating: rating ? parseInt(rating) : undefined,
          comment: comment !== undefined ? comment : undefined
        },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          patient: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      // Update doctor's average rating if rating changed
      if (rating) {
        const doctorReviews = await prisma.review.findMany({
          where: { doctorId: review.doctorId }
        });

        const avgRating = doctorReviews.reduce((sum, r) => sum + r.rating, 0) / doctorReviews.length;

        await prisma.doctorProfile.update({
          where: { id: review.doctorId },
          data: { avgReview: avgRating }
        });
      }

      return res.json(successResponse(updatedReview, 'Review updated successfully'));
    } catch (error) {
      console.error('Update review error:', error);
      return res.status(500).json(serverErrorResponse('Failed to update review'));
    }
  }

  // Delete review
  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const patientId = req.user.patientProfile?.id;

      if (!patientId) {
        return res.status(403).json(errorResponse('Access denied. Patient profile required.', 403));
      }

      if (!id) {
        return res.status(400).json(errorResponse('Review ID is required', 400));
      }

      const review = await prisma.review.findUnique({
        where: { id: parseInt(id) }
      });

      if (!review) {
        return res.status(404).json(notFoundResponse('Review not found'));
      }

      if (review.patientId !== parseInt(patientId)) {
        return res.status(403).json(forbiddenResponse('You can only delete your own reviews'));
      }

      await prisma.review.delete({
        where: { id: parseInt(id) }
      });

      // Update doctor's average rating
      const doctorReviews = await prisma.review.findMany({
        where: { doctorId: review.doctorId }
      });

      const avgRating = doctorReviews.length > 0 
        ? doctorReviews.reduce((sum, r) => sum + r.rating, 0) / doctorReviews.length 
        : 0;

      await prisma.doctorProfile.update({
        where: { id: review.doctorId },
        data: { avgReview: avgRating }
      });

      return res.json(successResponse(null, 'Review deleted successfully'));
    } catch (error) {
      console.error('Delete review error:', error);
      return res.status(500).json(serverErrorResponse('Failed to delete review'));
    }
  }

  // Get all reviews (admin only)
  async getAllReviews(req, res) {
    try {
      const reviews = await prisma.review.findMany({
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          patient: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(successResponse(reviews, 'All reviews retrieved successfully'));
    } catch (error) {
      console.error('Get all reviews error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get all reviews'));
    }
  }
}

export default new ReviewController();
