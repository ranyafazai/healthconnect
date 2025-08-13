import axios from '../lib/axios';
import type { Notification } from '../types/data/notification';

export const getNotifications = () => 
  axios.get<{ data: Notification[] }>('/notifications');

export const markNotificationAsRead = (id: number) => 
  axios.patch<{ data: Notification }>(`/notifications/${id}/read`, { isRead: true });

export const markAllNotificationsAsRead = () => 
  axios.patch('/notifications/read-all');

export const deleteNotification = (id: number) => 
  axios.delete(`/notifications/${id}`);

export const getUnreadCount = () => 
  axios.get<{ data: { count: number } }>('/notifications/unread/count');
