import { useEffect, useState } from 'react';
import { useAppSelector } from '../Redux/hooks';
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
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { appointments } = useAppSelector((state: RootState) => state.appointment);
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
            const isUpcoming = appointmentDate > now && appointment.status === 'CONFIRMED';
            const isPast = appointmentDate < now && appointment.status === 'COMPLETED';
            const isActive = appointment.status === 'CONFIRMED' && Math.abs(appointmentDate.getTime() - now.getTime()) < 30 * 60 * 1000; // 30 minutes before/after

            let status: 'UPCOMING' | 'PAST' | 'ACTIVE' = 'UPCOMING';
            if (isPast) status = 'PAST';
            else if (isActive) status = 'ACTIVE';
            else if (appointment.status === 'PENDING') status = 'UPCOMING';

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
              otherUserId: appointment.patientId,
              appointmentId: appointment.id,
              lastMessageTime: appointment.updatedAt?.toString() || appointment.createdAt?.toString() || new Date().toISOString(),
              type: 'APPOINTMENT' as const,
              status,
              appointmentDate: appointment.date.toString(),
              appointmentType: appointment.type
            };
            
            newConversations.push(conversation);
          });

          // Add doctor-to-doctor conversations (mock for now)
          const doctorConversations: Conversation[] = [
            {
              id: 1001,
              name: 'Dr. Sarah Johnson',
              lastMessage: 'Can you review this case with me?',
              unreadCount: 1,
              otherUserId: 201,
              type: 'DOCTOR_TO_DOCTOR',
              status: 'ACTIVE',
              lastMessageTime: new Date().toISOString()
            },
            {
              id: 1002,
              name: 'Dr. Michael Chen',
              lastMessage: 'Great collaboration on the surgery',
              unreadCount: 0,
              otherUserId: 202,
              type: 'DOCTOR_TO_DOCTOR',
              status: 'PAST',
              lastMessageTime: new Date(Date.now() - 86400000).toISOString()
            }
             ];
          newConversations.push(...doctorConversations);

        } else if (user?.role === 'PATIENT') {
          // Generate conversations from patient appointments
          appointments.forEach(appointment => {
            const appointmentDate = new Date(appointment.date);
            const isUpcoming = appointmentDate > now && appointment.status === 'CONFIRMED';
            const isPast = appointmentDate < now && appointment.status === 'COMPLETED';
            const isActive = appointment.status === 'CONFIRMED' && Math.abs(appointmentDate.getTime() - now.getTime()) < 30 * 60 * 1000;

            let status: 'UPCOMING' | 'PAST' | 'ACTIVE' = 'UPCOMING';
            if (isPast) status = 'PAST';
            else if (isActive) status = 'ACTIVE';
            else if (appointment.status === 'PENDING') status = 'UPCOMING';

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
              otherUserId: appointment.doctorId,
              appointmentId: appointment.id,
              lastMessageTime: appointment.updatedAt?.toString() || appointment.createdAt?.toString() || new Date().toISOString(),
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
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              lastMessage: message, 
              lastMessageTime: new Date().toISOString(),
              unreadCount: conv.unreadCount + 1
            }
          : conv
      )
    );
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
    if (conversation.type !== 'APPOINTMENT' || !conversation.appointmentDate) {
      return false;
    }
    
    // TEMPORARILY DISABLED FOR TESTING - Allow calls at any time
    // const appointmentDate = new Date(conversation.appointmentDate);
    // const now = new Date();
    // const timeDiff = Math.abs(appointmentDate.getTime() - now.getTime());
    // const minutesDiff = timeDiff / (1000 * 60);
    
    // Allow video calls 5 minutes before and 30 minutes after appointment time
    // return minutesDiff <= 35 && conversation.appointmentType === 'VIDEO';
    
    // For testing: Allow all video calls regardless of time
    return conversation.appointmentType === 'VIDEO';
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
    canStartVideoCall
  };
}
