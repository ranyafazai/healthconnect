import React, { useState } from 'react';
import { BookingSummary } from './BookingSummary';
import FullLine from './FullLine';
import DoctorCard from './DoctorCard';

interface PatientInfoProps {
  onNext: () => void;
  onPrev: () => void;
  bookingData: any;
  updateBookingData: (data: any) => void;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ onNext, onPrev, bookingData, updateBookingData }) => {
  const [patientData, setPatientData] = useState({
    fullName: bookingData.patientInfo?.fullName || '',
    email: bookingData.patientInfo?.email || '',
    phone: bookingData.patientInfo?.phone || '',
    dateOfBirth: bookingData.patientInfo?.dateOfBirth || '',
    reasonForVisit: bookingData.patientInfo?.reasonForVisit || '',
    medicalHistory: bookingData.patientInfo?.medicalHistory || '',
    agreeToTerms: bookingData.patientInfo?.agreeToTerms || false,
    agreeToReminders: bookingData.patientInfo?.agreeToReminders || false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    updateBookingData({ patientInfo: patientData });
    onNext();
  };

  return (
    <div>
      <DoctorCard />
      <div style={{ 
        border: '2px solid #F8FCFF', 
        borderRadius: '10px', 
        padding: '20px', 
        backgroundColor: '#FFFFFF', 
        marginTop: '30px', 
        width: '95%', 
        marginLeft: '30px',
        textAlign: 'left', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
        fontFamily: 'Arial, sans-serif' 
      }}>
        <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '10px' }}>Book Your Appointment</h2>
        <FullLine currentStep={3} />
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '2', minWidth: '300px', padding: '20px', backgroundColor: '#F9FAFB', borderRadius: '10px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>Patient Information</h3>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold', color: '#666' }}>Full Name *</label>
              <input 
                type="text" 
                placeholder="Enter your full name" 
                value={patientData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} 
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold', color: '#666' }}>Email Address *</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={patientData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} 
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold', color: '#666' }}>Phone Number *</label>
              <input 
                type="tel" 
                placeholder="Enter your phone number" 
                value={patientData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} 
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold', color: '#666' }}>Date of Birth</label>
              <input 
                type="date" 
                value={patientData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} 
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold', color: '#666' }}>Reason for Visit *</label>
              <textarea 
                placeholder="Enter reason for visit" 
                value={patientData.reasonForVisit}
                onChange={(e) => handleInputChange('reasonForVisit', e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', height: '60px', boxSizing: 'border-box' }} 
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold', color: '#666' }}>Medical History (Optional)</label>
              <textarea 
                placeholder="Enter your medical history" 
                value={patientData.medicalHistory}
                onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', height: '80px', boxSizing: 'border-box' }} 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="checkbox" 
                id="terms" 
                checked={patientData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
              />
              <label htmlFor="terms" style={{ marginLeft: '5px', color: '#666' }}>
                I agree to the Terms of Service and Privacy Policy
              </label>
              <br />
              <input 
                type="checkbox" 
                id="reminders" 
                checked={patientData.agreeToReminders}
                onChange={(e) => handleInputChange('agreeToReminders', e.target.checked)}
              />
              <label htmlFor="reminders" style={{ marginLeft: '5px', color: '#666' }}>
                Send me appointment reminders and health tips via email/SMS
              </label>
            </div>


          </div>
                      <BookingSummary 
              onNext={handleNext}
              onPrev={onPrev}
              bookingData={bookingData}
              currentStep={3}
            />
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;