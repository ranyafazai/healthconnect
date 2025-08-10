import React, { useState } from "react";
import { Button } from "../ui/button";
import { ImAidKit } from "react-icons/im";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="w-full">
      {/* Top Blue Strip */}
      <div className="w-full h-1 "></div>
      
      {/* Main Navigation */}
      <nav className="w-full bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#008CBA] rounded-full flex items-center justify-center">
            <ImAidKit className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-800">HealthConnect</span>
        </div>
        
        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="text-gray-900 hover:text-gray-700 transition-colors">Home</a>
          <a href="#" className="text-gray-900 hover:text-gray-700 transition-colors">Find Doctors</a>
          <a href="#" className="text-gray-900 hover:text-gray-700 transition-colors">How It Works</a>
          <a href="#" className="text-gray-900 hover:text-gray-700 transition-colors">About</a>
          <Button className="bg-[#008CBA] hover:bg-[#007A9A] text-white px-6 py-2 rounded-full" onClick={() => navigate("/signin")}>
            Sign In
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#008CBA]"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
            <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
            <span className="block w-6 h-0.5 bg-gray-800"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-64 bg-white border border-gray-200 shadow-lg z-50">
          <div className="flex flex-col p-6 space-y-4">
            <a href="/" className="text-gray-900 hover:text-gray-700 transition-colors py-2">Home</a>
            <a href="#" className="text-gray-900 hover:text-gray-700 transition-colors py-2">Find Doctors</a>
            <a href="#" className="text-gray-900 hover:text-gray-700 transition-colors py-2">How It Works</a>
            <a href="#" className="text-gray-900 hover:text-gray-700 transition-colors py-2">About</a>
            <Button className="w-full bg-[#008CBA] hover:bg-[#007A9A] text-white py-2 rounded-full mt-4" onClick={() => navigate("/signin")}>
              Sign In
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}