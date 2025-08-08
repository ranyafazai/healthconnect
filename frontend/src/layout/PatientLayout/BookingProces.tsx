import { useState } from 'react'
import React from "react";
import { Navbar } from '../../components/NavBar/NavBar'
import DoctorCard from './Booking/DoctorCard'
import PatientInfo from './Booking/PatientInfo'
import ConsultationType from './Booking/ConsultationType'
import DateTime from './Booking/DateTime'
import { Confirmation } from './Booking/Confirmation'
import { AllHero } from '../LandingLayout/AllHero'


function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    consultationType: '',
    patientInfo: {}
  });

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateBookingData = (data: any) => {
    setBookingData({ ...bookingData, ...data });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <DateTime onNext={nextStep} bookingData={bookingData} updateBookingData={updateBookingData} />;
      case 2:
        return <ConsultationType onNext={nextStep} onPrev={prevStep} bookingData={bookingData} updateBookingData={updateBookingData} />;
      case 3:
        return <PatientInfo onNext={nextStep} onPrev={prevStep} bookingData={bookingData} updateBookingData={updateBookingData} />;
      case 4:
        return <Confirmation onPrev={prevStep} bookingData={bookingData} />;
      default:
        return <DateTime onNext={nextStep} bookingData={bookingData} updateBookingData={updateBookingData} />;
    }
  };

  return (
    <div>
      <Navbar />
      <div>
        {renderCurrentStep()}
      </div>
    </div>
  )
}

export default App
