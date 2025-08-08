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
      const { doctorId, rating, comment } = req.body;
      const patientId = req.user.patientProfile?.id;

      if (!patientId) {
        return formatResponse(res, 403, false, 'Access denied. Patient profile required.');
      }

      if (!doctorId || !rating) {
        return formatResponse(res, 400, false, 'Missing required fields: doctorId, rating');
      }

      if (rating < 1 || rating > 5) {
        return formatResponse(res, 400, false, 'Rating must be between 1 and 5');
      }

      // Check if patient has already reviewed this doctor
      const existingReview = await prisma.review.findFirst({
        where: {
          doctorId: parseInt(doctorId),
          patientId: parseInt(patientId)
        }
      });

      if (existingReview) {
        return formatResponse(res, 400, false, 'You have already reviewed this doctor');
      }

      const review = await prisma.review.create({
        data: {
          doctorId: parseInt(doctorId),
          patientId: parseInt(patientId),
          rating: parseInt(rating),
          comment: comment || null
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

      return formatResponse(res, 201, true, 'Review created successfully', review);
    } catch (error) {
      console.error('Create review error:', error);
      return formatResponse(res, 500, false, 'Failed to create review', null, error.message);
    }
  }

  // Get reviews by doctor ID
  async getReviewsByDoctor(req, res) {
    try {
      const { doctorId } = req.params;

      if (!doctorId) {
        return formatResponse(res, 400, false, 'Doctor ID is required');
      }

      const reviews = await prisma.review.findMany({
        where: { doctorId: parseInt(doctorId) },
        include: {
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

      return formatResponse(res, 200, true, 'Doctor reviews retrieved successfully', reviews);
    } catch (error) {
      console.error('Get doctor reviews error:', error);
      return formatResponse(res, 500, false, 'Failed to get doctor reviews', null, error.message);
    }
  }

  // Get review by ID
  async getReviewById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return formatResponse(res, 400, false, 'Review ID is required');
      }

      const review = await prisma.review.findUnique({
        where: { id: parseInt(id) },
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

      if (!review) {
        return formatResponse(res, 404, false, 'Review not found');
      }

      return formatResponse(res, 200, true, 'Review retrieved successfully', review);
    } catch (error) {
      console.error('Get review error:', error);
      return formatResponse(res, 500, false, 'Failed to get review', null, error.message);
    }
  }

  // Update review
  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const patientId = req.user.patientProfile?.id;

      if (!patientId) {
        return formatResponse(res, 403, false, 'Access denied. Patient profile required.');
      }

      if (!id) {
        return formatResponse(res, 400, false, 'Review ID is required');
      }

      if (rating && (rating < 1 || rating > 5)) {
        return formatResponse(res, 400, false, 'Rating must be between 1 and 5');
      }

      const review = await prisma.review.findUnique({
        where: { id: parseInt(id) }
      });

      if (!review) {
        return formatResponse(res, 404, false, 'Review not found');
      }

      if (review.patientId !== parseInt(patientId)) {
        return formatResponse(res, 403, false, 'You can only update your own reviews');
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

      return formatResponse(res, 200, true, 'Review updated successfully', updatedReview);
    } catch (error) {
      console.error('Update review error:', error);
      return formatResponse(res, 500, false, 'Failed to update review', null, error.message);
    }
  }

  // Delete review
  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const patientId = req.user.patientProfile?.id;

      if (!patientId) {
        return formatResponse(res, 403, false, 'Access denied. Patient profile required.');
      }

      if (!id) {
        return formatResponse(res, 400, false, 'Review ID is required');
      }

      const review = await prisma.review.findUnique({
        where: { id: parseInt(id) }
      });

      if (!review) {
        return formatResponse(res, 404, false, 'Review not found');
      }

      if (review.patientId !== parseInt(patientId)) {
        return formatResponse(res, 403, false, 'You can only delete your own reviews');
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

      return formatResponse(res, 200, true, 'Review deleted successfully');
    } catch (error) {
      console.error('Delete review error:', error);
      return formatResponse(res, 500, false, 'Failed to delete review', null, error.message);
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

      return formatResponse(res, 200, true, 'All reviews retrieved successfully', reviews);
    } catch (error) {
      console.error('Get all reviews error:', error);
      return formatResponse(res, 500, false, 'Failed to get all reviews', null, error.message);
    }
  }
}

export default new ReviewController();
