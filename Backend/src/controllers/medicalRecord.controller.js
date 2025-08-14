import { prisma } from '../app.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  serverErrorResponse,
  medicalRecordResponse,
  listResponse,
  paginatedResponse,
  forbiddenResponse
} from '../utils/responseFormatter.js';

class MedicalRecordController {
  // Create medical record
  async createMedicalRecord(req, res) {
    try {
      const { title, description, fileId } = req.body;
      const patientId = req.user.patientProfile?.id;

      if (!patientId) {
        return res.status(403).json(forbiddenResponse('Access denied. Patient profile required.'));
      }

      if (!title) {
        return res.status(400).json(errorResponse('Title is required', 400));
      }

      const medicalRecord = await prisma.medicalRecord.create({
        data: {
          patientId: parseInt(patientId),
          title,
          description: description || null,
          fileId: fileId ? parseInt(fileId) : null
        },
        include: {
          file: true
        }
      });

      return res.status(201).json(medicalRecordResponse(medicalRecord, true));
    } catch (error) {
      console.error('Create medical record error:', error);
      return res.status(500).json(serverErrorResponse('Failed to create medical record'));
    }
  }

  // Get medical records by patient ID
  async getMedicalRecordsByPatient(req, res) {
    try {
      const { patientId } = req.params;
      const currentUserId = req.user.id;

      if (!patientId) {
        return res.status(400).json(errorResponse('Patient ID is required', 400));
      }

      // Check if user is authorized to view these records
      const patient = await prisma.patientProfile.findUnique({
        where: { id: parseInt(patientId) }
      });

      if (!patient) {
        return res.status(404).json(notFoundResponse('Patient not found'));
      }

      // Only allow patients to view their own records, or doctors to view their patients' records
      if (patient.userId !== parseInt(currentUserId)) {
        // Check if current user is a doctor and has appointments with this patient
        const doctorProfile = await prisma.doctorProfile.findFirst({
          where: { userId: parseInt(currentUserId) }
        });

        if (!doctorProfile) {
          return res.status(403).json(forbiddenResponse('Access denied'));
        }

        const hasAppointments = await prisma.appointment.findFirst({
          where: {
            doctorId: doctorProfile.id,
            patientId: parseInt(patientId)
          }
        });

        if (!hasAppointments) {
          return res.status(403).json(forbiddenResponse('Access denied. No appointment history with this patient.'));
        }
      }

      const medicalRecords = await prisma.medicalRecord.findMany({
        where: { patientId: parseInt(patientId) },
        include: {
          file: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(listResponse(medicalRecords, 'Medical records retrieved successfully', medicalRecords.length));
    } catch (error) {
      console.error('Get medical records error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get medical records'));
    }
  }

  // Get medical record by ID
  async getMedicalRecordById(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user.id;

      if (!id) {
        return res.status(400).json(errorResponse('Medical record ID is required', 400));
      }

      const medicalRecord = await prisma.medicalRecord.findUnique({
        where: { id: parseInt(id) },
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
          },
          file: true
        }
      });

      if (!medicalRecord) {
        return res.status(404).json(notFoundResponse('Medical record not found'));
      }

      // Check authorization
      if (medicalRecord.patient.userId !== parseInt(currentUserId)) {
        // Check if current user is a doctor and has appointments with this patient
        const doctorProfile = await prisma.doctorProfile.findFirst({
          where: { userId: parseInt(currentUserId) }
        });

        if (!doctorProfile) {
          return res.status(403).json(forbiddenResponse('Access denied'));
        }

        const hasAppointments = await prisma.appointment.findFirst({
          where: {
            doctorId: doctorProfile.id,
            patientId: medicalRecord.patientId
          }
        });

        if (!hasAppointments) {
          return res.status(403).json(forbiddenResponse('Access denied. No appointment history with this patient.'));
        }
      }

      return res.json(medicalRecordResponse(medicalRecord, true));
    } catch (error) {
      console.error('Get medical record error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get medical record'));
    }
  }

  // Update medical record
  async updateMedicalRecord(req, res) {
    try {
      const { id } = req.params;
      const { title, description, fileId } = req.body;
      const patientId = req.user.patientProfile?.id;

      if (!patientId) {
        return res.status(403).json(forbiddenResponse('Access denied. Patient profile required.'));
      }

      if (!id) {
        return res.status(400).json(errorResponse('Medical record ID is required', 400));
      }

      const medicalRecord = await prisma.medicalRecord.findUnique({
        where: { id: parseInt(id) }
      });

      if (!medicalRecord) {
        return res.status(404).json(notFoundResponse('Medical record not found'));
      }

      if (medicalRecord.patientId !== parseInt(patientId)) {
        return res.status(403).json(forbiddenResponse('You can only update your own medical records'));
      }

      const updatedRecord = await prisma.medicalRecord.update({
        where: { id: parseInt(id) },
        data: {
          title: title || undefined,
          description: description !== undefined ? description : undefined,
          fileId: fileId ? parseInt(fileId) : undefined
        },
        include: {
          file: true
        }
      });

      return res.json(medicalRecordResponse(updatedRecord, true));
    } catch (error) {
      console.error('Update medical record error:', error);
      return res.status(500).json(serverErrorResponse('Failed to update medical record'));
    }
  }

  // Delete medical record
  async deleteMedicalRecord(req, res) {
    try {
      const { id } = req.params;
      const patientId = req.user.patientProfile?.id;

      if (!patientId) {
        return res.status(403).json(forbiddenResponse('Access denied. Patient profile required.'));
      }

      if (!id) {
        return res.status(400).json(errorResponse('Medical record ID is required', 400));
      }

      const medicalRecord = await prisma.medicalRecord.findUnique({
        where: { id: parseInt(id) }
      });

      if (!medicalRecord) {
        return res.status(404).json(notFoundResponse('Medical record not found'));
      }

      if (medicalRecord.patientId !== parseInt(patientId)) {
        return res.status(403).json(forbiddenResponse('You can only delete your own medical records'));
      }

      await prisma.medicalRecord.delete({
        where: { id: parseInt(id) }
      });

      return res.json(successResponse(null, 'Medical record deleted successfully'));
    } catch (error) {
      console.error('Delete medical record error:', error);
      return res.status(500).json(serverErrorResponse('Failed to delete medical record'));
    }
  }

  // Get all medical records (admin only)
  async getAllMedicalRecords(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [medicalRecords, totalCount] = await Promise.all([
        prisma.medicalRecord.findMany({
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
            },
            file: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.medicalRecord.count()
      ]);

      return res.json(paginatedResponse(medicalRecords, parseInt(page), parseInt(limit), totalCount, 'All medical records retrieved successfully'));
    } catch (error) {
      console.error('Get all medical records error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get all medical records'));
    }
  }
}

export default new MedicalRecordController();
