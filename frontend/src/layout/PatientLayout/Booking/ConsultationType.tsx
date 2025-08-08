import React, { useState } from 'react';
import FullLine from './FullLine';
import DoctorCard from './DoctorCard';
import { BookingSummary } from './BookingSummary';

interface ConsultationTypeProps {
  onNext: () => void;
  onPrev: () => void;
  bookingData: any;
  updateBookingData: (data: any) => void;
}

const ConsultationType: React.FC<ConsultationTypeProps> = ({ onNext, onPrev, bookingData, updateBookingData }) => {
  const [selectedType, setSelectedType] = useState<'video' | 'chat'>(bookingData.consultationType || 'video');

  const handleNext = () => {
    updateBookingData({ consultationType: selectedType });
    onNext();
  };

  return (
    <div>
      {/* Doctor Card at the top */}
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
              display: 'flex', 
              gap: '20px', 
              justifyContent: 'center',
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
                             {/* Video Call Card */}
               <div 
                 onClick={() => setSelectedType('video')}
                 style={{ 
                   width: '300px',
                   padding: '25px',
                   backgroundColor: '#FFFFFF',
                   border: selectedType === 'video' ? '3px solid #008CBA' : '2px solid #E0E0E0',
                   borderRadius: '10px',
                   cursor: 'pointer',
                   transition: 'all 0.3s ease',
                   boxShadow: selectedType === 'video' ? '0 4px 8px rgba(69, 162, 158, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
                 }}
               >
                 <div style={{ 
                   width: '60px', 
                   height: '60px', 
                   backgroundColor: '#008CBA', 
                   borderRadius: '50%', 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center',
                   margin: '0 auto 15px auto'
                 }}>
                   <span style={{ fontSize: '24px', color: '#FFFFFF' }}>📹</span>
                 </div>
                
                <h4 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#333', 
                  textAlign: 'center',
                  marginBottom: '10px'
                }}>
                  Video Call
                </h4>
                
                <p style={{ 
                  color: '#666', 
                  textAlign: 'center',
                  marginBottom: '15px',
                  fontSize: '14px'
                }}>
                  Face-to-face consultation via secure video call
                </p>
                
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <li style={{ marginBottom: '8px' }}>• HD video quality</li>
                  <li style={{ marginBottom: '8px' }}>• Screen sharing available</li>
                  <li style={{ marginBottom: '8px' }}>• Record consultation</li>
                  <li style={{ marginBottom: '8px' }}>• Most popular option</li>
                </ul>
              </div>

              {/* Text Chat Card */}
              <div 
                onClick={() => setSelectedType('chat')}
                style={{ 
                  width: '300px',
                  padding: '25px',
                  backgroundColor: '#FFFFFF',
                  border: selectedType === 'chat' ? '3px solid #008CBA' : '2px solid #E0E0E0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedType === 'chat' ? '0 4px 8px rgba(0,123,255,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  backgroundColor: '#008CBA', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 15px auto'
                }}>
                  <span style={{ fontSize: '24px', color: '#FFFFFF' }}>💬</span>
                </div>
                
                <h4 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#333', 
                  textAlign: 'center',
                  marginBottom: '10px'
                }}>
                  Text Chat
                </h4>
                
                <p style={{ 
                  color: '#666', 
                  textAlign: 'center',
                  marginBottom: '15px',
                  fontSize: '14px'
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

export default ConsultationType;