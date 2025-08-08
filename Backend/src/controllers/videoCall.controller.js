import { prisma } from '../app.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  serverErrorResponse,
  createdResponse,
  videoCallResponse,
  listResponse
} from '../utils/responseFormatter.js';

class VideoCallController {
  // Create video call
  async createVideoCall(req, res) {
    try {
      const { appointmentId, roomId } = req.body;
      const userId = req.user.id;

      if (!appointmentId || !roomId) {
        return res.status(400).json(errorResponse('Appointment ID and room ID are required', 400));
      }

      const videoCall = await prisma.videoCall.create({
        data: {
          appointmentId: parseInt(appointmentId),
          roomId,
          status: 'INITIATED',
          startTime: new Date()
        },
        include: {
          appointment: {
            include: {
              doctor: true,
              patient: true
            }
          }
        }
      });

      return res.status(201).json(videoCallResponse(videoCall, true));
    } catch (error) {
      console.error('Create video call error:', error);
      return res.status(500).json(serverErrorResponse('Failed to create video call'));
    }
  }

  // Get video call by ID
  async getVideoCallById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(errorResponse('Video call ID is required', 400));
      }

      const videoCall = await prisma.videoCall.findUnique({
        where: { id: parseInt(id) },
        include: {
          appointment: {
            include: {
              doctor: true,
              patient: true
            }
          }
        }
      });

      if (!videoCall) {
        return res.status(404).json(notFoundResponse('Video call not found'));
      }

      return res.json(videoCallResponse(videoCall, true));
    } catch (error) {
      console.error('Get video call error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get video call'));
    }
  }

  // Update video call status
  async updateVideoCallStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        return res.status(400).json(errorResponse('Video call ID is required', 400));
      }

      if (!status) {
        return res.status(400).json(errorResponse('Status is required', 400));
      }

      const validStatuses = ['INITIATED', 'CONNECTED', 'ENDED', 'FAILED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json(errorResponse('Invalid status', 400));
      }

      const videoCall = await prisma.videoCall.update({
        where: { id: parseInt(id) },
        data: { status },
        include: {
          appointment: {
            include: {
              doctor: true,
              patient: true
            }
          }
        }
      });

      return res.json(videoCallResponse(videoCall, true));
    } catch (error) {
      console.error('Update video call status error:', error);
      return res.status(500).json(serverErrorResponse('Failed to update video call status'));
    }
  }

  // End video call
  async endVideoCall(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(errorResponse('Video call ID is required', 400));
      }

      const videoCall = await prisma.videoCall.update({
        where: { id: parseInt(id) },
        data: { 
          status: 'ENDED',
          endTime: new Date()
        },
        include: {
          appointment: {
            include: {
              doctor: true,
              patient: true
            }
          }
        }
      });

      return res.json(videoCallResponse(videoCall, true));
    } catch (error) {
      console.error('End video call error:', error);
      return res.status(500).json(serverErrorResponse('Failed to end video call'));
    }
  }

  // Get video calls by appointment
  async getVideoCallsByAppointment(req, res) {
    try {
      const { appointmentId } = req.params;

      if (!appointmentId) {
        return res.status(400).json(errorResponse('Appointment ID is required', 400));
      }

      const videoCalls = await prisma.videoCall.findMany({
        where: { appointmentId: parseInt(appointmentId) },
        include: {
          appointment: {
            include: {
              doctor: true,
              patient: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(listResponse(videoCalls, 'Video calls retrieved successfully', videoCalls.length));
    } catch (error) {
      console.error('Get video calls by appointment error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get video calls'));
    }
  }

  // Get user's video calls
  async getVideoCallsByUser(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json(errorResponse('User ID is required', 400));
      }

      const videoCalls = await prisma.videoCall.findMany({
        where: {
          appointment: {
            OR: [
              { doctor: { userId: parseInt(userId) } },
              { patient: { userId: parseInt(userId) } }
            ]
          }
        },
        include: {
          appointment: {
            include: {
              doctor: true,
              patient: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(listResponse(videoCalls, 'Video calls retrieved successfully', videoCalls.length));
    } catch (error) {
      console.error('Get video calls by user error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get video calls'));
    }
  }
}

export default new VideoCallController();
