import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../Redux/hooks';
import { fetchDoctors, getDoctorById } from '../../Redux/doctorSlice/doctorSlice';
import { Navbar } from '../../components/NavBar/NavBar';
import DateTime from './Booking/DateTime';
import ConsultationTypeStep from './Booking/ConsultationTypeStep';
import PatientInfo from './Booking/PatientInfo';
import { Confirmation } from './Booking/Confirmation';
// Removed unused import of DoctorProfile
import type { RootState } from '../../Redux/store';

interface BookingData {
  doctorId: string;
  date: string;
  time: string;
  consultationType: 'TEXT' | 'VIDEO';
  patientInfo: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    reasonForVisit: string;
    medicalHistory: string;
    agreeToTerms: boolean;
    agreeToReminders: boolean;
  };
}

function App() {
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
  const { doctors, loading } = useAppSelector((state: RootState) => state.doctor);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    doctorId: '',
    date: '',
    time: '',
    consultationType: 'VIDEO',
    patientInfo: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      reasonForVisit: '',
      medicalHistory: '',
      agreeToTerms: false,
      agreeToReminders: false
    }
  });

  const doctorId = searchParams.get('doctorId');

  useEffect(() => {
    if (doctorId) {
      dispatch(getDoctorById(parseInt(doctorId)));
      setBookingData(prev => ({ ...prev, doctorId }));
    }
  }, [doctorId, dispatch]);

  // Fetch all doctors when component mounts
  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  // Redirect if no doctor ID
  useEffect(() => {
    if (!doctorId) {
      navigate('/search');
    }
  }, [doctorId, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/signin');
    }
  }, [isAuthenticated, user, navigate]);

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

  const updateBookingData = useCallback((data: Partial<BookingData>) => {
    setBookingData({ ...bookingData, ...data });
  }, [bookingData]);

  // Helper reserved for future validation of steps
  // const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: // DateTime
        return bookingData.date && bookingData.time;
      case 2: // ConsultationType
        return bookingData.consultationType;
      case 3: // PatientInfo
        return (
          bookingData.patientInfo.fullName &&
          bookingData.patientInfo.email &&
          bookingData.patientInfo.phone &&
          bookingData.patientInfo.reasonForVisit &&
          bookingData.patientInfo.agreeToTerms
        );
      default:
        return true;
    }
  // };

  const renderCurrentStep = () => {
    const doctor = doctors.find(d => d.id === parseInt(doctorId || '0'));
    
    switch (currentStep) {
      case 1:
        return <DateTime onNext={nextStep} bookingData={bookingData} updateBookingData={updateBookingData} doctor={doctor} />;
      case 2:
        return <ConsultationTypeStep onNext={nextStep} onPrev={prevStep} bookingData={bookingData} updateBookingData={updateBookingData} doctor={doctor} />;
      case 3:
        return <PatientInfo onNext={nextStep} onPrev={prevStep} bookingData={bookingData} updateBookingData={updateBookingData} doctor={doctor} />;
      case 4:
        return <Confirmation onPrev={prevStep} bookingData={bookingData} doctor={doctor} />;
      default:
        return <DateTime onNext={nextStep} bookingData={bookingData} updateBookingData={updateBookingData} doctor={doctor} />;
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar isAuthenticated={isAuthenticated} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div>
        <Navbar isAuthenticated={isAuthenticated} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to book an appointment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} />
      <div>
        {renderCurrentStep()}
      </div>
    </div>
  )
}

export default App
