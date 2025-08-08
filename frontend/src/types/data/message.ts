import type { User } from './user';
import type { Appointment } from '../data/appointment';
import type { File } from './file';
import type { VideoCall } from '../data/videoCall';


export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  appointmentId?: number;
  content?: string;
  type: MessageType;
  fileId?: number;
  isRead: boolean;
  createdAt: Date;

  sender?: User;
  receiver?: User;
  appointment?: Appointment;
  file?: File;
  videoCall?: VideoCall;
}

export const MessageType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
  VIDEO: 'VIDEO'
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];
