import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./Redux/hooks";
import type { RootState } from "./Redux/store";
import { checkAuthStatus } from "./Redux/authSlice/authSlice";
import PatientPage from "./pages/PatientPage";
import DoctorPage from "./pages/DoctorPage";
import LandingPage from "./pages/LandingPage";
import DoctorSearchPage from "./pages/DoctorSearchPage";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import BookingProces from "./layout/PatientLayout/BookingProces";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { PERMISSIONS } from "./lib/permissions";

// Component to handle authentication status checking
function AuthRedirect() {
  const { isAuthenticated, loading } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // On app mount, rely on httpOnly cookie and ask backend for user
    if (!isAuthenticated && !loading) {
      dispatch(checkAuthStatus());
    }
  }, []); // Empty dependency array to run only once

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
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/*" element={<LandingPage />} />
        <Route path="/search" element={<DoctorSearchPage />} />
        
        {/* Protected patient routes */}
        <Route 
          path="/patient/*" 
          element={
            <ProtectedRoute 
              requiredRole="PATIENT"
            >
              <PatientPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected booking route */}
        <Route 
          path="/patient/booking" 
          element={
            <ProtectedRoute 
              requiredRole="PATIENT"
            >
              <BookingProces />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected doctor routes - single route handles all doctor pages */}
        <Route 
          path="/doctor/*" 
          element={
            <ProtectedRoute 
              requiredRole="DOCTOR"
            >
              <DoctorPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Public doctor detail route for viewing other doctors - changed to avoid conflicts */}
        <Route path="/doctor-detail/:id" element={<DoctorProfilePage />} />
        
        {/* Error pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
