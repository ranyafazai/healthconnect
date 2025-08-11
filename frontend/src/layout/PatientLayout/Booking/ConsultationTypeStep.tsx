import React, { useState } from 'react';
import FullLine from './FullLine';
import DoctorCard from './DoctorCard';
import { BookingSummary } from './BookingSummary';
import type { DoctorProfile } from '../../../types/data/doctor';
import type { ConsultationType } from '../../../types/data/appointment';

interface ConsultationTypeProps {
  onNext: () => void;
  onPrev: () => void;
  bookingData: {
    consultationType: 'TEXT' | 'VIDEO';
    [key: string]: any;
  };
  updateBookingData: (data: { consultationType?: 'TEXT' | 'VIDEO'; [key: string]: any }) => void;
  doctor?: DoctorProfile;
}

const ConsultationTypeStep: React.FC<ConsultationTypeProps> = ({ onNext, onPrev, bookingData, updateBookingData, doctor }) => {
  const [selectedType, setSelectedType] = useState<'TEXT' | 'VIDEO'>(bookingData.consultationType || 'VIDEO');

  const handleNext = () => {
    updateBookingData({ consultationType: selectedType });
    onNext();
  };

  return (
    <div>
      {/* Doctor Card at the top */}
      <DoctorCard doctor={doctor} />

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
        <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '10px', textAlign: 'center' }}>Book Your Appointment</h2>
        <FullLine currentStep={2} />
        
        <h3 style={{ 
          color: '#333', 
          fontSize: '20px', 
          marginBottom: '30px', 
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          Choose Consultation Type
        </h3>

        {/* Two-column layout */}
        <div style={{ 
          display: 'flex', 
          gap: '30px',
          alignItems: 'flex-start'
        }}>
          {/* Left column - Consultation Type Selection */}
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {/* Video Consultation Option */}
              <div 
                onClick={() => setSelectedType('VIDEO')}
                style={{
                  border: selectedType === 'VIDEO' ? '3px solid #008CBA' : '2px solid #E0E0E0',
                  borderRadius: '15px',
                  padding: '25px',
                  cursor: 'pointer',
                  backgroundColor: selectedType === 'VIDEO' ? '#F0F8FF' : '#FFFFFF',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  backgroundColor: selectedType === 'VIDEO' ? '#008CBA' : '#E0E0E0', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 15px auto',
                  transition: 'all 0.3s ease'
                }}>
                  <span style={{ color: '#FFFFFF', fontSize: '24px' }}>📹</span>
                </div>
                
                <h4 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#333', 
                  marginBottom: '10px'
                }}>
                  Video Call
                </h4>
                
                <p style={{ 
                  color: '#666', 
                  fontSize: '14px',
                  marginBottom: '15px'
                }}>
                  Face-to-face consultation via video
                </p>
                
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <li style={{ marginBottom: '8px' }}>• Real-time interaction</li>
                  <li style={{ marginBottom: '8px' }}>• Visual examination</li>
                  <li style={{ marginBottom: '8px' }}>• Screen sharing</li>
                  <li style={{ marginBottom: '8px' }}>• Personal connection</li>
                </ul>
              </div>

              {/* Text Chat Option */}
              <div 
                onClick={() => setSelectedType('TEXT')}
                style={{
                  border: selectedType === 'TEXT' ? '3px solid #008CBA' : '2px solid #E0E0E0',
                  borderRadius: '15px',
                  padding: '25px',
                  cursor: 'pointer',
                  backgroundColor: selectedType === 'TEXT' ? '#F0F8FF' : '#FFFFFF',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  backgroundColor: selectedType === 'TEXT' ? '#008CBA' : '#E0E0E0', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 15px auto',
                  transition: 'all 0.3s ease'
                }}>
                  <span style={{ color: '#FFFFFF', fontSize: '24px' }}>💬</span>
                </div>
                
                <h4 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#333', 
                  marginBottom: '10px',
                  textAlign: 'center'
                }}>
                  Text Chat
                </h4>
                
                <p style={{ 
                  color: '#666', 
                  fontSize: '14px',
                  marginBottom: '15px'
                }}>
                  Written consultation via secure messaging
                </p>
                
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <li style={{ marginBottom: '8px' }}>• Instant messaging</li>
                  <li style={{ marginBottom: '8px' }}>• Share photos/documents</li>
                  <li style={{ marginBottom: '8px' }}>• Chat history saved</li>
                  <li style={{ marginBottom: '8px' }}>• More privacy</li>
                </ul>
              </div>
            </div>

            {/* Important Information Box */}
            <div style={{ 
              backgroundColor: '#F8FCFF',
              border: '2px solid #008CBA',
              borderRadius: '10px',
              padding: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '15px',
              marginTop: '60px'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#008CBA', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '18px' }}>i</span>
              </div>
              
              <div>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  color: '#333', 
                  marginBottom: '10px',
                }}>
                  Important Information
                </h4>
                <p style={{ 
                  color: '#666', 
                  fontSize: '14px',
                  lineHeight: '1.5',
                  margin: 0,
                  
                }}>
                  Both consultation types include full medical assessment, prescription services, and follow-up care. 
                  You can switch between video and chat during your appointment if needed.
                </p>
              </div>
            </div>


          </div>

          {/* Right column - Booking Summary */}
          <div style={{ 
            flex: '0 0 auto',
            position: 'sticky',
            top: '10px'
          }}>
            <BookingSummary 
              onNext={handleNext}
              onPrev={onPrev}
              bookingData={bookingData}
              currentStep={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationTypeStep;