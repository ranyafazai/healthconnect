import { Route, Routes } from 'react-router-dom'
import NotFound from './NotFound'
import { AllHero } from '../layout/LandingLayout/AllHero'
import { Navbar } from '../components/NavBar/NavBar'

function LandingPage() {
  return (
    <div>
      <Navbar />
    <Routes>
        <Route path="" element={<AllHero />} />
        <Route path="login" element={<div>Login</div>} />
        <Route path="register" element={<div>Register</div>} />
        <Route path="about" element={<div>About Us</div>} />
        <Route path="contact" element={<div>Contact Us</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default LandingPage