import { Route, Routes } from "react-router-dom";
import { useAppSelector } from "../Redux/hooks";
import type { RootState } from "../Redux/store";
import { Navbar } from "../components/NavBar/NavBar";
import Sidebar from "../layout/PatientLayout/Sidebar";
import Profile from "../layout/PatientLayout/Profile";
import Appointments from "../layout/PatientLayout/Appointments";
import PastConsultation from "../layout/PatientLayout/PastConsultation";
import Messages from "../layout/PatientLayout/Messages";
import Reviews from "../layout/PatientLayout/Reviews";
import Settings from "../layout/PatientLayout/Settings";
import Dashboard from "../layout/PatientLayout/Dashboard";
import NotFound from "./NotFound";
import BookingProcess from "../layout/PatientLayout/BookingProces";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { PERMISSIONS } from "../lib/permissions";
import ReviewModal from "../components/review/ReviewModal";
import { useReviewModalContext } from "../contexts/ReviewModalContext";

function PatientPage() {
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const { modalState, closeReviewModal } = useReviewModalContext();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1  bg-gray-50">
          <Routes>
            {/* Booking - requires appointment creation permission */}
            <Route 
              path="booking" 
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.CREATE_APPOINTMENT]}>
                  <BookingProcess />
                </ProtectedRoute>
              } 
            />
            
            {/* Dashboard - requires basic profile read permission */}
            <Route 
              path="dashboard" 
              element={<Dashboard />}
            />
            
            {/* Default route - redirect to dashboard */}
            <Route 
              path="" 
              element={<Dashboard />}
            />
            
            {/* Appointments - requires appointment read permission */}
            <Route 
              path="appointments" 
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.READ_OWN_APPOINTMENTS]}>
                  <Appointments />
                </ProtectedRoute>
              } 
            />
            
            {/* Past consultations - requires appointment read permission */}
            <Route 
              path="past-consultation" 
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.READ_OWN_APPOINTMENTS]}>
                  <PastConsultation />
                </ProtectedRoute>
              } 
            />
            
            {/* Messages - requires message read permission */}
            <Route 
              path="messages" 
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.READ_OWN_MESSAGES]}>
                  <Messages />
                </ProtectedRoute>
              } 
            />

            {/* Reviews - requires review read permission */}
            <Route 
              path="reviews" 
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.READ_REVIEWS]}>
                  <Reviews />
                </ProtectedRoute>
              } 
            />

            {/* Profile - requires profile read permission */}
            <Route 
              path="profile/*" 
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.READ_OWN_PROFILE]}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* Settings - requires profile update permission */}
            <Route 
              path="settings" 
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.UPDATE_OWN_PROFILE]}>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={modalState.isOpen}
        onClose={closeReviewModal}
        doctorId={modalState.doctorId || 0}
        doctorName={modalState.doctorName}
        appointmentId={modalState.appointmentId || undefined}
      />
    </div>
  );
}

export default PatientPage;
