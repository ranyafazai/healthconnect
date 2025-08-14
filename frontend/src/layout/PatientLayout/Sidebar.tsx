import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../Redux/hooks";
import type { RootState } from "../../Redux/store";
import { logoutUser } from "../../Redux/authSlice/authSlice";
import { clearProfile } from "../../Redux/userSlice/userSlice";
import { clearPatient } from "../../Redux/patientSlice/patientSlice";
import { clearMessages } from "../../Redux/chatSlice/chatSlice";
import { clearNotifications } from "../../Redux/notificationSlice/notificationSlice";
import { disconnectAllSockets } from "../../lib/socket";
import {
  Calendar,
  MessageSquare,
  User,
  LogOut,
  
  Settings,
  
  Star,
  Home,
  Clock,
  
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user: authUser } = useAppSelector((state: RootState) => state.auth);
  const { profile } = useAppSelector((state: RootState) => state.user);
  const { messages } = useAppSelector((state: RootState) => state.chat);

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all duration-200 justify-center lg:justify-start ${
      location.pathname === path
        ? "bg-[#008CBA] text-white shadow-md"
        : "hover:bg-gray-100 text-gray-700 hover:text-[#008CBA]"
    }`;

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      // Clear all other states
      dispatch(clearProfile());
      dispatch(clearPatient());
      dispatch(clearMessages());
      dispatch(clearNotifications());
      // Disconnect all sockets
      disconnectAllSockets();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local states and navigate away
      dispatch(clearProfile());
      dispatch(clearPatient());
      dispatch(clearMessages());
      dispatch(clearNotifications());
      // Disconnect all sockets
      disconnectAllSockets();
      navigate('/');
    }
  };

  const getUserInitials = () => {
    if (profile?.patientProfile?.firstName && profile?.patientProfile?.lastName) {
      return `${profile.patientProfile.firstName.charAt(0)}${profile.patientProfile.lastName.charAt(0)}`.toUpperCase();
    }
    return authUser?.email?.charAt(0).toUpperCase() || 'P';
  };

  const getUserName = () => {
    if (profile?.patientProfile?.firstName && profile?.patientProfile?.lastName) {
      return `${profile.patientProfile.firstName} ${profile.patientProfile.lastName}`;
    }
    return authUser?.email?.split('@')[0] || 'Patient';
  };

  // Calculate unread messages count
  const unreadMessagesCount = messages.filter(msg => !msg.isRead).length;

  return (
    <div className="sticky top-0 flex flex-col justify-between h-screen w-16 md:w-20 lg:w-72 border-r border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-300">
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-100">
          <div className="bg-gradient-to-br from-[#008CBA] to-[#0066CC] text-white rounded-full w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 flex items-center justify-center font-bold text-lg shadow-lg">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0 hidden lg:block">
            <h2 className="font-semibold text-gray-900 truncate">{getUserName()}</h2>
            <p className="text-sm text-gray-500">Patient</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-2">
          <button
            className={linkClass("/")}
            onClick={() => navigate("/patient/")}
          >
            <Home size={20} className="flex-shrink-0" /> 
            <span className="font-medium hidden lg:inline">Dashboard</span>
          </button>
          
          <button
            className={linkClass("/appointments")}
            onClick={() => navigate("/patient/appointments")}
          >
            <Calendar size={20} className="flex-shrink-0" /> 
            <span className="font-medium hidden lg:inline">Appointments</span>
          </button>
          
          <button
            className={linkClass("/past-consultation")}
            onClick={() => navigate("/patient/past-consultation")}
          >
            <Clock size={20} className="flex-shrink-0" /> 
            <span className="font-medium hidden lg:inline">Past Consultations</span>
          </button>
          
          <button
            className={`${linkClass("/messages")} relative`}
            onClick={() => navigate("/patient/messages")}
          >
            <MessageSquare size={20} className="flex-shrink-0" /> 
            <span className="font-medium hidden lg:inline">Messages</span>
            {unreadMessagesCount > 0 && (
              <span className="absolute right-3 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 hidden lg:flex items-center justify-center shadow-sm">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </button>
          
          <button
            className={linkClass("/reviews")}
            onClick={() => navigate("/patient/reviews")}
          >
            <Star size={20} className="flex-shrink-0" /> 
            <span className="font-medium hidden lg:inline">Reviews</span>
          </button>
          
          <button
            className={linkClass("/profile")}
            onClick={() => navigate("/patient/profile")}
          >
            <User size={20} className="flex-shrink-0" /> 
            <span className="font-medium hidden lg:inline">Profile</span>
          </button>
          
          <button
            className={linkClass("/settings")}
            onClick={() => navigate("/patient/settings")}
          >
            <Settings size={20} className="flex-shrink-0" /> 
            <span className="font-medium hidden lg:inline">Settings</span>
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
