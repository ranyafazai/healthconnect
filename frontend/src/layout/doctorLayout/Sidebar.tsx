import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../Redux/hooks";
import type { RootState } from "../../Redux/store";
import { logoutUser } from "../../Redux/authSlice/authSlice";
import { clearProfile } from "../../Redux/userSlice/userSlice";
import { clearMessages } from "../../Redux/chatSlice/chatSlice";
import { clearNotifications } from "../../Redux/notificationSlice/notificationSlice";
import { disconnectAllSockets } from "../../lib/socket";
import { Calendar, MessageSquare, Star, User, LogOut, Home } from "lucide-react";
import { useEffect } from "react";
import { fetchDoctorDashboard } from "../../Redux/doctorSlice/doctorSlice";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user: authUser } = useAppSelector((state: RootState) => state.auth);
  const { profile } = useAppSelector((state: RootState) => state.user);
  const { dashboardData } = useAppSelector((state: RootState) => state.doctor);

  // Fetch dashboard data to get unread message count
  useEffect(() => {
    if (authUser?.doctorProfile?.id) {
      dispatch(fetchDoctorDashboard());
      
      // Set up periodic refresh every 30 seconds
      const interval = setInterval(() => {
        dispatch(fetchDoctorDashboard());
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [dispatch, authUser?.doctorProfile?.id]);

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all duration-200 justify-center lg:justify-start ${
      location.pathname === path
        ? "bg-cyan-600 text-white shadow-md"
        : "hover:bg-gray-100 text-gray-700 hover:text-cyan-600"
    }`;

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      // Clear all other states
      dispatch(clearProfile());
      dispatch(clearMessages());
      dispatch(clearNotifications());
      // Disconnect all sockets
      disconnectAllSockets();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local states and navigate away
      dispatch(clearProfile());
      dispatch(clearMessages());
      dispatch(clearNotifications());
      // Disconnect all sockets
      disconnectAllSockets();
      navigate('/');
    }
  };

  const getUserInitials = () => {
    if (profile?.doctorProfile?.firstName && profile?.doctorProfile?.lastName) {
      return `${profile.doctorProfile.firstName.charAt(0)}${profile.doctorProfile.lastName.charAt(0)}`.toUpperCase();
    }
    return authUser?.email?.charAt(0).toUpperCase() || 'D';
  };

  const getUserName = () => {
    if (profile?.doctorProfile?.firstName && profile?.doctorProfile?.lastName) {
      return `Dr. ${profile.doctorProfile.firstName} ${profile.doctorProfile.lastName}`;
    }
    return `Dr. ${authUser?.email?.split('@')[0] || 'Doctor'}`;
  };

  const getSpecialization = () => {
    return profile?.doctorProfile?.specialization || 'Doctor';
  };

  // Get unread message count from dashboard data
  const unreadMessageCount = dashboardData?.unreadMessages || 0;

  return (
    <div className="sticky top-0 flex flex-col justify-between h-screen w-16 md:w-20 lg:w-72 border-r border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-300">
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-100">
          <div className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-full w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 flex items-center justify-center font-bold text-lg shadow-lg">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0 hidden lg:block">
            <h2 className="font-semibold text-gray-900 truncate">{getUserName()}</h2>
            <p className="text-sm text-gray-500">{getSpecialization()}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-2">
          <button className={linkClass("/")} onClick={() => navigate("/doctor/")}>
            <Home size={20} className="flex-shrink-0" /> 
            <span className="font-medium hidden lg:inline">Dashboard</span>
          </button>
          
          <button className={linkClass("/appointments")} onClick={() => navigate("/doctor/appointments")}>
            <Calendar size={20} className="flex-shrink-0" /> 
            <span className="font-medium hidden lg:inline">Appointments</span>
          </button>
          
          <button className={`${linkClass("/messages")} relative`} onClick={() => navigate("/doctor/messages")}>
            <MessageSquare size={20} className="flex-shrink-0" /> 
            <span className="font-medium hidden lg:inline">Messages</span>
            {unreadMessageCount > 0 && (
              <span className="absolute right-3 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 hidden lg:flex items-center justify-center shadow-sm">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )}
          </button>
          
          <button className={linkClass("/reviews")} onClick={() => navigate("/doctor/reviews")}>
            <Star size={20} className="flex-shrink-0" /> 
            <span className="font-medium hidden lg:inline">Reviews</span>
          </button>
          
          <button className={linkClass("/profile")} onClick={() => navigate("/doctor/profile")}>
            <User size={20} className="flex-shrink-0" /> 
            <span className="font-medium hidden lg:inline">Profile</span>
          </button>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <button 
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200 font-medium justify-center lg:justify-start"
          onClick={handleLogout}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}
