import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<div className="App">Welcome to HealthyConnect</div>}
        />
        <Route path="/doctors" element={<div>Doctors List</div>} />
        <Route path="/patients" element={<div>Patients List</div>} />
        <Route path="/appointments" element={<div>Appointments</div>} />
        <Route path="/reviews" element={<div>Reviews</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
