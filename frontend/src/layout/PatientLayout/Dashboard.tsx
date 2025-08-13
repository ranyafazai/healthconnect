import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../Redux/hooks";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MessageSquare,
  CheckCircle,
  FileText,
  Video,
  User,
  Info
} from "lucide-react";
import type { RootState } from "../../Redux/store";
import { fetchAppointmentsByPatient } from "../../Redux/appointmentSlice/appointmentSlice";
import { fetchNotifications } from "../../Redux/notificationSlice/notificationSlice";
import type { Appointment } from "../../types/data/appointment";
import type { Message } from "../../types/data/message";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { appointments, loading: appointmentsLoading } = useAppSelector((state: RootState) => state.appointment);
  const { messages, loadingMessages: messagesLoading } = useAppSelector((state: RootState) => state.chat);

  // Debug logs removed

  // Redirect if not authenticated
  useEffect(() => {
    if (!user?.id) {
      navigate('/signin');
      return;
    }
  }, [user?.id, navigate]);

  useEffect(() => {
    if (user?.patientProfile?.id) {
      dispatch(fetchAppointmentsByPatient(user.patientProfile.id));
      dispatch(fetchNotifications());
    }
  }, [dispatch, user?.patientProfile?.id]);

  // State change tracing removed

  // Refresh appointments when user navigates to dashboard
  useEffect(() => {
    const handleFocus = () => {
      if (user?.patientProfile?.id) {
        dispatch(fetchAppointmentsByPatient(user.patientProfile.id));
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch, user?.patientProfile?.id]);

  // Early return if user is not authenticated
  if (!user?.id) {
    return (
      <div className="flex-1 bg-gray-50 p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to view your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats from real data with additional safety checks
  const upcomingAppointments = Array.isArray(appointments) 
    ? appointments.filter((apt: Appointment) => apt.status === 'CONFIRMED' || apt.status === 'PENDING') 
    : [];
  const completedAppointments = Array.isArray(appointments) 
    ? appointments.filter((apt: Appointment) => apt.status === 'COMPLETED') 
    : [];
  const unreadMessages = Array.isArray(messages) 
    ? messages.filter((msg: Message) => !msg.isRead) 
    : [];
  const healthRecords = 8; // Mock data for now - would need to fetch from medical records API

  // Show loading state while data is being fetched
  if (appointmentsLoading || messagesLoading) {
    return (
      <div className="flex-1 bg-gray-50 p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Additional safety check for appointments and messages
  if (!Array.isArray(appointments) || !Array.isArray(messages)) {
    return (
      <div className="flex-1 bg-gray-50 p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️ Data format error</div>
            <p className="text-gray-600">Please refresh the page or contact support.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      title: "Upcoming", 
      value: upcomingAppointments.length, 
      icon: <Calendar className="text-[#008CBA]" size={20} />,
      color: "text-[#008CBA]"
    },
    { 
      title: "Completed", 
      value: completedAppointments.length, 
      icon: <CheckCircle className="text-green-500" size={20} />,
      color: "text-green-500"
    },
    { 
      title: "New Messages", 
      value: unreadMessages.length, 
      icon: <MessageSquare className="text-yellow-500" size={20} />,
      color: "text-yellow-500"
    },
    { 
      title: "Health Records", 
      value: healthRecords, 
      icon: <FileText className="text-purple-500" size={20} />,
      color: "text-purple-500"
    },
  ];

  const getUserName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Get upcoming appointments with doctor details
  const upcomingAppointmentsData = Array.isArray(upcomingAppointments) 
    ? upcomingAppointments.slice(0, 2).map((appointment: Appointment) => ({
        id: appointment.id,
        doctorName: appointment.doctor 
          ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
          : `Dr. Unknown (ID: ${appointment.doctorId})`,
        specialty: appointment.doctor?.specialization || 'General',
        date: (appointment.date instanceof Date ? appointment.date : new Date(appointment.date)).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        type: appointment.type === 'VIDEO' ? 'Video Call' : 'In-Person',
        status: appointment.status === 'CONFIRMED' ? 'Confirmed' : 'Pending'
      }))
    : [];

  // Get recent messages with doctor details
  const recentMessagesData = Array.isArray(messages) 
    ? messages.slice(0, 2).map((message: Message) => ({
        id: message.id,
        doctorName: (() => {
          if (message.sender && typeof message.sender === 'object' && 'firstName' in message.sender && 'lastName' in message.sender) {
            return `Dr. ${message.sender.firstName} ${message.sender.lastName}`;
          }
          return `Dr. Unknown (ID: ${message.senderId})`;
        })(),
        message: message.content || 'No content',
        time: formatTimeAgo(new Date(message.createdAt)),
        unread: !message.isRead
      }))
    : [];

  const formatTimeAgo = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="flex-1 bg-gray-50 p-6">
      {/* Welcome Section & Summary Cards */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {getUserName()}!</h1>
        <button 
          onClick={() => navigate('/search')}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Book New Appointment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`${stat.color} mb-2`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
          <button 
            className="text-[#008CBA] text-sm hover:underline font-medium"
            onClick={() => navigate('/patient/appointments')}
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {appointmentsLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading appointments...</div>
            </div>
          ) : upcomingAppointmentsData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No upcoming appointments</div>
            </div>
          ) : (
            upcomingAppointmentsData.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-[#008CBA] text-white w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm">
                    {appointment.doctorName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                    <p className="text-[#008CBA] text-sm">{appointment.specialty}</p>
                    <p className="text-gray-600 text-sm">{appointment.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    {appointment.type === "Video Call" ? (
                      <Video size={16} />
                    ) : (
                      <User size={16} />
                    )}
                    <span className="text-sm">{appointment.type}</span>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Messages Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Messages</h2>
          <button 
            className="text-[#008CBA] text-sm hover:underline font-medium"
            onClick={() => navigate('/patient/messages')}
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {messagesLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : recentMessagesData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No recent messages</div>
            </div>
          ) : (
            recentMessagesData.map((message) => (
              <div key={message.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-[#008CBA] text-white w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm">
                    {message.doctorName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{message.doctorName}</h3>
                      {message.unread && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{message.message}</p>
                    <p className="text-gray-500 text-xs mt-1">{message.time}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Health Tip of the Day Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-[#008CBA] text-white w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0">
            <Info size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#008CBA] mb-2">Health Tip of the Day</h3>
            <p className="text-gray-700 leading-relaxed">
              Remember to stay hydrated! Aim for 8 glasses of water daily to maintain optimal health and energy levels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
