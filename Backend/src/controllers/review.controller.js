import { prisma } from '../app.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  serverErrorResponse,
  createdResponse,
  reviewResponse,
  listResponse,
  paginatedResponse,
  forbiddenResponse
} from '../utils/responseFormatter.js';

class ReviewController {
  // Create a review
  async createReview(req, res) {
    try {
      const { doctorId, rating, comment, appointmentId } = req.body;
      const patientId = req.user.patientProfile?.id;

      if (!patientId) {
        return errorResponse(res, 403, 'Access denied. Patient profile required.');
      }

      if (!doctorId || !rating) {
        return errorResponse(res, 400, 'Missing required fields: doctorId, rating');
      }

      if (rating < 1 || rating > 5) {
        return errorResponse(res, 400, 'Rating must be between 1 and 5');
      }

      // Check if patient has already reviewed this doctor
      const existingReview = await prisma.review.findFirst({
        where: {
          doctorId: parseInt(doctorId),
          patientId: parseInt(patientId)
        }
      });

      if (existingReview) {
        return errorResponse(res, 400, 'You have already reviewed this doctor');
      }

      const review = await prisma.review.create({
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
          userId: review.doctor.userId,
          type: 'REVIEW',
          content: `New ${rating}-star review from ${review.patient.firstName} ${review.patient.lastName}`
        }
      });

      return res.json(createdResponse(review, 'Review created successfully'));
    } catch (error) {
      console.error('Create review error:', error);
      return serverErrorResponse(res, 'Failed to create review', error.message);
    }
  }

  // Get reviews by doctor ID
  async getReviewsByDoctor(req, res) {
    try {
      const { doctorId } = req.params;

      if (!doctorId) {
        return errorResponse(res, 400, 'Doctor ID is required');
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
      return serverErrorResponse(res, 'Failed to get doctor reviews', error.message);
    }
  }

  // Get reviews by patient ID
  async getReviewsByPatient(req, res) {
    try {
      const { patientId } = req.params;
      const requestingPatientId = req.user.patientProfile?.id;

      if (!patientId) {
        return errorResponse(res, 400, 'Patient ID is required');
      }

      // Ensure the requesting user can only see their own reviews
      if (parseInt(patientId) !== requestingPatientId) {
        return forbiddenResponse(res, 'You can only view your own reviews');
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
      return serverErrorResponse(res, 'Failed to get patient reviews', error.message);
    }
  }

  // Get review by ID
  async getReviewById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return errorResponse(res, 400, 'Review ID is required');
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
        return notFoundResponse(res, 'Review not found');
      }

      return res.json(successResponse(review, 'Review retrieved successfully'));
    } catch (error) {
      console.error('Get review error:', error);
      return serverErrorResponse(res, 'Failed to get review', error.message);
    }
  }

  // Update review
  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const patientId = req.user.patientProfile?.id;

      if (!patientId) {
        return errorResponse(res, 403, 'Access denied. Patient profile required.');
      }

      if (!id) {
        return errorResponse(res, 400, 'Review ID is required');
      }

      if (rating && (rating < 1 || rating > 5)) {
        return errorResponse(res, 400, 'Rating must be between 1 and 5');
      }

      const review = await prisma.review.findUnique({
        where: { id: parseInt(id) }
      });

      if (!review) {
        return notFoundResponse(res, 'Review not found');
      }

      if (review.patientId !== parseInt(patientId)) {
        return forbiddenResponse(res, 'You can only update your own reviews');
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
      return serverErrorResponse(res, 'Failed to update review', error.message);
    }
  }

  // Delete review
  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const patientId = req.user.patientProfile?.id;

      if (!patientId) {
        return errorResponse(res, 403, 'Access denied. Patient profile required.');
      }

      if (!id) {
        return errorResponse(res, 400, 'Review ID is required');
      }

      const review = await prisma.review.findUnique({
        where: { id: parseInt(id) }
      });

      if (!review) {
        return notFoundResponse(res, 'Review not found');
      }

      if (review.patientId !== parseInt(patientId)) {
        return forbiddenResponse(res, 'You can only delete your own reviews');
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
      return serverErrorResponse(res, 'Failed to delete review', error.message);
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
      return serverErrorResponse(res, 'Failed to get all reviews', error.message);
    }
  }
}

export default new ReviewController();
