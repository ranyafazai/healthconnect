import { Route, Routes } from "react-router-dom";
import Sidebar from "../layout/PatientLayout/Sidebar";
import Profile from "../layout/PatientLayout/Profile";
import Appointments from "../layout/PatientLayout/Appointments";
import PastConsultation from "../layout/PatientLayout/PastConsultation";
import Messages from "../layout/PatientLayout/Messages";
import Settings from "../layout/PatientLayout/Settings";
import Dashboard from "../layout/PatientLayout/Dashboard";
import NotFound from "./NotFound";
import BookingProcess from "../layout/PatientLayout/BookingProces";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { PERMISSIONS } from "../lib/permissions";

function PatientPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
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
            path="" 
            element={
              <ProtectedRoute requiredPermissions={[PERMISSIONS.READ_OWN_PROFILE]}>
                <Dashboard />
              </ProtectedRoute>
            } 
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
  );
}

export default PatientPage;
