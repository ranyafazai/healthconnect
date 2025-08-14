import { prisma } from '../app.js';
import {
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
  videoCallResponse,
  listResponse,
} from '../utils/responseFormatter.js';

class VideoCallController {
  // Create video call (creates a VIDEO message linked to the appointment and then a VideoCall)
  async createVideoCall(req, res) {
    try {
      const { appointmentId, roomId } = req.body;
      const requesterUserId = req.user.id;

      if (!appointmentId) {
        return res
          .status(400)
          .json(errorResponse('Appointment ID is required', 400));
      }

      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(appointmentId) },
        include: {
          doctor: { include: { user: true } },
          patient: { include: { user: true } },
        },
      });

      if (!appointment) {
        return res.status(404).json(notFoundResponse('Appointment not found'));
      }

      // Validate requester is a participant
      const isParticipant =
        requesterUserId === appointment.doctor.userId ||
        requesterUserId === appointment.patient.userId;
      if (!isParticipant) {
        return res.status(403).json(errorResponse('Access denied', 403));
      }

      const otherUserId =
        requesterUserId === appointment.doctor.userId
          ? appointment.patient.userId
          : appointment.doctor.userId;

      // Create signaling message for the call
      const message = await prisma.message.create({
        data: {
          senderId: requesterUserId,
          receiverId: otherUserId,
          appointmentId: appointment.id,
          content: 'Video call initiated',
          type: 'VIDEO',
        },
      });

      // Create the video call linked to the message
      const videoCall = await prisma.videoCall.create({
        data: {
          messageId: message.id,
          roomId: roomId || `room-${appointment.id}-${Date.now()}`,
          status: 'PENDING',
          startTime: new Date(),
        },
        include: {
          message: {
            include: {
              appointment: { include: { doctor: true, patient: true } },
            },
          },
        },
      });

      return res.status(201).json(videoCallResponse(videoCall, true));
    } catch (error) {
      console.error('Create video call error:', error);
      return res
        .status(500)
        .json(serverErrorResponse('Failed to create video call'));
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
          message: {
            include: {
              appointment: { include: { doctor: true, patient: true } },
            },
          },
        },
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

      // Map legacy statuses to current enum
      const statusMap = {
        INITIATED: 'PENDING',
        CONNECTED: 'IN_PROGRESS',
        ENDED: 'COMPLETED',
        FAILED: 'CANCELLED',
      };
      const normalized = statusMap[status] || status;
      const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(normalized)) {
        return res.status(400).json(errorResponse('Invalid status', 400));
      }

      const videoCall = await prisma.videoCall.update({
        where: { id: parseInt(id) },
        data: { status: normalized },
        include: {
          message: {
            include: {
              appointment: { include: { doctor: true, patient: true } },
            },
          },
        },
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
          status: 'COMPLETED',
          endTime: new Date(),
        },
        include: {
          message: {
            include: {
              appointment: { include: { doctor: true, patient: true } },
            },
          },
        },
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
        where: { message: { appointmentId: parseInt(appointmentId) } },
        include: {
          message: {
            include: {
              appointment: { include: { doctor: true, patient: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
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
          OR: [
            { message: { senderId: parseInt(userId) } },
            { message: { receiverId: parseInt(userId) } },
          ],
        },
        include: {
          message: {
            include: {
              appointment: { include: { doctor: true, patient: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json(listResponse(videoCalls, 'Video calls retrieved successfully', videoCalls.length));
    } catch (error) {
      console.error('Get video calls by user error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get video calls'));
    }
  }
}

export default new VideoCallController();
