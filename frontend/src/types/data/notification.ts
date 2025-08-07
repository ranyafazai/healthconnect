export const NotificationType = {
  APPOINTMENT: 'APPOINTMENT',
  MESSAGE: 'MESSAGE',
  REVIEW: 'REVIEW',
  SYSTEM: 'SYSTEM'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  content: string;
  isRead: boolean;
  createdAt: Date;
}
