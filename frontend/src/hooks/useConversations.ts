import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import type { RootState } from '../Redux/store';
import type { Appointment } from '../types/data/appointment';

export interface Conversation {
  id: number;
  name: string;
  lastMessage?: string;
  unreadCount: number;
  otherUserId: number;
  appointmentId?: number;
  lastMessageTime?: string;
  type: 'APPOINTMENT' | 'DOCTOR_TO_DOCTOR';
  status: 'UPCOMING' | 'PAST' | 'ACTIVE';
  appointmentDate?: string;
  appointmentType?: 'TEXT' | 'VIDEO';
}

export function useConversations() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { appointments } = useAppSelector((state: RootState) => state.appointment);
  const { messages } = useAppSelector((state: RootState) => state.chat);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const generateConversationsFromAppointments = () => {
      setLoading(true);
      setError(null);

      try {
        const now = new Date();
        const newConversations: Conversation[] = [];

        // generating conversations from appointments

        if (user?.role === 'DOCTOR') {
          // Generate conversations from appointments
          appointments.forEach(appointment => {
            const appointmentDate = new Date(appointment.date);
            const activeWindowMs = 30 * 60 * 1000; // 30 minutes window around start time
            const isWithinWindow = Math.abs(appointmentDate.getTime() - now.getTime()) <= activeWindowMs;

            let status: 'UPCOMING' | 'PAST' | 'ACTIVE' = 'UPCOMING';
            if (appointment.status === 'COMPLETED' || now.getTime() > appointmentDate.getTime() + activeWindowMs) {
              status = 'PAST';
            } else if (appointment.status === 'CONFIRMED' && isWithinWindow) {
              status = 'ACTIVE';
            } else {
              status = 'UPCOMING';
            }

            // Get patient name from appointment data
            let patientName = 'Unknown Patient';
            if (appointment.patient && appointment.patient.firstName && appointment.patient.lastName) {
              patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
            } else if (appointment.patientId) {
              patientName = `Patient #${appointment.patientId}`;
            }
            
            const conversation = {
              id: appointment.id,
              name: patientName,
              lastMessage: appointment.status === 'CONFIRMED' ? 'Appointment confirmed' : 
                         appointment.status === 'PENDING' ? 'Appointment pending' : 
                         appointment.status === 'COMPLETED' ? 'Appointment completed' : 'Appointment status updated',
              unreadCount: 0,
              otherUserId: appointment.patient?.userId || appointment.patientId, // Use patient's userId if available, fallback to patientId
              appointmentId: appointment.id,
              lastMessageTime: appointment.createdAt?.toString() || new Date().toISOString(),
              type: 'APPOINTMENT' as const,
              status,
              appointmentDate: appointment.date.toString(),
              appointmentType: appointment.type
            };

            newConversations.push(conversation);
          });

          // Removed doctor-to-doctor conversations - doctors only chat with patients

        } else if (user?.role === 'PATIENT') {
          // Generate conversations from patient appointments
          appointments.forEach(appointment => {
            const appointmentDate = new Date(appointment.date);
            const activeWindowMs = 30 * 60 * 1000;
            const isWithinWindow = Math.abs(appointmentDate.getTime() - now.getTime()) <= activeWindowMs;

            let status: 'UPCOMING' | 'PAST' | 'ACTIVE' = 'UPCOMING';
            if (appointment.status === 'COMPLETED' || now.getTime() > appointmentDate.getTime() + activeWindowMs) {
              status = 'PAST';
            } else if (appointment.status === 'CONFIRMED' && isWithinWindow) {
              status = 'ACTIVE';
            } else {
              status = 'UPCOMING';
            }

            // Get doctor name from appointment data
            let doctorName = 'Unknown Doctor';
            if (appointment.doctor && appointment.doctor.firstName && appointment.doctor.lastName) {
              doctorName = `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`;
            } else if (appointment.doctorId) {
              doctorName = `Dr. #${appointment.doctorId}`;
            }
            
            const conversation = {
              id: appointment.id,
              name: doctorName,
              lastMessage: appointment.status === 'CONFIRMED' ? 'Appointment confirmed' : 
                         appointment.status === 'PENDING' ? 'Appointment pending' : 
                         appointment.status === 'COMPLETED' ? 'Appointment completed' : 'Appointment status updated',
              unreadCount: 0,
              otherUserId: appointment.doctor?.userId || appointment.doctorId, // Use doctor's userId if available, fallback to doctorId
              appointmentId: appointment.id,
              lastMessageTime: appointment.createdAt?.toString() || new Date().toISOString(),
              type: 'APPOINTMENT' as const,
              status,
              appointmentDate: appointment.date.toString(),
              appointmentType: appointment.type
            };

            newConversations.push(conversation);
          });
        }

        // Sort conversations: ACTIVE first, then UPCOMING, then PAST
        newConversations.sort((a, b) => {
          const statusOrder = { 'ACTIVE': 0, 'UPCOMING': 1, 'PAST': 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        });

        setConversations(newConversations);
      } catch (err) {
        // failed to generate conversations
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    generateConversationsFromAppointments();
  }, [user?.id, user?.role, appointments]);

  // Update conversations when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const conversationId = lastMessage.appointmentId;

      if (conversationId) {
        setConversations(prev => {
                     const updated = prev.map(conv => 
             conv.id === conversationId 
               ? { 
                   ...conv, 
                   lastMessage: lastMessage.content,
                   lastMessageTime: typeof lastMessage.createdAt === 'string' 
                     ? lastMessage.createdAt 
                     : new Date(lastMessage.createdAt).toISOString(),
                   unreadCount: conv.unreadCount + 1
                 }
               : conv
           );

          // Sort conversations: most recent first, then by status
          return updated.sort((a, b) => {
            // First sort by last message time (most recent first)
            const timeA = new Date(a.lastMessageTime || 0).getTime();
            const timeB = new Date(b.lastMessageTime || 0).getTime();
            if (timeA !== timeB) return timeB - timeA;
            
            // Then sort by status: ACTIVE first, then UPCOMING, then PAST
            const statusOrder = { 'ACTIVE': 0, 'UPCOMING': 1, 'PAST': 2 };
            return statusOrder[a.status] - statusOrder[b.status];
          });
        });
      }
    }
  }, [messages]);

  const markConversationAsRead = (conversationId: number) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const updateLastMessage = (conversationId: number, message: string) => {
    setConversations(prev => {
      const updated = prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              lastMessage: message, 
              lastMessageTime: new Date().toISOString(),
              unreadCount: conv.unreadCount + 1
            }
          : conv
      );
      
      // Sort conversations: most recent first, then by status
      return updated.sort((a, b) => {
        // First sort by last message time (most recent first)
        const timeA = new Date(a.lastMessageTime || 0).getTime();
        const timeB = new Date(b.lastMessageTime || 0).getTime();
        if (timeA !== timeB) return timeB - timeA;
        
        // Then sort by status: ACTIVE first, then UPCOMING, then PAST
        const statusOrder = { 'ACTIVE': 0, 'UPCOMING': 1, 'PAST': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
    });
  };

  const getUpcomingConversations = () => {
    return conversations.filter(conv => conv.status === 'UPCOMING');
  };

  const getPastConversations = () => {
    return conversations.filter(conv => conv.status === 'PAST');
  };

  const getActiveConversations = () => {
    return conversations.filter(conv => conv.status === 'ACTIVE');
  };

  const canStartVideoCall = (conversation: Conversation) => {
    if (conversation.type !== 'APPOINTMENT') {
      return false;
    }

    if (conversation.appointmentType !== 'VIDEO') return false;
    if (!conversation.appointmentDate) return false;
    const apptDate = new Date(conversation.appointmentDate);
    const activeWindowMs = 30 * 60 * 1000;
    return Math.abs(new Date().getTime() - apptDate.getTime()) <= activeWindowMs;
  };

  const canStartAudioCall = (conversation: Conversation) => {
    if (conversation.type !== 'APPOINTMENT') {
      return false;
    }

    // Audio calls are only allowed for VIDEO-type appointments within the active window
    if (conversation.appointmentType !== 'VIDEO') return false;
    if (!conversation.appointmentDate) return false;
    const apptDate = new Date(conversation.appointmentDate);
    const activeWindowMs = 30 * 60 * 1000;
    return Math.abs(new Date().getTime() - apptDate.getTime()) <= activeWindowMs;
  };

  return {
    conversations,
    loading,
    error,
    markConversationAsRead,
    updateLastMessage,
    getUpcomingConversations,
    getPastConversations,
    getActiveConversations,
    canStartVideoCall,
    canStartAudioCall
  };
}
