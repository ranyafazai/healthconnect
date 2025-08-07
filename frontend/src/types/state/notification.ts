import { NotificationType } from "../data/notification";

export interface Notification {
  id: number;
  userId: number;
  content: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}
