import type { User } from './user';

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  type: MessageType;
  createdAt: Date;
  sender?: User;
  receiver?: User;
}

export const MessageType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
  VIDEO: 'VIDEO'
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];
