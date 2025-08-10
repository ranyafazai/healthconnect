import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "./Redux/store";
import { checkAuthStatus } from "./Redux/authSlice/authSlice";
import PatientPage from "./pages/PatientPage";
import DoctorPage from "./pages/DoctorPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { PERMISSIONS } from "./lib/permissions";

// Component to handle authentication redirects
function AuthRedirect() {
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check authentication status when component mounts
    if (!isAuthenticated && !loading) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch, isAuthenticated, loading]);

  useEffect(() => {
    // If user is authenticated and on the landing page, redirect to appropriate dashboard
    console.log('AuthRedirect: isAuthenticated', isAuthenticated);
    console.log('AuthRedirect: user', user);
    console.log('AuthRedirect: location.pathname', location.pathname);
    if (isAuthenticated && user && location.pathname === '/') {
      if (user.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  // Don't render anything while checking authentication
  if (loading) {
    return null;
  }

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthRedirect />
      <Routes>        
        {/* Public routes */}
        <Route path="/*" element={<LandingPage />} />
        
        {/* Protected patient routes */}
        <Route 
          path="/patient/*" 
          element={
            <ProtectedRoute 
              requiredRole="PATIENT"
              requiredPermissions={[PERMISSIONS.READ_OWN_PROFILE]}
            >
              <PatientPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected doctor routes */}
        <Route 
          path="/doctor/*" 
          element={
            <ProtectedRoute 
              requiredRole="DOCTOR"
              requiredPermissions={[PERMISSIONS.READ_OWN_PROFILE]}
            >
              <DoctorPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Error pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
