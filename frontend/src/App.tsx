import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./Redux/hooks";
import type { RootState } from "./Redux/store";
import { checkAuthStatus } from "./Redux/authSlice/authSlice";
import PatientPage from "./pages/PatientPage";
import DoctorPage from "./pages/DoctorPage";
import LandingPage from "./pages/LandingPage";
import DoctorSearchPage from "./pages/DoctorSearchPage";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import LearnMorePage from "./pages/LearnMorePage";
import HowToBookPage from "./pages/HowToBookPage";
import BookingProces from "./layout/PatientLayout/BookingProces";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ReviewModalProvider } from "./contexts/ReviewModalContext";
import LocationUpdater from "./components/location/LocationUpdater";


// Component to handle authentication status checking
function AuthRedirect() {
  const { isAuthenticated, loading } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Only run this effect once
    if (hasCheckedAuth.current) {
      return;
    }

    // No need to clear localStorage since we're using cookie-based auth
    // The backend cookie is the source of truth
    
    // Check authentication status only once when component mounts
    // Since we're using cookie-based auth, we can always check
    if (!isAuthenticated && !loading) {
      dispatch(checkAuthStatus());
    }
    
    hasCheckedAuth.current = true;
  }, []); // Empty dependency array to run only once

  // Don't render anything while checking authentication
  if (loading) {
    return null;
  }

  return null;
}

function App() {
  return (
    <ReviewModalProvider>
      <BrowserRouter>
        <AuthRedirect />
        <LocationUpdater />
        <Routes>        
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/*" element={<LandingPage />} />
        <Route path="/how-it-works" element={<LandingPage />} />
        <Route path="/about" element={<LandingPage />} />
        <Route path="/search" element={<DoctorSearchPage />} />
        <Route path="/learn-more" element={<LearnMorePage />} />
        <Route path="/how-to-book" element={<HowToBookPage />} />

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
    </ReviewModalProvider>
  );
}

export default App;
