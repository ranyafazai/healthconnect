import { prisma } from '../app.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  serverErrorResponse,
  patientResponse,
  listResponse,
  forbiddenResponse
} from '../utils/responseFormatter.js';

class PatientController {
  // Get all patients (admin only)
  async getAllPatients(req, res) {
    try {
      const patients = await prisma.patientProfile.findMany({
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

      return res.json(listResponse(patients, 'Patients retrieved successfully', patients.length));
    } catch (error) {
      console.error('Get all patients error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get patients'));
    }
  }

  // Get patient by ID
  async getPatientById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(errorResponse('Patient ID is required', 400));
      }

      const patient = await prisma.patientProfile.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          },
          photo: true,
          medicalRecords: {
            include: {
              file: true
            }
          }
        }
      });

      if (!patient) {
        return res.status(404).json(notFoundResponse('Patient not found'));
      }

      return res.json(patientResponse(patient, true));
    } catch (error) {
      console.error('Get patient error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get patient'));
    }
  }

  // Create patient profile
  async createPatientProfile(req, res) {
    try {
      const {
        userId,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        address,
        city,
        state,
        zipCode,
        medicalHistory
      } = req.body;

      if (!userId || !firstName || !lastName) {
        return res.status(400).json(errorResponse('Missing required fields', 400));
      }

      const patient = await prisma.patientProfile.create({
        data: {
          userId: parseInt(userId),
          firstName,
          lastName,
          phoneNumber,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address,
          city,
          state,
          zipCode,
          medicalHistory
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

      return res.status(201).json(patientResponse(patient, true));
    } catch (error) {
      console.error('Create patient profile error:', error);
      return res.status(500).json(serverErrorResponse('Failed to create patient profile'));
    }
  }

  // Update patient profile
  async updatePatientProfile(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json(errorResponse('Patient ID is required', 400));
      }

      // Remove userId from update data to prevent changing the user association
      delete updateData.userId;

      if (updateData.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth);
      }

      const patient = await prisma.patientProfile.update({
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

      return res.json(patientResponse(patient, true));
    } catch (error) {
      console.error('Update patient profile error:', error);
      return res.status(500).json(serverErrorResponse('Failed to update patient profile'));
    }
  }

  // Delete patient profile
  async deletePatientProfile(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(errorResponse('Patient ID is required', 400));
      }

      await prisma.patientProfile.delete({
        where: { id: parseInt(id) }
      });

      return res.json(successResponse(null, 'Patient profile deleted successfully'));
    } catch (error) {
      console.error('Delete patient profile error:', error);
      return res.status(500).json(serverErrorResponse('Failed to delete patient profile'));
    }
  }

  // Get patient dashboard data
  async getPatientDashboard(req, res) {
    try {
      const patientId = req.user.patientProfile?.id;

      if (!patientId) {
        return res.status(403).json(forbiddenResponse('Access denied. Patient profile required.'));
      }

      const today = new Date();

      const [
        upcomingAppointments,
        completedAppointments,
        totalAppointments,
        newMessages,
        healthRecords
      ] = await Promise.all([
        // Upcoming appointments
        prisma.appointment.count({
          where: {
            patientId,
            date: {
              gte: today
            },
            status: {
              in: ['PENDING', 'CONFIRMED']
            }
          }
        }),
        // Completed appointments
        prisma.appointment.count({
          where: {
            patientId,
            status: 'COMPLETED'
          }
        }),
        // Total appointments
        prisma.appointment.count({
          where: { patientId }
        }),
        // New messages
        prisma.message.count({
          where: {
            receiverId: req.user.id,
            isRead: false
          }
        }),
        // Health records
        prisma.medicalRecord.count({
          where: { patientId }
        })
      ]);

      const dashboardData = {
        upcomingAppointments,
        completedAppointments,
        totalAppointments,
        newMessages,
        healthRecords
      };

      return res.json(successResponse(dashboardData, 'Patient dashboard data retrieved successfully'));
    } catch (error) {
      console.error('Get patient dashboard error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get patient dashboard'));
    }
  }

  // Get patient's next appointments
  async getNextAppointments(req, res) {
    try {
      const patientId = req.user.patientProfile?.id;

      if (!patientId) {
        return res.status(403).json(forbiddenResponse('Access denied. Patient profile required.'));
      }

      const appointments = await prisma.appointment.findMany({
        where: {
          patientId,
          date: {
            gte: new Date()
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
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
          }
        },
        orderBy: { date: 'asc' },
        take: 5
      });

      return res.json(successResponse(appointments, 'Next appointments retrieved successfully'));
    } catch (error) {
      console.error('Get next appointments error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get next appointments'));
    }
  }

  // Get patient's recent messages
  async getRecentMessages(req, res) {
    try {
      const userId = req.user.id;

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        include: {
          sender: {
            include: {
              doctorProfile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              },
              patientProfile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          receiver: {
            include: {
              doctorProfile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              },
              patientProfile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      return res.json(successResponse(messages, 'Recent messages retrieved successfully'));
    } catch (error) {
      console.error('Get recent messages error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get recent messages'));
    }
  }
}

export default new PatientController();
