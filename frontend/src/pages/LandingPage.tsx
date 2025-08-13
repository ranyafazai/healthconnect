import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../Redux/hooks";
import type { RootState } from "../Redux/store";
import NotFound from "./NotFound";
import { AllHero } from "../layout/LandingLayout/AllHero";
import { Navbar } from "../components/NavBar/NavBar";
import SignUp from "@/layout/LandingLayout/Auth/SignUp";
import SignIn from "@/layout/LandingLayout/Auth/SignIn";
import { HowItWorks } from "../layout/LandingLayout/HowItWorks";
import { AboutUs } from "../layout/LandingLayout/AboutUs";

function LandingPage() {
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
  const location = useLocation();

  // If user is authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    if (user.role === 'DOCTOR') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else {
      return <Navigate to="/patient/dashboard" replace />;
    }
  }

  // Check the current path to determine what to render
  const currentPath = location.pathname;

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} />
      {currentPath === "/how-it-works" ? (
        <HowItWorks />
      ) : currentPath === "/about" ? (
        <AboutUs />
      ) : (
        <Routes>
          <Route path="" element={<AllHero />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="contact" element={<div>Contact Us</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </div>
  );
}

export default LandingPage;
