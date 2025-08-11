import { Route, Routes } from "react-router-dom";
import { useAppSelector } from "../Redux/hooks";
import type { RootState } from "../Redux/store";
import { Navbar } from "../components/NavBar/NavBar";
import NotFound from "./NotFound";
import Sidebar from "../layout/doctorLayout/Sidebar";
import Dashboard from "../layout/doctorLayout/Dashboard";
import Appointments from "../layout/doctorLayout/Appointments";
import Messages from "../layout/doctorLayout/Messages";
import Reviews from "../layout/doctorLayout/Reviews";
import Profile from "../layout/doctorLayout/Profile";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { PERMISSIONS } from "../lib/permissions";

function DoctorPage() {
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-50">
          <Routes>
            {/* Dashboard - requires basic profile read permission */}
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.READ_OWN_PROFILE]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Default route - redirect to dashboard */}
            <Route 
              path="" 
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.READ_OWN_PROFILE]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Appointments - requires doctor appointment management permission */}
            <Route 
              path="appointments" 
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.READ_DOCTOR_APPOINTMENTS]}>
                  <Appointments />
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
            
            {/* Reviews - requires doctor review read permission */}
            <Route 
              path="reviews" 
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.READ_DOCTOR_REVIEWS]}>
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
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default DoctorPage;
