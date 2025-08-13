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
}

export default new AppointmentController(); 
