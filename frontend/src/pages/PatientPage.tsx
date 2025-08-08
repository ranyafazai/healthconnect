import React from 'react'
import { Route, Routes } from 'react-router-dom'
import NotFound from './NotFound'

function PatientPage() {
  return (
    <div>
        {/* SideBar */}
    <Routes>
        <Route path="" element={<div className="App">Dashboard</div>} />
        <Route path="appointments" element={<div>Appointments</div>} />
        <Route path="past-consultation" element={<div>Past consultation</div>} />
        <Route path="messages" element={<div>Messages</div>} />
        <Route path="profile" element={<div>Profile </div>} />
        <Route path="settings" element={<div>Settings </div>} />
        <Route path="*" element={<NotFound />} />

    </Routes>  
    </div>
  )
}

export default PatientPage