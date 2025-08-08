
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function Sidebarprofile() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => 
    location.pathname.includes(`/doctor/profile/${path}`)  || location.pathname === `/doctor/profile`;
    

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Edit Profile</h1>
      <p className="text-gray-600 mb-6">Update your professional information</p>

      {/* Profile sub-navigation */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <button 
          className={`text-left pb-1 ${isActive('basic') ? 'text-cyan-600 border-b-2 border-cyan-600' : ''}`}
          onClick={() => navigate('/doctor/profile/basics')}
        >
          Basic Information
        </button>
        <button 
          className={`text-left pb-1 ${isActive('contact') ? 'text-cyan-600 border-b-2 border-cyan-600' : ''}`}
          onClick={() => navigate('/doctor/profile/contact')}
        >
          Contact Information
        </button>
        <button 
          className={`text-left pb-1 ${isActive('professional') ? 'text-cyan-600 border-b-2 border-cyan-600' : ''}`}
          onClick={() => navigate('/doctor/profile/professional')}
        >
          Professional Details
        </button>
        <button 
          className={`text-left pb-1 ${isActive('availability') ? 'text-cyan-600 border-b-2 border-cyan-600' : ''}`}
          onClick={() => navigate('/doctor/profile/availability')}
        >
          Availability
        </button>
      </div>

      

      
    </div>
  );
}