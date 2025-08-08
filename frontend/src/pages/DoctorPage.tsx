import { Route, Routes } from 'react-router-dom'
import NotFound from './NotFound'
import Sidebar from "../layout/doctorLayout/Sidebar";
import Dashboard from "../layout/doctorLayout/Dashboard";
 import Appointments from "../layout/doctorLayout/Appointments";
// import Messages from "./Messages";
 import Reviews from "../layout/doctorLayout/Reviews";
import Profile from "../layout/doctorLayout/Profile";

function DoctorPage() {
  return (

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="" element={<Dashboard />} />
             <Route path="appointments" element={<Appointments />} />
             {/* <Route path="messages" element={<Messages />} /> */}
            <Route path="reviews" element={<Reviews />} />
             <Route path="profile/*" element={<Profile />} /> 

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
   
)
}

export default DoctorPage