import { Route, Routes, Navigate } from "react-router-dom";
import { useAppSelector } from "../Redux/hooks";
import type { RootState } from "../Redux/store";
import NotFound from "./NotFound";
import { AllHero } from "../layout/LandingLayout/AllHero";
import { Navbar } from "../components/NavBar/NavBar";
import SignUp from "@/layout/LandingLayout/Auth/SignUp";
import SignIn from "@/layout/LandingLayout/Auth/SignIn";

function LandingPage() {
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);

  // If user is authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    if (user.role === 'DOCTOR') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else {
      return <Navigate to="/patient/dashboard" replace />;
    }
  }

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} />
      <Routes>
        <Route path="" element={<AllHero />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="about" element={<div>About Us</div>} />
        <Route path="contact" element={<div>Contact Us</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default LandingPage;
