import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PatientPage from "./pages/PatientPage";
import DoctorPage from "./pages/DoctorPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
function App() {
  return (
    <BrowserRouter>
    {/* NavBar component can be added here if needed */}
      <Routes>        
        <Route path="/" element={<LandingPage />} />
        <Route path="/patient/*" element={<PatientPage />} />
        <Route path="/doctor" element={<DoctorPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
