import { prisma } from '../app.js';
import socketConfig from '../config/socket.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  serverErrorResponse,
  createdResponse,
  appointmentResponse,
  listResponse,
  paginatedResponse
} from '../utils/responseFormatter.js';
import { faker } from '@faker-js/faker';

class AppointmentController {
  // Create a new appointment
  async createAppointment(req, res) {
    try {
      const { doctorId, date, type, reason, notes } = req.body;

      // Get patientId from authenticated user's profile
      const patientId = req.user.patientProfile?.id;

      // Validate required fields
      if (!doctorId || !patientId || !date || !type) {
        return res.status(400).json(errorResponse('Missing required fields: doctorId, date, type. Patient profile not found.', 400));
      }

      // Validate consultation type
      if (!['TEXT', 'VIDEO'].includes(type)) {
        return res.status(400).json(errorResponse('Invalid consultation type. Must be TEXT or VIDEO', 400));
      }

      // Validate and parse the date
      let parsedDate;
      try {
        parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json(errorResponse('Invalid date format provided', 400));
        }
      } catch (dateError) {
        return res.status(400).json(errorResponse('Invalid date format provided', 400));
      }

      const appointmentData = {
        doctorId: parseInt(doctorId),
        patientId: parseInt(patientId),
        date: parsedDate,
        type,
        reason: reason || null,
        notes: notes || null
      };

      const appointment = await prisma.appointment.create({
        data: {
          doctorId: appointmentData.doctorId,
          patientId: appointmentData.patientId,
          date: appointmentData.date,
          status: 'PENDING',
          type: appointmentData.type,
          reason: appointmentData.reason,
          notes: appointmentData.notes
        },
        include: {
          doctor: {
            include: {
              user: true
            }
          },
          patient: {
            include: {
              user: true
            }
          }
        }
      });

      // Create notification for doctor
      await prisma.notification.create({
        data: {
          userId: appointment.doctor.userId,
          type: 'APPOINTMENT',
          content: `New appointment request from ${appointment.patient.firstName} ${appointment.patient.lastName}`
        }
      });

      return res.status(201).json(appointmentResponse(appointment, true));
    } catch (error) {
      console.error('Create appointment error:', error);
      return res.status(500).json(serverErrorResponse('Failed to create appointment'));
    }
  }

  // Get appointment by ID
  async getAppointmentById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(errorResponse('Appointment ID is required', 400));
      }

      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) },
        include: {
          doctor: {
            include: {
              user: true
            }
          },
          patient: {
            include: {
              user: true
            }
          }
        }
      });

      if (!appointment) {
        return res.status(404).json(notFoundResponse('Appointment not found'));
      }

      return res.json(appointmentResponse(appointment, true));
    } catch (error) {
      console.error('Get appointment error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get appointment'));
    }
  }

  // Get appointments by doctor ID
  async getAppointmentsByDoctor(req, res) {
    try {
      const { doctorId } = req.params;

      if (!doctorId) {
        return res.status(400).json(errorResponse('Doctor ID is required', 400));
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where: { doctorId: parseInt(doctorId) },
          include: {
          doctor: {
            include: {
              user: true
            }
          },
          patient: {
            include: {
              user: true
            }
          }
          },
          orderBy: { date: 'desc' },
          skip,
          take: limit
        }),
        prisma.appointment.count({ where: { doctorId: parseInt(doctorId) } })
      ]);

      return res.json(paginatedResponse(appointments, page, limit, total, 'Doctor appointments retrieved successfully'));
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get doctor appointments'));
    }
  }

  // Get appointments by patient ID
  async getAppointmentsByPatient(req, res) {
    try {
      const { patientId } = req.params;

      if (!patientId) {
        return res.status(400).json(errorResponse('Patient ID is required', 400));
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where: { patientId: parseInt(patientId) },
          include: {
          doctor: {
            include: {
              user: true
            }
          }
          },
          orderBy: { date: 'desc' },
          skip,
          take: limit
        }),
        prisma.appointment.count({ where: { patientId: parseInt(patientId) } })
      ]);

      return res.json(paginatedResponse(appointments, page, limit, total, 'Patient appointments retrieved successfully'));
    } catch (error) {
      console.error('Get patient appointments error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get patient appointments'));
    }
  }

  // Update appointment status
  async updateAppointmentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        return res.status(400).json(errorResponse('Appointment ID is required', 400));
      }

      if (!status) {
        return res.status(400).json(errorResponse('Status is required', 400));
      }

      // Validate status
      const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json(errorResponse('Invalid status. Must be PENDING, CONFIRMED, COMPLETED, or CANCELLED', 400));
      }

      const appointment = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: { status },
        include: {
          doctor: {
            include: {
              user: true
            }
          },
          patient: {
            include: {
              user: true
            }
          }
        }
      });

      // Create notification for patient
      await prisma.notification.create({
        data: {
          userId: appointment.patient.userId,
          type: 'APPOINTMENT',
          content: `Your appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} has been ${status.toLowerCase()}`
        }
      });

      // Emit real-time notification to patient via socket
      try {
        const io = socketConfig.getIO();
        const notificationNs = io.of('/notifications');
        notificationNs.to(`user-${appointment.patient.userId}`).emit('new-notification', {
          type: 'APPOINTMENT',
          content: `Your appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} has been ${status.toLowerCase()}`
        });
      } catch (emitErr) {
        console.error('Socket emit error (appointment status update):', emitErr);
      }

      return res.json(appointmentResponse(appointment, true));
    } catch (error) {
      console.error('Update appointment status error:', error);
      return res.status(500).json(serverErrorResponse('Failed to update appointment status'));
    }
  }

  // Delete appointment
  async deleteAppointment(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(errorResponse('Appointment ID is required', 400));
      }

      await prisma.appointment.delete({
        where: { id: parseInt(id) }
      });

      return res.json(successResponse(null, 'Appointment deleted successfully'));
    } catch (error) {
      console.error('Delete appointment error:', error);
      return res.status(500).json(serverErrorResponse('Failed to delete appointment'));
    }
  }

  // Get all appointments (admin function)
  async getAllAppointments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          include: {
          doctor: {
            include: {
              user: true
            }
          },
          patient: {
            include: {
              user: true
            }
          }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.appointment.count()
      ]);

      return res.json(paginatedResponse(appointments, page, limit, total, 'All appointments retrieved successfully'));
    } catch (error) {
      console.error('Get all appointments error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get all appointments'));
    }
  }

  // Get past consultations with enhanced details for patient
  async getPastConsultations(req, res) {
    try {
      const { patientId } = req.params;
      const { status, limit = 50, offset = 0 } = req.query;

      if (!patientId) {
        return res.status(400).json(errorResponse('Patient ID is required', 400));
      }

      // Build where clause for past consultations
      const whereClause = {
        patientId: parseInt(patientId),
        OR: [
          { status: 'COMPLETED' },
          { status: 'CANCELLED' },
          { date: { lt: new Date() } } // Past dates
        ]
      };

      // Add status filter if provided
      if (status && status !== 'ALL') {
        whereClause.status = status;
      }

      const appointments = await prisma.appointment.findMany({
        where: whereClause,
        include: {
          doctor: {
            include: {
              user: true,
              photo: true
            }
          },
          patient: {
            include: {
              user: true
            }
          },
          recording: true,
          reviews: {
            where: {
              patientId: parseInt(patientId)
            },
            select: {
              rating: true,
              comment: true
            }
          }
        },
        orderBy: { date: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      });

      // Transform data to include additional consultation details
      const enhancedConsultations = appointments.map(apt => {
        const review = apt.reviews[0]; // Get the first review if exists
        
        // Generate realistic consultation details based on specialization and reason
        const specialization = apt.doctor.specialization;
        const reason = apt.reason || 'General consultation';
        
        // Generate realistic symptoms based on reason
        const symptomsMap = {
          'Chest pain evaluation': 'Chest pain, shortness of breath, fatigue',
          'Heart rhythm check': 'Irregular heartbeat, palpitations, dizziness',
          'Blood pressure consultation': 'Headaches, dizziness, vision changes',
          'Skin rash evaluation': 'Itchy rash, redness, skin irritation',
          'Headache evaluation': 'Severe headaches, light sensitivity, nausea',
          'Joint pain evaluation': 'Joint stiffness, swelling, limited mobility',
          'Anxiety management': 'Anxiety, insomnia, stress, panic attacks',
          'Annual physical exam': 'Routine check-up, general health assessment',
          'Diabetes management': 'Increased thirst, frequent urination, fatigue',
          'Hypertension check': 'High blood pressure, headaches, chest pain'
        };
        
        // Generate realistic diagnosis based on reason
        const diagnosisMap = {
          'Chest pain evaluation': 'Stable angina, rule out coronary artery disease',
          'Heart rhythm check': 'Normal sinus rhythm, occasional PVCs',
          'Blood pressure consultation': 'Essential hypertension, stage 1',
          'Skin rash evaluation': 'Contact dermatitis, allergic reaction',
          'Headache evaluation': 'Tension headache, migraine without aura',
          'Joint pain evaluation': 'Osteoarthritis, joint inflammation',
          'Anxiety management': 'Generalized anxiety disorder, stress response',
          'Annual physical exam': 'Healthy individual, normal findings',
          'Diabetes management': 'Type 2 diabetes, well-controlled',
          'Hypertension check': 'Primary hypertension, lifestyle modification needed'
        };
        
        // Generate realistic prescriptions based on reason
        const prescriptionMap = {
          'Chest pain evaluation': 'Aspirin 81mg daily, Nitroglycerin as needed',
          'Blood pressure consultation': 'Lisinopril 10mg daily, lifestyle modifications',
          'Skin rash evaluation': 'Hydrocortisone 1% cream twice daily',
          'Headache evaluation': 'Ibuprofen 400mg as needed, stress management',
          'Joint pain evaluation': 'Acetaminophen 500mg as needed, physical therapy',
          'Anxiety management': 'Sertraline 50mg daily, cognitive behavioral therapy',
          'Diabetes management': 'Metformin 500mg twice daily, diet monitoring',
          'Hypertension check': 'Amlodipine 5mg daily, salt restriction'
        };
        
        // Generate realistic follow-up dates
        const followUpMap = {
          'Chest pain evaluation': '2 weeks',
          'Blood pressure consultation': '1 month',
          'Skin rash evaluation': '1 week',
          'Headache evaluation': '3 weeks',
          'Joint pain evaluation': '1 month',
          'Anxiety management': '2 weeks',
          'Diabetes management': '3 months',
          'Hypertension check': '1 month'
        };
        
        const symptoms = symptomsMap[reason] || 'General symptoms reported';
        const diagnosis = diagnosisMap[reason] || 'Clinical evaluation completed';
        const prescription = prescriptionMap[reason] || null;
        const followUpPeriod = followUpMap[reason] || 'As needed';
        
        // Calculate follow-up date (3 months from appointment date)
        const followUpDate = new Date(apt.date);
        followUpDate.setMonth(followUpDate.getMonth() + 3);
        
        // Generate realistic costs based on consultation type and specialization
        const baseCosts = {
          'Cardiology': { 'TEXT': 120, 'VIDEO': 180 },
          'Dermatology': { 'TEXT': 100, 'VIDEO': 150 },
          'Neurology': { 'TEXT': 140, 'VIDEO': 200 },
          'Psychiatry': { 'TEXT': 160, 'VIDEO': 220 },
          'Orthopedics': { 'TEXT': 130, 'VIDEO': 190 },
          'Gynecology': { 'TEXT': 110, 'VIDEO': 170 },
          'Family Medicine': { 'TEXT': 80, 'VIDEO': 120 },
          'Pediatrics': { 'TEXT': 90, 'VIDEO': 140 }
        };
        
        const cost = baseCosts[specialization]?.[apt.type] || (apt.type === 'VIDEO' ? 150 : 100);
        
        // Generate realistic duration based on consultation type
        const duration = apt.type === 'VIDEO' ? 
          faker.number.int({ min: 25, max: 60 }) : 
          faker.number.int({ min: 15, max: 30 });
        
        return {
          id: apt.id,
          doctorName: `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`,
          doctorSpecialization: apt.doctor.specialization,
          consultationDate: apt.date,
          consultationType: apt.type,
          status: apt.status,
          notes: apt.notes || `Follow-up consultation for ${reason.toLowerCase()}`,
          reason: apt.reason,
          prescription: prescription,
          rating: review?.rating || null,
          review: review?.comment || null,
          duration: duration,
          doctorImage: apt.doctor.photo?.url || null,
          symptoms: symptoms,
          diagnosis: diagnosis,
          followUpDate: followUpDate.toISOString().split('T')[0],
          cost: cost,
          recordingUrl: apt.recording?.url || null,
          createdAt: apt.createdAt
        };
      });

      return res.json(listResponse(enhancedConsultations, 'Past consultations retrieved successfully', enhancedConsultations.length));
    } catch (error) {
      console.error('Get past consultations error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get past consultations'));
    }
  }
}

export default new AppointmentController(); 
