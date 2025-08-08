import { Route, Routes } from 'react-router-dom'

function LandingPage() {
  return (
    <Routes>
        <Route path="" element={<div className="App">Welcome to HealthyConnect</div>} />
        <Route path="login" element={<div>Login</div>} />
        <Route path="register" element={<div>Register</div>} />
        <Route path="about" element={<div>About Us</div>} />
        <Route path="contact" element={<div>Contact Us</div>} />
    </Routes>
  )
}

export default LandingPage