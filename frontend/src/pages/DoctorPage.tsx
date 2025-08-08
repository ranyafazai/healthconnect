import { Route, Routes } from 'react-router-dom'
import NotFound from './NotFound'
function DoctorPage() {
  return (
    <div>
        {/* SideBar */}
    <Routes>
        <Route path="" element={<div className="App">Dashboard</div>} />
        <Route path="appointments" element={<div>Appointments</div>} />
        <Route path="reviews" element={<div>Reviews</div>} />
        <Route path="messages" element={<div>Messages</div>} />
        <Route path="profile" element={<div>Profile </div>} />
        <Route path="*" element={<NotFound />} />

    </Routes>  
    </div>
)
}

export default DoctorPage