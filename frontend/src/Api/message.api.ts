import axios from '../lib/axios';
import type { Message, MessageType } from '../types/data/message';

export const getConversation = (userId: number) =>
  axios.get<{ data: Message[] }>(`/messages/conversation/${userId}`);

export const getAppointmentMessages = (appointmentId: number) =>
  axios.get<{ data: Message[] }>(`/messages/appointment/${appointmentId}`);

export const sendMessage = (payload: {
  receiverId: number;
  appointmentId?: number | null;
  content?: string;
  type?: MessageType;
  fileId?: number | null;
}) => axios.post(`/messages`, payload);

export const markRead = (id: number) => axios.patch(`/messages/${id}/read`);

export const deleteMessage = (id: number) => axios.delete(`/messages/${id}`);


