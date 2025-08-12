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
                select: {
                  firstName: true,
                  lastName: true
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

  // Search doctors with advanced filters
  async searchDoctors(req, res) {
    try {
      const { 
        query, 
        specialization, 
        city, 
        rating, 
        availability,
        sortBy = 'name',
        page = 1,
        limit = 20
      } = req.query;

      let whereClause = {};
      let orderBy = {};

      // Text search in name, specialization, or bio
      if (query) {
        whereClause.OR = [
          {
            firstName: {
              contains: query
            }
          },
          {
            lastName: {
              contains: query
            }
          },
          {
            specialization: {
              contains: query
            }
          },
          {
            professionalBio: {
              contains: query
            }
          }
        ];
      }

      // Filter by specialization
      if (specialization && specialization !== 'All Specialties') {
        whereClause.specialization = specialization;
      }

      // Filter by city
      if (city && city !== 'All Cities') {
        whereClause.city = {
          contains: city
        };
      }

      // Filter by minimum rating
      if (rating && rating !== 'Any Rating') {
        const ratingValue = parseFloat(rating.replace('+ Stars', ''));
        whereClause.avgReview = {
          gte: ratingValue
        };
      }

      // Filter by availability (simplified implementation)
      if (availability && availability !== 'Any Availability') {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Map day numbers to day names
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDayName = dayNames[currentDay];
        
        if (availability === 'Available Today') {
          // Check if doctor has available slots today
          whereClause.AND = [
            {
              availability: {
                path: `$.${currentDayName}`,
                not: null
              }
            }
          ];
        } else if (availability === 'Available Now') {
          // Check if doctor has slots today (time-based filtering will be done in frontend)
          whereClause.AND = [
            {
              availability: {
                path: `$.${currentDayName}`,
                not: null
              }
            }
          ];
        } else if (availability === 'Available Tomorrow') {
          const tomorrow = (currentDay + 1) % 7;
          const tomorrowName = dayNames[tomorrow];
          
          whereClause.AND = [
            {
              availability: {
                path: `$.${tomorrowName}`,
                not: null
              }
            }
          ];
        } else if (availability === 'Available This Week') {
          // Check if doctor has any availability in the next 7 days
          const weekDays = [];
          for (let i = 0; i < 7; i++) {
            const dayIndex = (currentDay + i) % 7;
            weekDays.push(dayNames[dayIndex]);
          }
          
          whereClause.OR = weekDays.map(dayName => ({
            availability: {
              path: `$.${dayName}`,
              not: null
            }
          }));
        } else if (availability === 'Available Next Week') {
          // Check if doctor has any availability in the next 7-14 days
          // Calculate actual dates for next week (7-13 days from now)
          const nextWeekDays = [];
          for (let i = 7; i < 14; i++) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + i);
            const dayIndex = futureDate.getDay();
            const dayName = dayNames[dayIndex];
            if (!nextWeekDays.includes(dayName)) {
              nextWeekDays.push(dayName);
            }
          }
          
          whereClause.OR = nextWeekDays.map(dayName => ({
            availability: {
              path: `$.${dayName}`,
              not: null
            }
          }));
        }
      }

      // Sorting
      switch (sortBy) {
        case 'Name A-Z':
          orderBy = { firstName: 'asc' };
          break;
        case 'Name Z-A':
          orderBy = { firstName: 'desc' };
          break;
        case 'Rating High to Low':
          orderBy = { avgReview: 'desc' };
          break;
        case 'Rating Low to High':
          orderBy = { avgReview: 'asc' };
          break;
        case 'Experience High to Low':
          orderBy = { yearsExperience: 'desc' };
          break;
        case 'Experience Low to High':
          orderBy = { yearsExperience: 'asc' };
          break;
        default:
          orderBy = { firstName: 'asc' };
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [doctors, totalCount] = await Promise.all([
        prisma.doctorProfile.findMany({
          where: whereClause,
          orderBy,
          skip,
          take: parseInt(limit),
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
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }),
        prisma.doctorProfile.count({
          where: whereClause
        })
      ]);

      const totalPages = Math.ceil(totalCount / parseInt(limit));

      return res.json(listResponse(doctors, 'Doctors search completed successfully', totalCount));
    } catch (error) {
      console.error('Search doctors error:', error);
      return res.status(500).json(serverErrorResponse('Failed to search doctors'));
    }
  }

  // Get doctor by ID
  async getDoctorById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(errorResponse('Doctor ID is required', 400));
      }

      const doctorId = parseInt(id);
      if (isNaN(doctorId)) {
        return res.status(400).json(errorResponse('Invalid doctor ID format', 400));
      }

      const doctor = await prisma.doctorProfile.findUnique({
        where: { id: doctorId },
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
                      id: true,
                      email: true
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
        // Handle availability as either JSON string or object
        if (typeof updateData.availability === 'string') {
          try {
            updateData.availability = JSON.parse(updateData.availability);
          } catch (error) {
            console.error('Error parsing availability JSON:', error);
            return res.status(400).json(errorResponse('Invalid availability format', 400));
          }
        }
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
      const doctorId = req.doctorProfile?.id;

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

  // Get doctor availability for a specific date
  async getDoctorAvailability(req, res) {
    try {
      const { id } = req.params;
      const { date } = req.query;

      if (!id || !date) {
        return res.status(400).json(errorResponse('Doctor ID and date are required', 400));
      }

      const doctorId = parseInt(id);
      const requestedDate = new Date(date);
      
      // Set time to start of day for comparison
      const startOfDay = new Date(requestedDate.getFullYear(), requestedDate.getMonth(), requestedDate.getDate());
      const endOfDay = new Date(requestedDate.getFullYear(), requestedDate.getMonth(), requestedDate.getDate(), 23, 59, 59);

      // Get existing appointments for this date
      const existingAppointments = await prisma.appointment.findMany({
        where: {
          doctorId,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        select: {
          date: true
        }
      });

      // Generate all possible time slots (9 AM to 5 PM, 30-minute intervals)
      const allTimeSlots = [];
      for (let hour = 9; hour <= 17; hour++) {
        if (hour === 17) {
          allTimeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        } else {
          allTimeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
          allTimeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
      }

      // Filter out booked time slots
      const bookedTimes = existingAppointments.map(apt => {
        const aptDate = new Date(apt.date);
        return `${aptDate.getHours().toString().padStart(2, '0')}:${aptDate.getMinutes().toString().padStart(2, '0')}`;
      });

      const availableSlots = allTimeSlots.filter(time => !bookedTimes.includes(time));

      return res.json(successResponse({
        availableSlots,
        requestedDate: date,
        totalSlots: allTimeSlots.length,
        bookedSlots: bookedTimes.length,
        availableSlotsCount: availableSlots.length
      }, 'Doctor availability retrieved successfully'));
    } catch (error) {
      console.error('Get doctor availability error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get doctor availability'));
    }
  }
}

export default new DoctorController();
