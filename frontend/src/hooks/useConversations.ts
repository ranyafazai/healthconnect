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

        console.log('🔍 Generating conversations from appointments:', appointments.length);
        console.log('👤 Current user role:', user?.role);

        if (user?.role === 'DOCTOR') {
          // Generate conversations from appointments
          appointments.forEach(appointment => {
            const appointmentDate = new Date(appointment.date);
            const isUpcoming = appointmentDate > now;
            const isPast = appointmentDate < now && appointment.status === 'COMPLETED';
            const isActive = appointment.status === 'CONFIRMED' && Math.abs(appointmentDate.getTime() - now.getTime()) < 30 * 60 * 1000; // 30 minutes before/after

            let status: 'UPCOMING' | 'PAST' | 'ACTIVE' = 'UPCOMING';
            if (isPast) status = 'PAST';
            else if (isActive) status = 'ACTIVE';

            // Get patient name from appointment data
            const patientName = `Patient #${appointment.patientId}`; // In real app, fetch patient details
            
            const conversation = {
              id: appointment.id,
              name: patientName,
              lastMessage: appointment.status === 'CONFIRMED' ? 'Appointment confirmed' : 'Appointment pending',
              unreadCount: 0,
              otherUserId: appointment.patientId,
              appointmentId: appointment.id,
              lastMessageTime: appointment.createdAt?.toString() || new Date().toISOString(),
              type: 'APPOINTMENT' as const,
              status,
              appointmentDate: appointment.date.toString(),
              appointmentType: appointment.type
            };
            
            console.log('📅 Created doctor conversation:', conversation);
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
            const isUpcoming = appointmentDate > now;
            const isPast = appointmentDate < now && appointment.status === 'COMPLETED';
            const isActive = appointment.status === 'CONFIRMED' && Math.abs(appointmentDate.getTime() - now.getTime()) < 30 * 60 * 1000;

            let status: 'UPCOMING' | 'PAST' | 'ACTIVE' = 'UPCOMING';
            if (isPast) status = 'PAST';
            else if (isActive) status = 'ACTIVE';

            // Get doctor name from appointment data
            const doctorName = `Dr. #${appointment.doctorId}`; // In real app, fetch doctor details
            
            const conversation = {
              id: appointment.id,
              name: doctorName,
              lastMessage: appointment.status === 'CONFIRMED' ? 'Appointment confirmed' : 'Appointment pending',
              unreadCount: 0,
              otherUserId: appointment.doctorId,
              appointmentId: appointment.id,
              lastMessageTime: appointment.createdAt?.toString() || new Date().toISOString(),
              type: 'APPOINTMENT' as const,
              status,
              appointmentDate: appointment.date.toString(),
              appointmentType: appointment.type
            };
            
            console.log('📅 Created patient conversation:', conversation);
            newConversations.push(conversation);
          });
        }

        // Sort conversations: ACTIVE first, then UPCOMING, then PAST
        newConversations.sort((a, b) => {
          const statusOrder = { 'ACTIVE': 0, 'UPCOMING': 1, 'PAST': 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        });

        console.log('✅ Final conversations:', newConversations);
        setConversations(newConversations);
      } catch (err) {
        console.error('Failed to generate conversations:', err);
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
    console.log('🎥 canStartVideoCall called for conversation:', conversation);
    
    if (conversation.type !== 'APPOINTMENT' || !conversation.appointmentDate) {
      console.log('❌ Cannot start video call: Not an appointment or missing date');
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
    const canCall = conversation.appointmentType === 'VIDEO';
    console.log('🎥 Video call allowed:', canCall, 'for appointment type:', conversation.appointmentType);
    return canCall;
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
