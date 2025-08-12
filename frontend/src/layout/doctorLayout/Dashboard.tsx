import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../Redux/hooks";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MessageSquare,
  Star,
  CheckCircle,
  User,
  Users,
  FileText,
  Video,
  Info
} from "lucide-react";
import type { RootState } from "../../Redux/store";
import { fetchAppointmentsByDoctor } from "../../Redux/appointmentSlice/appointmentSlice";
import { fetchNotifications } from "../../Redux/notificationSlice/notificationSlice";
import { fetchDoctorReviews } from "../../Redux/reviewSlice/reviewSlice";
import NotificationDropdown from "../../components/ui/NotificationDropdown";
import type { Appointment } from "../../types/data/appointment";
import type { Review } from "../../types/data/review";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { appointments, loading: appointmentsLoading } = useAppSelector((state: RootState) => state.appointment);
  const { notifications } = useAppSelector((state: RootState) => state.notification);
  const { reviews } = useAppSelector((state: RootState) => state.review);
  const { unreadCount } = useAppSelector((state: RootState) => state.chat as any);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotifications());
      if (user.doctorProfile?.id) {
        dispatch(fetchAppointmentsByDoctor(user.doctorProfile.id));
        dispatch(fetchDoctorReviews(user.doctorProfile.id));
      }
    }
  }, [dispatch, user?.id, user?.doctorProfile?.id]);

  // Refresh appointments when user navigates to dashboard
  useEffect(() => {
    const handleFocus = () => {
      if (user?.doctorProfile?.id) {
        dispatch(fetchAppointmentsByDoctor(user.doctorProfile.id));
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch, user?.doctorProfile?.id]);

  // Calculate stats from real data
  const todayAppointments = appointments.filter((apt: Appointment) => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });
  
  const upcomingAppointments = appointments.filter((apt: Appointment) => 
    apt.status === 'CONFIRMED' || apt.status === 'PENDING'
  );
  
  const completedAppointments = appointments.filter((apt: Appointment) => 
    apt.status === 'COMPLETED'
  );
  
  const unreadNotifications = notifications.filter(notif => !notif.isRead);

  // Build rating distribution and top reviews using fetched reviews
  const ratingDistribution = React.useMemo(() => {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews as any[]) {
      const rating = Math.max(1, Math.min(5, Number((r as any).rating) || 0));
      dist[rating] = (dist[rating] || 0) + 1;
    }
    return dist;
  }, [reviews]);

  const topReviews = React.useMemo(() => {
    return [...(reviews as any[])]
      .sort((a, b) => ((b as any).rating || 0) - ((a as any).rating || 0))
      .slice(0, 3);
  }, [reviews]);

  
  // Use stored average rating if available, otherwise calculate from reviews
  const averageRating = user?.doctorProfile?.avgReview 
    ? user.doctorProfile.avgReview.toFixed(1)
    : reviews.length > 0 
      ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
      : 'N/A';

  const stats = [
    { 
      title: "Today's Appointments", 
      value: todayAppointments.length, 
      icon: <Calendar className="text-[#008CBA]" size={20} />,
      color: "text-[#008CBA]"
    },
    { 
      title: "Upcoming", 
      value: upcomingAppointments.length, 
      icon: <CheckCircle className="text-green-500" size={20} />,
      color: "text-green-500"
    },
    { 
      title: "Unread Messages", 
      value: typeof unreadCount === 'number' ? unreadCount : 0, 
      icon: <MessageSquare className="text-yellow-500" size={20} />,
      color: "text-yellow-500"
    },
    { 
      title: "Average Rating", 
      value: averageRating, 
      icon: <Star className="text-purple-500" size={20} />,
      color: "text-purple-500"
    },
  ];

  const getUserName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Doctor';
  };

  // Get today's appointments with patient details
  const todayAppointmentsData = todayAppointments.slice(0, 3).map((appointment: Appointment) => ({
    id: appointment.id,
    patientName: `Patient #${appointment.patientId}`,
    date: new Date(appointment.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    type: appointment.type === 'VIDEO' ? 'Video Call' : 'In-Person',
    status: appointment.status
  }));

  // Get recent reviews with patient details
  const recentReviewsData = reviews.slice(0, 3).map((review: Review) => ({
    id: review.id,
    patientName: `Patient #${review.patientId}`,
    rating: review.rating,
    comment: review.comment || 'No comment',
    date: new Date(review.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }));

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="flex-1 bg-gray-50 p-6">
      {/* Welcome Section & Summary Cards */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, Dr. {getUserName()}!</h1>
        <button 
          onClick={() => navigate('/doctor/appointments')}
          className="bg-[#008CBA] hover:bg-[#007399] text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          View All Appointments
        </button>
      </div>

      {/* Reviews Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rating Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold mb-3">Rating Distribution</h3>
          <div className="space-y-2">
            {[5,4,3,2,1].map((star) => {
              const count = ratingDistribution[star] || 0;
              const total = (reviews as any[]).length || 1;
              const pct = Math.round((count * 100) / total);
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-8 text-sm">{star}★</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded">
                    <div className="h-3 bg-yellow-400 rounded" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-sm text-gray-600">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Reviews */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold mb-3">Top Reviews</h3>
          <div className="space-y-3">
            {(topReviews as any[]).length === 0 && (
              <div className="text-sm text-gray-500">No reviews yet.</div>
            )}
            {(topReviews as any[]).map((r: any) => (
              <div key={r.id} className="border border-gray-200 rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < (r.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                  ))}
                </div>
                <div className="text-sm text-gray-700">{r.comment || 'No comment provided.'}</div>
              </div>
            ))}
          </div>
        </div>
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

      {/* Today's Appointments Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
          <button 
            className="text-[#008CBA] text-sm hover:underline font-medium"
            onClick={() => navigate('/doctor/appointments')}
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {appointmentsLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading appointments...</div>
            </div>
          ) : todayAppointmentsData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No appointments today</div>
            </div>
          ) : (
            todayAppointmentsData.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-[#008CBA] text-white w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm">
                    {appointment.patientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                    <p className="text-[#008CBA] text-sm">{appointment.date}</p>
                    <p className="text-gray-600 text-sm">{appointment.type}</p>
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
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Reviews Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Reviews</h2>
          <button 
            className="text-[#008CBA] text-sm hover:underline font-medium"
            onClick={() => navigate('/doctor/reviews')}
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentReviewsData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No reviews yet</div>
            </div>
          ) : (
            recentReviewsData.map((review) => (
              <div key={review.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-[#008CBA] text-white w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm">
                    {review.patientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{review.patientName}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-500" size={16} />
                        <span className="text-sm font-medium">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                    <p className="text-gray-500 text-xs mt-1">{review.date}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Professional Tip of the Day Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-[#008CBA] text-white w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0">
            <Info size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#008CBA] mb-2">Professional Tip of the Day</h3>
            <p className="text-gray-700 leading-relaxed">
              Take a moment to review your schedule at the start of each day. This helps ensure you're prepared for each patient and can provide the best possible care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
