import { prisma } from '../app.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  serverErrorResponse,
  doctorResponse,
  listResponse
} from '../utils/responseFormatter.js';

class DoctorController {
  // Get all doctors
  async getAllDoctors(req, res) {
    try {
      const { specialization, rating } = req.query;
      
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

      // Note: Availability filtering is applied after fetching due to mixed JSON shapes

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

      // Fetch candidates without availability constraint
      const candidates = await prisma.doctorProfile.findMany({
        where: whereClause,
        orderBy,
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

      // Normalize day slots helper
      const dayKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
      const toMinutes = (hhmm) => {
        if (!hhmm || typeof hhmm !== 'string') return -1;
        const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
        if (Number.isNaN(h) || Number.isNaN(m)) return -1;
        return h * 60 + m;
      };
      const normalizeDaySlots = (availabilityObj, dayKey) => {
        if (!availabilityObj) return [];
        const val = availabilityObj[dayKey];
        if (!val) return [];
        const slots = [];
        if (Array.isArray(val)) {
          val.forEach((range) => {
            if (typeof range === 'string' && range.includes('-')) {
              const [s, e] = range.split('-');
              const sMin = toMinutes(s);
              const eMin = toMinutes(e);
              if (sMin >= 0 && eMin > sMin) slots.push({ sMin, eMin });
            }
          });
          return slots;
        }
        if (typeof val === 'object' && val?.slots && Array.isArray(val.slots)) {
          val.slots.forEach((slot) => {
            if (slot?.start && slot?.end) {
              const sMin = toMinutes(String(slot.start));
              const eMin = toMinutes(String(slot.end));
              if (sMin >= 0 && eMin > sMin) slots.push({ sMin, eMin });
            }
          });
          return slots;
        }
        if (typeof val === 'object' && val?.available && Array.isArray(val.hours)) {
          val.hours.forEach((range) => {
            if (typeof range === 'string' && range.includes('-')) {
              const [s, e] = range.split('-');
              const sMin = toMinutes(s);
              const eMin = toMinutes(e);
              if (sMin >= 0 && eMin > sMin) slots.push({ sMin, eMin });
            }
          });
          return slots;
        }
        return [];
      };

      const now = new Date();
      const currentDay = now.getDay();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const matchesAvailability = (availabilityFilter, availabilityObj) => {
        if (!availabilityFilter || availabilityFilter === 'Any Availability') return true;
        const todayKey = dayKeys[currentDay];
        if (availabilityFilter === 'Available Today') {
          return normalizeDaySlots(availabilityObj, todayKey).length > 0;
        }
        if (availabilityFilter === 'Available Now') {
          const slots = normalizeDaySlots(availabilityObj, todayKey);
          return slots.some((s) => currentMin >= s.sMin && currentMin <= s.eMin);
        }
        if (availabilityFilter === 'Available Tomorrow') {
          const tomorrowKey = dayKeys[(currentDay + 1) % 7];
          return normalizeDaySlots(availabilityObj, tomorrowKey).length > 0;
        }
        if (availabilityFilter === 'Available This Week') {
          for (let i = 0; i < 7; i++) {
            const key = dayKeys[(currentDay + i) % 7];
            if (normalizeDaySlots(availabilityObj, key).length > 0) return true;
          }
          return false;
        }
        if (availabilityFilter === 'Available Next Week') {
          for (let i = 7; i < 14; i++) {
            const key = dayKeys[(currentDay + i) % 7];
            if (normalizeDaySlots(availabilityObj, key).length > 0) return true;
          }
          return false;
        }
        return true;
      };

      const filtered = candidates.filter((d) => matchesAvailability(availability, d.availability));

      return res.json(listResponse(filtered, 'Doctors search completed successfully', filtered.length));
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

  // Add a certification to the doctor's profile
  async addCertification(req, res) {
    try {
      const { id } = req.params; // doctor profile id
      const { fileId } = req.body;

      if (!id || !fileId) {
        return res.status(400).json(errorResponse('Doctor ID and fileId are required', 400));
      }

      // Ensure the authenticated doctor can only modify their own profile
      const doctorProfileId = req.doctorProfile?.id;
      if (!doctorProfileId || parseInt(id) !== doctorProfileId) {
        return res.status(403).json(errorResponse('Access denied. You can only modify your own certifications.', 403));
      }

      // Validate file exists and belongs to the current user, and is CERTIFICATION type
      const file = await prisma.file.findUnique({ where: { id: parseInt(fileId) } });
      if (!file) {
        return res.status(404).json(notFoundResponse('File not found'));
      }
      if (file.ownerId !== req.user.id) {
        return res.status(403).json(errorResponse('Access denied. File does not belong to you.', 403));
      }
      if (file.fileType !== 'CERTIFICATION') {
        return res.status(400).json(errorResponse('Invalid file type. Expected CERTIFICATION.', 400));
      }

      // Create link if not exists
      const existing = await prisma.doctorCertification.findFirst({
        where: { doctorProfileId: parseInt(id), fileId: parseInt(fileId) }
      });
      if (existing) {
        // Idempotent: return existing with file included
        const existingWithFile = await prisma.doctorCertification.findUnique({
          where: { id: existing.id },
          include: { file: true }
        });
        return res.json(successResponse(existingWithFile, 'Certification already linked'));
      }

      const certification = await prisma.doctorCertification.create({
        data: {
          doctorProfileId: parseInt(id),
          fileId: parseInt(fileId)
        },
        include: { file: true }
      });

      return res.status(201).json(successResponse(certification, 'Certification added successfully'));
    } catch (error) {
      console.error('Add certification error:', error);
      return res.status(500).json(serverErrorResponse('Failed to add certification'));
    }
  }

  // Remove a certification from the doctor's profile
  async removeCertification(req, res) {
    try {
      const { id, certId } = req.params; // doctor profile id and certification id

      if (!id || !certId) {
        return res.status(400).json(errorResponse('Doctor ID and certification ID are required', 400));
      }

      // Ensure the authenticated doctor can only modify their own profile
      const doctorProfileId = req.doctorProfile?.id;
      if (!doctorProfileId || parseInt(id) !== doctorProfileId) {
        return res.status(403).json(errorResponse('Access denied. You can only modify your own certifications.', 403));
      }

      const certification = await prisma.doctorCertification.findUnique({
        where: { id: parseInt(certId) },
        include: { file: true, doctorProfile: true }
      });
      if (!certification) {
        return res.status(404).json(notFoundResponse('Certification not found'));
      }
      if (certification.doctorProfileId !== parseInt(id)) {
        return res.status(403).json(errorResponse('Access denied. Certification does not belong to this profile.', 403));
      }

      await prisma.doctorCertification.delete({ where: { id: parseInt(certId) } });

      return res.json(successResponse(null, 'Certification removed successfully'));
    } catch (error) {
      console.error('Remove certification error:', error);
      return res.status(500).json(serverErrorResponse('Failed to remove certification'));
    }
  }
}

export default new DoctorController();
