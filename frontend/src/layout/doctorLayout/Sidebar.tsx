import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../Redux/hooks";
import type { RootState } from "../../Redux/store";
import { clearAuth } from "../../Redux/authSlice/authSlice";
import { Calendar, MessageSquare, Star, User, LogOut, Grid } from "lucide-react";
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
    `flex items-center gap-3 px-4 py-2 rounded-md w-full ${
      location.pathname === path
        ? "bg-cyan-600 text-white"
        : "hover:bg-gray-100 text-gray-700"
    }`;

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate('/');
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
    <div className="sticky top-0 flex flex-col justify-between h-screen w-64 border-r bg-white">
      <div>
        <div className="flex items-center gap-3 p-4">
          <div className="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
            {getUserInitials()}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">{getUserName()}</h2>
            <p className="text-sm text-gray-500">{getSpecialization()}</p>
          </div>
        </div>

        <nav className="mt-4 space-y-1">
          <button className={linkClass("/")} onClick={() => navigate("/doctor/")}>
            <Grid size={18} /> Dashboard
          </button>
          <button className={linkClass("/appointments")} onClick={() => navigate("/doctor/appointments")}>
            <Calendar size={18} /> Appointments
          </button>
          <button className={`${linkClass("/messages")} relative`} onClick={() => navigate("/doctor/messages")}>
            <MessageSquare size={18} /> Messages
            {unreadMessageCount > 0 && (
              <span className="absolute right-4 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadMessageCount}
              </span>
            )}
          </button>
          <button className={linkClass("/reviews")} onClick={() => navigate("/doctor/reviews")}>
            <Star size={18} /> Reviews
          </button>
          <button className={linkClass("/profile")} onClick={() => navigate("/doctor/profile")}>
            <User size={18} /> Profile
          </button>
        </nav>
      </div>

      <button 
        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 text-gray-700 border-t"
        onClick={handleLogout}
      >
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
}
