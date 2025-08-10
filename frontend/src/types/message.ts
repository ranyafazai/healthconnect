export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'VIDEO';

export interface UserProfileLite {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  appointmentId?: number | null;
  content?: string | null;
  type: MessageType;
  fileId?: number | null;
  isRead: boolean;
  createdAt: string;
  sender?: unknown;
  receiver?: unknown;
}


