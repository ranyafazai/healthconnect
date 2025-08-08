import express from 'express';
import videoCallController from '../controllers/videoCall.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create video call
router.post('/', authMiddleware, videoCallController.createVideoCall);

// Get video calls by appointment - Must come before /:id
router.get('/appointment/:appointmentId', authMiddleware, videoCallController.getVideoCallsByAppointment);

// Get user's video calls - Must come before /:id
router.get('/user/:userId', authMiddleware, videoCallController.getVideoCallsByUser);

// Get video call by ID - Must come last
router.get('/:id', authMiddleware, videoCallController.getVideoCallById);

// Update video call status
router.patch('/:id/status', authMiddleware, videoCallController.updateVideoCallStatus);

// End video call
router.patch('/:id/end', authMiddleware, videoCallController.endVideoCall);

export default router;
