import type { Message } from './message';
export const CallStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export type CallStatus = typeof CallStatus[keyof typeof CallStatus];

export interface VideoCall {
  id: number;
  messageId: number;
  status: CallStatus;
  startTime?: Date;
  endTime?: Date;
  roomId: string;
  createdAt: Date;
  message?: Message;
}
