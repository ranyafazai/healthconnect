import { Route, Routes } from 'react-router-dom'
import NotFound from './NotFound'
import { AllHero } from '../layout/LandingLayout/AllHero'
import { Navbar } from '../components/NavBar/NavBar'
import SignUp from '@/layout/LandingLayout/Auth/SignUp'
import SignIn from '@/layout/LandingLayout/Auth/SignIn'

function LandingPage() {
  return (
    <div>
      <Navbar />
    <Routes>
        <Route path="" element={<AllHero />} />
        <Route path="login" element={<SignIn/>} />
        <Route path="register" element={<SignUp/>} />
        <Route path="about" element={<div>About Us</div>} />
        <Route path="contact" element={<div>Contact Us</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default LandingPage