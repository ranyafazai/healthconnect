// No React default import required
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../Redux/hooks';
import { BookingSummary } from './BookingSummary';
import FullLine from './FullLine';
import DoctorCard from './DoctorCard';
import type { DoctorProfile } from '../../../types/data/doctor';

interface PatientInfoProps {
  onNext: () => void;
  onPrev: () => void;
  bookingData: {
    patientInfo?: {
      fullName: string;
      email: string;
      phone: string;
      dateOfBirth: string;
      reasonForVisit: string;
      medicalHistory: string;
      agreeToTerms: boolean;
      agreeToReminders: boolean;
    };
    [key: string]: any;
  };
  updateBookingData: (data: { patientInfo?: any; [key: string]: any }) => void;
  doctor?: DoctorProfile;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ onNext, onPrev, bookingData, updateBookingData, doctor }) => {
  const { user } = useAppSelector((state) => state.auth);
  
  const [patientData, setPatientData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    reasonForVisit: '',
    medicalHistory: '',
    agreeToTerms: false,
    agreeToReminders: false
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Pre-fill with authenticated user data
  useEffect(() => {
    if (user) {
      setPatientData(prev => ({
        ...prev,
        fullName: user.patientProfile?.firstName && user.patientProfile?.lastName ? `${user.patientProfile.firstName} ${user.patientProfile.lastName}` : '',
        email: user.email || '',
        phone: user.patientProfile?.phoneNumber || ''
      }));
    }
  }, [user]);

  // Update booking data when patient data changes
  useEffect(() => {
    if (patientData.fullName || patientData.email || patientData.phone) {
      updateBookingData({ patientInfo: patientData });
    }
  }, [patientData]); // Remove updateBookingData from dependencies

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!patientData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!patientData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!patientData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!patientData.reasonForVisit.trim()) {
      newErrors.reasonForVisit = 'Reason for visit is required';
    }

    if (!patientData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms of service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      updateBookingData({ patientInfo: patientData });
      onNext();
    }
  };

  const getInputStyle = (fieldName: string) => ({
    width: '100%',
    padding: '14px 16px',
    marginTop: '8px',
    border: errors[fieldName] ? '2px solid #EF4444' : '2px solid #E5E7EB',
    borderRadius: '12px',
    boxSizing: 'border-box' as const,
    backgroundColor: errors[fieldName] ? '#FEF2F2' : '#FFFFFF',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    outline: 'none',
    fontFamily: 'Arial, sans-serif'
  });

  const getLabelStyle = (fieldName: string) => ({
    fontWeight: '600',
    color: errors[fieldName] ? '#DC2626' : '#374151',
    fontSize: '15px',
    marginBottom: '6px',
    display: 'block'
  });

  return (
    <div>
      <DoctorCard doctor={doctor} />
      <div style={{ 
        border: '2px solid #F8FCFF', 
        borderRadius: '20px', 
        padding: '30px', 
        backgroundColor: '#FFFFFF', 
        marginTop: '30px', 
        width: '95%', 
        marginLeft: '30px',
        textAlign: 'left', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)', 
        fontFamily: 'Arial, sans-serif' 
      }}>
        <h2 style={{ 
          color: '#1E3A8A', 
          fontSize: '28px', 
          marginBottom: '15px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>Book Your Appointment</h2>
        <FullLine currentStep={3} />
        
        <h3 style={{ 
          color: '#1E3A8A', 
          fontSize: '24px', 
          marginBottom: '30px', 
          textAlign: 'center',
          fontWeight: '600'
        }}>
          Patient Information
        </h3>

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {/* Left column - Patient Information Form */}
          <div style={{ 
            flex: '2', 
            minWidth: '500px', 
            padding: '30px', 
            backgroundColor: '#F8FAFC', 
            borderRadius: '16px', 
            marginBottom: '20px',
            border: '1px solid #E2E8F0'
          }}>
            
            {/* Personal Information Section */}
            <div style={{ marginBottom: '35px' }}>
              <h4 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '20px', 
                color: '#1E3A8A',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ 
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: '#3B82F6', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '16px'
                }}>👤</span>
                Personal Information
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={getLabelStyle('fullName')}>Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={patientData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    style={getInputStyle('fullName')}
                  />
                  {errors.fullName && (
                    <div style={{ color: '#DC2626', fontSize: '13px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⚠️</span> {errors.fullName}
                    </div>
                  )}
                </div>

                <div>
                  <label style={getLabelStyle('email')}>Email Address *</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={patientData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={getInputStyle('email')}
                  />
                  {errors.email && (
                    <div style={{ color: '#DC2626', fontSize: '13px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⚠️</span> {errors.email}
                    </div>
                  )}
                </div>

                <div>
                  <label style={getLabelStyle('phone')}>Phone Number *</label>
                  <input 
                    type="tel" 
                    placeholder="Enter your phone number" 
                    value={patientData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    style={getInputStyle('phone')}
                  />
                  {errors.phone && (
                    <div style={{ color: '#DC2626', fontSize: '13px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⚠️</span> {errors.phone}
                    </div>
                  )}
                </div>

                <div>
                  <label style={getLabelStyle('dateOfBirth')}>Date of Birth</label>
                  <input 
                    type="date" 
                    value={patientData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    style={getInputStyle('dateOfBirth')}
                  />
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div style={{ marginBottom: '35px' }}>
              <h4 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '20px', 
                color: '#1E3A8A',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ 
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: '#10B981', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '16px'
                }}>🏥</span>
                Medical Information
              </h4>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={getLabelStyle('reasonForVisit')}>Reason for Visit *</label>
                <textarea 
                  placeholder="Please describe your symptoms or reason for consultation" 
                  value={patientData.reasonForVisit}
                  onChange={(e) => handleInputChange('reasonForVisit', e.target.value)}
                  style={{ 
                    ...getInputStyle('reasonForVisit'), 
                    height: '100px', 
                    resize: 'vertical',
                    lineHeight: '1.5'
                  }}
                />
                {errors.reasonForVisit && (
                  <div style={{ color: '#DC2626', fontSize: '13px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚠️</span> {errors.reasonForVisit}
                  </div>
                )}
              </div>

              <div>
                <label style={getLabelStyle('medicalHistory')}>Medical History (Optional)</label>
                <textarea 
                  placeholder="Any relevant medical history, allergies, or current medications" 
                  value={patientData.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  style={{ 
                    ...getInputStyle('medicalHistory'), 
                    height: '120px', 
                    resize: 'vertical',
                    lineHeight: '1.5'
                  }}
                />
              </div>
            </div>

            {/* Terms and Conditions Section */}
            <div style={{ 
              backgroundColor: '#F0F9FF',
              padding: '25px',
              borderRadius: '12px',
              border: '1px solid #BAE6FD'
            }}>
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '20px', 
                color: '#1E3A8A',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ 
                  width: '28px', 
                  height: '28px', 
                  backgroundColor: '#8B5CF6', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '14px'
                }}>📋</span>
                Terms & Preferences
              </h4>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={patientData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    style={{ 
                      marginTop: '2px',
                      width: '18px',
                      height: '18px',
                      accentColor: '#3B82F6'
                    }}
                  />
                  <label htmlFor="terms" style={{ color: '#374151', fontSize: '15px', lineHeight: '1.4' }}>
                    I agree to the <a href="/terms" style={{ color: '#3B82F6', textDecoration: 'underline', fontWeight: '600' }}>Terms of Service</a> and <a href="/privacy" style={{ color: '#3B82F6', textDecoration: 'underline', fontWeight: '600' }}>Privacy Policy</a> *
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <div style={{ color: '#DC2626', fontSize: '13px', marginTop: '8px', marginLeft: '30px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚠️</span> {errors.agreeToTerms}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  id="reminders" 
                  checked={patientData.agreeToReminders}
                  onChange={(e) => handleInputChange('agreeToReminders', e.target.checked)}
                  style={{ 
                    marginTop: '2px',
                    width: '18px',
                    height: '18px',
                    accentColor: '#10B981'
                  }}
                />
                <label htmlFor="reminders" style={{ color: '#374151', fontSize: '15px', lineHeight: '1.4' }}>
                  Send me appointment reminders and health tips via email/SMS
                </label>
              </div>
            </div>

          </div>
          
          {/* Right column - Booking Summary */}
          <div style={{ 
            flex: '0 0 auto',
            position: 'sticky',
            top: '20px'
          }}>
            <BookingSummary 
              onNext={handleNext}
              onPrev={onPrev}
              bookingData={bookingData}
              currentStep={3}
              doctor={doctor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;