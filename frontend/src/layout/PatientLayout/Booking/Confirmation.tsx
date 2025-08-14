import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../Redux/hooks";
import { createAppointment, fetchAppointmentsByPatient } from "../../../Redux/appointmentSlice/appointmentSlice";
import DoctorCard from "./DoctorCard";
import FullLine from "./FullLine";
// import { BookingSummary } from "./BookingSummary";
import type { DoctorProfile } from '../../../types/data/doctor';

// Prevent duplicate appointment creations within the same SPA session (tab)
const inMemoryInFlightKeys = new Set<string>();

interface ConfirmationProps {
  onPrev: () => void;
  bookingData: {
    date: string;
    time: string;
    consultationType: 'TEXT' | 'VIDEO';
    patientInfo: {
      reasonForVisit: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  doctor?: DoctorProfile;
}

export function Confirmation({ onPrev, bookingData, doctor }: ConfirmationProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { appointments } = useAppSelector((state) => state.appointment);
  const [isCreating, setIsCreating] = useState(false);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedCreation, setHasAttemptedCreation] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const isMountedRef = useRef(true);
  const creationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const creationStartedRef = useRef(false);

  // Check if we already created an appointment in this session
  const sessionKey = `appointment_${user?.id}_${doctor?.id}_${bookingData.date}_${bookingData.time}`;
  const hasCreatedInSession = sessionStorage.getItem(sessionKey);
  const inFlightKey = `${sessionKey}_inflight`;
  // Note: avoid reading in a variable to prevent linter warning; we read it on-demand in effects

  // Check if the appointment was actually created in the Redux store (robust time comparison)
  const createdAppointment = appointments.find(apt => {
    if (!doctor?.id) return false;
    if (apt.doctorId !== doctor.id) return false;
    if (apt.type !== bookingData.consultationType) return false;
    // Compare up to minutes to avoid timezone/seconds differences
    const targetPrefix = `${bookingData.date}T${bookingData.time}`; // e.g., 2025-08-15T10:00
    return typeof apt.date === 'string' && apt.date.startsWith(targetPrefix);
  });



  // Monitor if appointment was created in Redux store
  useEffect(() => {
    if (createdAppointment && !appointmentId && isCreating) {
      setAppointmentId(createdAppointment.id);
      setIsCreating(false);
    }
  }, [createdAppointment, appointmentId, isCreating]);

  // Ensure redirect even if appointment was already created in this session
  useEffect(() => {
    if (!isNavigating && (appointmentId || hasCreatedInSession || createdAppointment)) {
      setIsNavigating(true);
      const t = setTimeout(() => {
        try {
          navigate('/patient/dashboard');
          setTimeout(() => {
            if (window.location.pathname !== '/patient/dashboard') {
              window.location.href = '/patient/dashboard';
            }
          }, 100);
        } catch (_err) {
          window.location.href = '/patient/dashboard';
        }
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [appointmentId, hasCreatedInSession, createdAppointment, isNavigating, navigate]);

  // Fallback: If we have an appointment ID but still in creating state, force update
  useEffect(() => {
    if (appointmentId && isCreating) {
      setIsCreating(false);
    }
  }, [appointmentId, isCreating]);

  // Track mount/unmount only
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Timeout to prevent infinite loading (10 seconds) when creating
  useEffect(() => {
    if (!isCreating || appointmentId) return;
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current && isCreating && !appointmentId) {
        setIsCreating(false);
        setError('Appointment creation is taking longer than expected. Please check your dashboard or try again.');
      }
    }, 10000);
    creationTimeoutRef.current = timeoutId;
    return () => {
      if (creationTimeoutRef.current) {
        clearTimeout(creationTimeoutRef.current);
        creationTimeoutRef.current = null;
      }
    };
  }, [isCreating, appointmentId]);

  // Clean up session storage once appointment is successfully created
  useEffect(() => {
    if (appointmentId && !error) {
      sessionStorage.removeItem(sessionKey);
    }
  }, [appointmentId, error, sessionKey]);

  // If creation was already done in this session, exit creating state
  useEffect(() => {
    if (isCreating && hasCreatedInSession) {
      setIsCreating(false);
    }
  }, [isCreating, hasCreatedInSession]);

  // Auto-create appointment when component mounts / data ready (only once per session key)
  useEffect(() => {
    if (!bookingData || !doctor || !user) return;
    if (isCreating) return;
    if (!isMountedRef.current) return;
    // Read latest session flags inside the effect to avoid stale values under StrictMode
    const createdInSessionNow = sessionStorage.getItem(sessionKey);
    const inFlightNow = sessionStorage.getItem(inFlightKey);
    if (hasAttemptedCreation || createdInSessionNow || inFlightNow || createdAppointment) {
      // Already created earlier in this session; do not create again
      return;
    }
    if (creationStartedRef.current) return;
    if (inMemoryInFlightKeys.has(sessionKey)) return;
    inMemoryInFlightKeys.add(sessionKey);
    creationStartedRef.current = true;
    setHasAttemptedCreation(true);
    createAppointmentInBackend();
  }, [doctor?.id, user?.id, bookingData.date, bookingData.time, bookingData.consultationType]);

  const createAppointmentInBackend = async () => {
    if (!user?.id || !doctor?.id || !bookingData.date || !bookingData.time || !bookingData.consultationType || !bookingData.patientInfo) {
      setError('Missing required booking information');
      return;
    }

    // Prevent duplicate creation attempts
    if (isCreating || appointmentId) {
      return;
    }

    // Mark creation as in-flight to prevent duplicates from remounts/StrictMode
    try {
      sessionStorage.setItem(inFlightKey, 'true');
    } catch {}
    setIsCreating(true);
    setError(null);

    try {
      // Combine date and time into a proper datetime string
      const dateTimeString = `${bookingData.date}T${bookingData.time}:00`;
      
      const appointmentData = {
        doctorId: doctor.id,
        date: dateTimeString,
        type: bookingData.consultationType,
        reason: bookingData.patientInfo.reasonForVisit,
        notes: undefined
      };

      // Use Redux action instead of direct API call
      const result = await dispatch(createAppointment(appointmentData)).unwrap();
      
      if (isMountedRef.current) {
        // Support multiple possible payload shapes
        const payload: any = result;
        const appointment = payload?.data?.data ?? payload?.data ?? payload;
        if (!appointment || typeof appointment.id !== 'number') {
          throw new Error('Unexpected response from server while creating appointment');
        }
        setAppointmentId(appointment.id);
        
        // Mark this appointment as created in session storage to prevent duplicates
        try { sessionStorage.setItem(sessionKey, 'true'); } catch {}
        
        // Refresh the patient's appointments to show the new appointment
        if (user?.patientProfile?.id) {
          dispatch(fetchAppointmentsByPatient(user.patientProfile.id));
        }
        
        // Redirect to dashboard after successful creation
        setTimeout(() => {
          if (isMountedRef.current && !isNavigating) {
            setIsNavigating(true);
            try {
              navigate('/patient/dashboard');
              // Fallback: if navigate doesn't work, use window.location
              setTimeout(() => {
                if (window.location.pathname !== '/patient/dashboard') {
                  window.location.href = '/patient/dashboard';
                }
              }, 100);
            } catch (error) {
              console.error('Auto-navigation error:', error);
              window.location.href = '/patient/dashboard';
            }
          }
        }, 3000);
      }
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create appointment. Please try again.';
      setError(errorMessage);
      // Reset the flag on error so user can retry
      if (isMountedRef.current) {
        setHasAttemptedCreation(false);
      }
      creationStartedRef.current = false;
      try { inMemoryInFlightKeys.delete(sessionKey); } catch {}
    } finally {
      // Always set isCreating to false, regardless of mount status
      setIsCreating(false);
      // Clear in-flight flag
      try { sessionStorage.removeItem(inFlightKey); } catch {}
    }
  };

  const handleRetry = () => {
    if (isMountedRef.current) {
      setError(null);
      setHasAttemptedCreation(false);
      creationStartedRef.current = true;
      try { inMemoryInFlightKeys.add(sessionKey); } catch {}
      createAppointmentInBackend();
    }
  };

  const handleNavigateToDashboard = () => {
    console.log('Navigate to dashboard clicked');
    if (isMountedRef.current && !isNavigating) {
      setIsNavigating(true);
      // Force navigation with window.location as fallback
      try {
        navigate('/patient/dashboard');
        // Fallback: if navigate doesn't work, use window.location
        setTimeout(() => {
          if (window.location.pathname !== '/patient/dashboard') {
            window.location.href = '/patient/dashboard';
          }
        }, 100);
      } catch (error) {
        console.error('Navigation error:', error);
        window.location.href = '/patient/dashboard';
      }
    }
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DoctorCard doctor={doctor} />
        <div className="ml-5 mr-5 mx-auto px-6 pb-8">
          <div className="bg-white rounded-lg p-8" style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Creating Your Appointment</h1>
            </div>
            
            <div className="mb-8">
              <FullLine currentStep={4} />
            </div>

            <div className="flex flex-col items-center justify-center min-h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-6"></div>
              <p className="text-gray-600 text-center">Please wait while we create your appointment...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DoctorCard doctor={doctor} />
        <div className="ml-5 mr-5 mx-auto px-6 pb-8">
          <div className="bg-white rounded-lg p-8" style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Your Appointment</h1>
            </div>
            
            <div className="mb-8">
              <FullLine currentStep={4} />
            </div>

            <div className="flex flex-col items-center justify-center min-h-64">
              <div className="w-32 h-32 bg-red-500 rounded-full mb-6 flex items-center justify-center">
                <span className="text-white text-4xl">✗</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment Creation Failed</h2>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                {error}
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={handleRetry}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={onPrev}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorCard doctor={doctor} />
      <div className="ml-5 mr-5 mx-auto px-6 pb-8">
        <div className="bg-white rounded-lg p-8" style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Book Your Appointment</h1>
          </div>

          <div className="mb-8">
            <FullLine currentStep={4} />
          </div>

          {/* Content Area */}
          <div className="flex gap-8">
            <div className="flex-1 border-2 border-green-500 rounded-lg p-12 flex flex-col items-center justify-center min-h-64 bg-white">
              {/* Large Green Circle Placeholder */}
              <div className="w-32 h-32 bg-green-500 rounded-full mb-6 flex items-center justify-center">
                <span className="text-white text-4xl">✓</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment Confirmed!</h2>
              <p className="text-gray-600 text-center mb-6">
                Your appointment has been successfully booked. You will receive a confirmation email shortly.
                {appointmentId && (
                  <span className="block mt-2 text-sm text-gray-500">
                    Appointment ID: #{appointmentId}
                  </span>
                )}
              </p>
              
              {/* Booking Details */}
              <div className="bg-gray-50 p-6 rounded-lg w-full max-w-md">
                <h3 className="font-bold text-gray-800 mb-4">Booking Details:</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Date & Time:</strong> {new Date(bookingData.date).toLocaleDateString()} at {bookingData.time}</div>
                  <div><strong>Consultation Type:</strong> {bookingData.consultationType === 'VIDEO' ? 'Video Call' : 'Text Chat'}</div>
                  {bookingData.patientInfo?.fullName && (
                    <div><strong>Patient:</strong> {bookingData.patientInfo.fullName}</div>
                  )}
                  {doctor && (
                    <div><strong>Doctor:</strong> Dr. {doctor.firstName} {doctor.lastName}</div>
                  )}
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Redirecting to dashboard in 3 seconds...
                </p>
                <button
                  onClick={handleNavigateToDashboard}
                  disabled={isNavigating}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isNavigating 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isNavigating ? 'Redirecting...' : 'Go to Dashboard Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
