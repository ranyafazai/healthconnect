import express from 'express';
import notificationController from '../controllers/notification.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get user's notifications
router.get('/', authMiddleware, notificationController.getUserNotifications);

// Mark all notifications as read
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);

// Delete all notifications
router.delete('/', authMiddleware, notificationController.deleteAllNotifications);

// Get unread count - Must come before /:id
router.get('/unread/count', authMiddleware, notificationController.getUnreadCount);

// Get notifications by type - Must come before /:id
router.get('/type/:type', authMiddleware, notificationController.getNotificationsByType);

// Get notification by ID - Must come last
router.get('/:id', authMiddleware, notificationController.getNotificationById);

// Mark notification as read
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

// Delete notification
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

export default router;
