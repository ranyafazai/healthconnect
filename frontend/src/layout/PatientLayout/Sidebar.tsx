import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../Redux/hooks";
import type { RootState } from "../../Redux/store";
import { clearAuth } from "../../Redux/authSlice/authSlice";
import {
  Calendar,
  MessageSquare,
  User,
  LogOut,
  Grid,
  Settings,
  File,
  Star,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user: authUser } = useAppSelector((state: RootState) => state.auth);
  const { profile } = useAppSelector((state: RootState) => state.user);
  const { messages } = useAppSelector((state: RootState) => state.chat);

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-2 rounded-md w-full ${
      location.pathname === path
        ? "bg-[#008CBA] text-white"
        : "hover:bg-gray-100 text-gray-700"
    }`;

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate('/');
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
    <div className="sticky top-0 flex flex-col justify-between h-screen w-64 border-r bg-white">
      <div>
        <div className="flex items-center gap-3 p-4">
          <div className="bg-[#008CBA] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
            {getUserInitials()}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">{getUserName()}</h2>
            <p className="text-sm text-gray-500">Patient</p>
          </div>
        </div>

        <nav className="mt-4 space-y-1">
          <button
            className={linkClass("/")}
            onClick={() => navigate("/patient/")}
          >
            <Grid size={18} /> Dashboard
          </button>
          <button
            className={linkClass("/appointments")}
            onClick={() => navigate("/patient/appointments")}
          >
            <Calendar size={18} /> Appointments
          </button>
          <button
            className={linkClass("/past-consultation")}
            onClick={() => navigate("/patient/past-consultation")}
          >
            <File size={18} /> Past Consultations
          </button>
          <button
            className={`${linkClass("/messages")} relative`}
            onClick={() => navigate("/patient/messages")}
          >
            <MessageSquare size={18} /> Messages
            {unreadMessagesCount > 0 && (
              <span className="absolute right-4 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </button>
          <button
            className={linkClass("/profile")}
            onClick={() => navigate("/patient/profile")}
          >
            <User size={18} /> Profile
          </button>
          <button
            className={linkClass("/reviews")}
            onClick={() => navigate("/patient/reviews")}
          >
            <Star size={18} /> Reviews
          </button>
          <button
            className={linkClass("/settings")}
            onClick={() => navigate("/patient/settings")}
          >
            <Settings size={18} /> Settings
          </button>
        </nav>
      </div>

      <button 
        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 text-gray-700 border-t text-red-600"
        onClick={handleLogout}
      >
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
}
