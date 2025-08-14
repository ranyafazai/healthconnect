import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { ImAidKit } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../ui/NotificationDropdown";
import { useAppSelector } from "../../Redux/hooks";
import type { RootState } from "../../Redux/store";
import { ChevronDown, Menu } from "lucide-react";

interface NavbarProps {
  isAuthenticated?: boolean;
}

export function Navbar({ isAuthenticated = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or resizing window
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleResize = () => {
      setDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="w-full">
      {/* Top Blue Strip */}
      <div className="w-full h-1 bg-[#008CBA]"></div>

      {/* Main Navigation */}
      <nav className="w-full bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#008CBA] rounded-full flex items-center justify-center">
            <ImAidKit className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-800">HealthConnect</span>
        </div>

                 {/* Desktop Navigation - Hidden on mobile and medium screens when authenticated */}
         <div className="hidden lg:flex items-center gap-8">
           {!isAuthenticated && !user && (
             <>
               <a href="/" className="text-gray-900 hover:text-gray-700 transition-colors">Home</a>
               <a href="/how-it-works" className="text-gray-900 hover:text-gray-700 transition-colors">How It Works</a>
               <a href="/about" className="text-gray-900 hover:text-gray-700 transition-colors">About</a>
             </>
           )}
           {!isAuthenticated && !user && (
             <Button className="bg-[#008CBA] hover:bg-[#007A9A] text-white px-6 py-2 rounded-full" onClick={() => navigate("/auth/signin")}>
               Sign In
             </Button>
           )}
         </div>

                 {/* Medium Screen Navigation - Dropdown for non-authenticated users */}
         {!isAuthenticated && !user && (
           <div className="hidden md:flex lg:hidden items-center gap-4">
            {/* Navigation Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 text-gray-900 hover:text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Menu className="w-4 h-4" />
                <span>Menu</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
                             {dropdownOpen && (
                 <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                   <div className="py-2">
                     <a 
                       href="/" 
                       className="block px-4 py-2 text-gray-900 hover:bg-gray-100 transition-colors"
                       onClick={() => setDropdownOpen(false)}
                     >
                       Home
                     </a>
                     <a 
                       href="/how-it-works" 
                       className="block px-4 py-2 text-gray-900 hover:bg-gray-100 transition-colors"
                       onClick={() => setDropdownOpen(false)}
                     >
                       How It Works
                     </a>
                     <a 
                       href="/about" 
                       className="block px-4 py-2 text-gray-900 hover:bg-gray-100 transition-colors"
                       onClick={() => setDropdownOpen(false)}
                     >
                       About
                     </a>
                   </div>
                 </div>
               )}
            </div>
            
            {/* Sign In Button */}
            <Button 
              className="bg-[#008CBA] hover:bg-[#007A9A] text-white px-6 py-2 rounded-full" 
              onClick={() => navigate("/auth/signin")}
            >
              Sign In
            </Button>
          </div>
        )}

        {/* User Info and Notifications - Only show when authenticated */}
        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="flex items-center gap-3">
              <div
                className="bg-[#008CBA] text-white w-10 h-10 flex items-center justify-center rounded-full font-bold cursor-pointer"
                onClick={() => {
                  // Navigate based on user role
                  if (user.role === 'DOCTOR') {
                    navigate('/doctor/dashboard');
                  } else if (user.role === 'PATIENT') {
                    navigate('/patient/');
                  } else {
                    navigate('/'); // Default fallback
                  }
                }}
              >
                {user.email ? getUserInitials(user.email.split('@')[0]) : 'U'}
              </div>
              <div className="text-right">
                <p className="font-medium text-sm text-gray-900">
                  {user.email ? user.email.split('@')[0] : 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user.role === 'DOCTOR' ? 'Doctor' : user.role === 'PATIENT' ? 'Patient' : 'User'} ID: #{user.id || '12345'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Hamburger - Only on small screens */}
        {!isAuthenticated && !user && (
        <div className="md:hidden">
          <button
            className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#007A9A]"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
            <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
            <span className="block w-6 h-0.5 bg-gray-800"></span>
          </button>
        </div>
        )}
      </nav>

      {/* Mobile Sidebar Menu - Only on small screens */}
      {menuOpen && !isAuthenticated && !user && (
        <div className="md:hidden absolute top-16 right-2  w-64 bg-white border border-gray-200 shadow-lg z-50">
                     <div className="flex flex-col p-6 space-y-4">
             {!isAuthenticated && !user && (
               <>
                 <a href="/" className="text-gray-900 hover:text-gray-700 transition-colors py-2">Home</a>
                 <a href="/how-it-works" className="text-gray-900 hover:text-gray-700 transition-colors py-2">How It Works</a>
                 <a href="/about" className="text-gray-900 hover:text-gray-700 transition-colors py-2">About</a>
               </>
             )}
             {!isAuthenticated && !user && (
               <Button className="w-full bg-[#008CBA] hover:bg-[#007A9A] text-white py-2 rounded-full mt-4" onClick={() => navigate("/auth/signin")}>
                 Sign In
               </Button>
             )}
           </div>
        </div>
      )}
    </div>
  );
}