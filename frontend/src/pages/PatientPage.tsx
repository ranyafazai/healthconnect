import { Route, Routes } from "react-router-dom";
import Sidebar from "../layout/PatientLayout/Sidebar";
import Profile from "../layout/PatientLayout/Profile";
import Appointments from "../layout/PatientLayout/Appointments";
import PastConsultation from "../layout/PatientLayout/PastConsultation";
import Messages from "../layout/PatientLayout/Messages";
import Settings from "../layout/PatientLayout/Settings";
import Dashboard from "@/layout/doctorLayout/Dashboard";
import NotFound from "./NotFound";
import BookingProcess from "../layout/PatientLayout/BookingProces";


function PatientPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <Routes>
          <Route path="booking" element={<BookingProcess />} />
          <Route path="" element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="past-consultation" element={<PastConsultation />} />
          <Route path="messages" element={<Messages />} />

          <Route path="profile/*" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default PatientPage;
