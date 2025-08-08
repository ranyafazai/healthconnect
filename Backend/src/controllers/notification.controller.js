import { prisma } from '../app.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  serverErrorResponse,
  createdResponse,
  notificationResponse,
  listResponse
} from '../utils/responseFormatter.js';

class NotificationController {
  // Get user's notifications
  async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const notifications = await prisma.notification.findMany({
        where: { userId: parseInt(userId) },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      });

      return res.json(listResponse(notifications, 'Notifications retrieved successfully', notifications.length));
    } catch (error) {
      console.error('Get user notifications error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get notifications'));
    }
  }

  // Get notification by ID
  async getNotificationById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id) {
        return res.status(400).json(errorResponse('Notification ID is required', 400));
      }

      const notification = await prisma.notification.findUnique({
        where: { id: parseInt(id) }
      });

      if (!notification) {
        return res.status(404).json(notFoundResponse('Notification not found'));
      }

      if (notification.userId !== parseInt(userId)) {
        return res.status(403).json(errorResponse('Access denied', 403));
      }

      return res.json(notificationResponse(notification));
    } catch (error) {
      console.error('Get notification error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get notification'));
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id) {
        return res.status(400).json(errorResponse('Notification ID is required', 400));
      }

      const notification = await prisma.notification.findUnique({
        where: { id: parseInt(id) }
      });

      if (!notification) {
        return res.status(404).json(notFoundResponse('Notification not found'));
      }

      if (notification.userId !== parseInt(userId)) {
        return res.status(403).json(errorResponse('Access denied', 403));
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: parseInt(id) },
        data: { isRead: true }
      });

      return res.json(notificationResponse(updatedNotification));
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return res.status(500).json(serverErrorResponse('Failed to mark notification as read'));
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      await prisma.notification.updateMany({
        where: { 
          userId: parseInt(userId),
          isRead: false
        },
        data: { isRead: true }
      });

      return res.json(successResponse(null, 'All notifications marked as read'));
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      return res.status(500).json(serverErrorResponse('Failed to mark notifications as read'));
    }
  }

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id) {
        return res.status(400).json(errorResponse('Notification ID is required', 400));
      }

      const notification = await prisma.notification.findUnique({
        where: { id: parseInt(id) }
      });

      if (!notification) {
        return res.status(404).json(notFoundResponse('Notification not found'));
      }

      if (notification.userId !== parseInt(userId)) {
        return res.status(403).json(errorResponse('Access denied', 403));
      }

      await prisma.notification.delete({
        where: { id: parseInt(id) }
      });

      return res.json(successResponse(null, 'Notification deleted successfully'));
    } catch (error) {
      console.error('Delete notification error:', error);
      return res.status(500).json(serverErrorResponse('Failed to delete notification'));
    }
  }

  // Delete all notifications
  async deleteAllNotifications(req, res) {
    try {
      const userId = req.user.id;

      await prisma.notification.deleteMany({
        where: { userId: parseInt(userId) }
      });

      return res.json(successResponse(null, 'All notifications deleted successfully'));
    } catch (error) {
      console.error('Delete all notifications error:', error);
      return res.status(500).json(serverErrorResponse('Failed to delete notifications'));
    }
  }

  // Get unread count
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      const count = await prisma.notification.count({
        where: { 
          userId: parseInt(userId),
          isRead: false
        }
      });

      return res.json(successResponse({ count }, 'Unread count retrieved successfully'));
    } catch (error) {
      console.error('Get unread count error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get unread count'));
    }
  }

  // Get notifications by type
  async getNotificationsByType(req, res) {
    try {
      const { type } = req.params;
      const userId = req.user.id;

      if (!type) {
        return res.status(400).json(errorResponse('Notification type is required', 400));
      }

      const notifications = await prisma.notification.findMany({
        where: { 
          userId: parseInt(userId),
          type
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(listResponse(notifications, 'Notifications retrieved successfully', notifications.length));
    } catch (error) {
      console.error('Get notifications by type error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get notifications'));
    }
  }
}

export default new NotificationController();
