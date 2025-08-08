import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  MessageSquare,
  User,
  LogOut,
  Grid,
  Settings,
  File,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-2 rounded-md w-full ${
      location.pathname === path
        ? "bg-cyan-600 text-white"
        : "hover:bg-gray-100 text-gray-700"
    }`;

  return (
    <div className="sticky top-0 flex flex-col justify-between h-screen w-64 border-r bg-white">
      <div>
        <div className="flex items-center gap-3 p-4">
          <div className="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
            DJ
          </div>
          <div>
            <h2 className="font-semibold">Dr. Sarah Johnson</h2>
            <p className="text-sm text-gray-500">Internal Medicine</p>
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
            <span className="absolute right-4 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>
          <button
            className={linkClass("/profile")}
            onClick={() => navigate("/patient/profile")}
          >
            <User size={18} /> Profile
          </button>
          <button
            className={linkClass("/settings")}
            onClick={() => navigate("/patient/settings")}
          >
            <Settings size={18} /> Settings
          </button>
        </nav>
      </div>

      <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 text-gray-700 border-t">
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
}
