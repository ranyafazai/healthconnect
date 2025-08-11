import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../../Redux/hooks";
import type { RootState } from "../../../Redux/store";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);

  // If user is authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    if (user.role === 'DOCTOR') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else {
      return <Navigate to="/patient/dashboard" replace />;
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Left side: form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-16">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-[#008CBA] to-[#007BAA] rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">HealthyConnect</h1>
            <p className="text-gray-600 text-sm">Your health, our priority</p>
          </div>
          
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-center text-gray-600 text-sm mb-8">
            Welcome back! Please enter your details to continue.
          </p>
        </div>
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
            {children}
          </div>
        </div>
      </div>

      {/* Right side: image and content */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#008CBA] via-[#007BAA] to-[#006699]"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-12 text-center">
          <div className="mb-8">
            <svg className="mx-auto h-24 w-24 text-white/90 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-3xl font-bold mb-4">Connect with Healthcare Professionals</h3>
            <p className="text-xl text-white/90 leading-relaxed">
              Book appointments, get consultations, and manage your health journey with our trusted network of doctors and healthcare providers.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-12">
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-1">Quick Booking</h4>
              <p className="text-sm text-white/80">Book appointments in minutes</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-1">Secure & Private</h4>
              <p className="text-sm text-white/80">Your data is protected</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
