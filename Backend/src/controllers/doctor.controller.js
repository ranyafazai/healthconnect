import { prisma } from '../app.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  serverErrorResponse,
  createdResponse,
  doctorResponse,
  listResponse
} from '../utils/responseFormatter.js';

class DoctorController {
  // Get all doctors
  async getAllDoctors(req, res) {
    try {
      const { specialization, rating, availability } = req.query;
      
      let whereClause = {};
      
      if (specialization) {
        whereClause.specialization = specialization;
      }
      
      if (rating) {
        whereClause.avgReview = {
          gte: parseFloat(rating)
        };
      }

      const doctors = await prisma.doctorProfile.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          },
          photo: true,
          reviews: {
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
            }
          }
        }
      });

      return res.json(listResponse(doctors, 'Doctors retrieved successfully', doctors.length));
    } catch (error) {
      console.error('Get all doctors error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get doctors'));
    }
  }

  // Get doctor by ID
  async getDoctorById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(errorResponse('Doctor ID is required', 400));
      }

      const doctor = await prisma.doctorProfile.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          },
          photo: true,
          reviews: {
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
            }
          },
          certifications: {
            include: {
              file: true
            }
          }
        }
      });

      if (!doctor) {
        return res.status(404).json(notFoundResponse('Doctor not found'));
      }

      return res.json(doctorResponse(doctor, true));
    } catch (error) {
      console.error('Get doctor error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get doctor'));
    }
  }

  // Create doctor profile
  async createDoctorProfile(req, res) {
    try {
      const {
        userId,
        firstName,
        lastName,
        professionalBio,
        specialization,
        yearsExperience,
        medicalLicense,
        officeAddress,
        city,
        state,
        zipCode,
        phoneNumber,
        emergencyContact,
        availability
      } = req.body;

      if (!userId || !firstName || !lastName || !specialization || !yearsExperience || !medicalLicense) {
        return res.status(400).json(errorResponse('Missing required fields', 400));
      }

      const doctor = await prisma.doctorProfile.create({
        data: {
          userId: parseInt(userId),
          firstName,
          lastName,
          professionalBio,
          specialization,
          yearsExperience: parseInt(yearsExperience),
          medicalLicense,
          officeAddress,
          city,
          state,
          zipCode,
          phoneNumber,
          emergencyContact,
          availability: JSON.parse(availability || '{}')
        },
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          }
        }
      });

      return res.status(201).json(doctorResponse(doctor, true));
    } catch (error) {
      console.error('Create doctor profile error:', error);
      return res.status(500).json(serverErrorResponse('Failed to create doctor profile'));
    }
  }

  // Update doctor profile
  async updateDoctorProfile(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json(errorResponse('Doctor ID is required', 400));
      }

      // Remove userId from update data to prevent changing the user association
      delete updateData.userId;

      if (updateData.yearsExperience) {
        updateData.yearsExperience = parseInt(updateData.yearsExperience);
      }

      if (updateData.availability) {
        updateData.availability = JSON.parse(updateData.availability);
      }

      const doctor = await prisma.doctorProfile.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          },
          photo: true
        }
      });

      return res.json(doctorResponse(doctor, true));
    } catch (error) {
      console.error('Update doctor profile error:', error);
      return res.status(500).json(serverErrorResponse('Failed to update doctor profile'));
    }
  }

  // Delete doctor profile
  async deleteDoctorProfile(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(errorResponse('Doctor ID is required', 400));
      }

      await prisma.doctorProfile.delete({
        where: { id: parseInt(id) }
      });

      return res.json(successResponse(null, 'Doctor profile deleted successfully'));
    } catch (error) {
      console.error('Delete doctor profile error:', error);
      return res.status(500).json(serverErrorResponse('Failed to delete doctor profile'));
    }
  }

  // Get doctor dashboard data
  async getDoctorDashboard(req, res) {
    try {
      const doctorId = req.user.doctorProfile?.id;

      if (!doctorId) {
        return res.status(403).json(errorResponse('Access denied. Doctor profile required.', 403));
      }

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const [
        appointmentsToday,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        avgRating,
        totalReviews,
        unreadMessages
      ] = await Promise.all([
        // Appointments today
        prisma.appointment.count({
          where: {
            doctorId,
            date: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        }),
        // Total appointments
        prisma.appointment.count({
          where: { doctorId }
        }),
        // Pending appointments
        prisma.appointment.count({
          where: {
            doctorId,
            status: 'PENDING'
          }
        }),
        // Completed appointments
        prisma.appointment.count({
          where: {
            doctorId,
            status: 'COMPLETED'
          }
        }),
        // Average rating
        prisma.review.aggregate({
          where: { doctorId },
          _avg: { rating: true }
        }),
        // Total reviews
        prisma.review.count({
          where: { doctorId }
        }),
        // Unread messages
        prisma.message.count({
          where: {
            receiverId: req.user.id,
            isRead: false
          }
        })
      ]);

      const dashboardData = {
        appointmentsToday,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        avgRating: avgRating._avg.rating || 0,
        totalReviews,
        unreadMessages
      };

      return res.json(successResponse(dashboardData, 'Doctor dashboard data retrieved successfully'));
    } catch (error) {
      console.error('Get doctor dashboard error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get doctor dashboard'));
    }
  }
}

export default new DoctorController();
