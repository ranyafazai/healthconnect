import React from 'react';

interface BookingSummaryProps {
  onNext?: () => void;
  onPrev?: () => void;
  bookingData?: any;
  currentStep?: number;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({ onNext, onPrev, bookingData, currentStep }) => {
  const getButtonText = () => {
    switch (currentStep) {
      case 1:
        return "Continue to Consultation Type";
      case 2:
        return "Continue to Patient Info";
      case 3:
        return "Continue to Confirmation";
      case 4:
        return "Book Appointment";
      default:
        return "Continue";
    }
  };

  const isLastStep = currentStep === 4;
  const isFirstStep = currentStep === 1;

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '400px', 
      padding: '20px', 
      backgroundColor: '#FFFFFF', 
      borderRadius: '10px', 
      border: '1px solid #E0E0E0',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        color: '#333', 
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '15px' 
      }}>
        Booking Summary
      </h2>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '10px' 
      }}>
        <span style={{ color: '#6C757D' }}>Doctor:</span>
        <span style={{ color: '#333', fontWeight: 'bold' }}>Dr. Sarah Johnson</span>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '10px' 
      }}>
        <span style={{ color: '#6C757D' }}>Date:</span>
        <span style={{ color: '#333', fontWeight: 'bold' }}>
          {bookingData?.date || 'Mon, Jan 15'}
        </span>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '10px' 
      }}>
        <span style={{ color: '#6C757D' }}>Time:</span>
        <span style={{ color: '#333', fontWeight: 'bold' }}>
          {bookingData?.time || '9:00 AM'}
        </span>
      </div>
      
      {/* Only show Type field if not on step 1 (DateTime page) */}
      {currentStep !== 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '10px' 
        }}>
          <span style={{ color: '#6C757D' }}>Type:</span>
          <span style={{ color: '#333', fontWeight: 'bold' }}>
            {bookingData?.consultationType === 'video' ? 'Video Call' : 
            bookingData?.consultationType === 'chat' ? 'Text Chat' : 'Video Call'}
          </span>
        </div>
      )}
      
      {/* Only show Patient field if not on step 1 or 2 (DateTime and ConsultationType pages) */}
      {currentStep !== 1 && currentStep !== 2 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '10px' 
        }}>
          <span style={{ color: '#6C757D' }}>Patient:</span>
          <span style={{ color: '#333', fontWeight: 'bold' }}>
            {bookingData?.patientInfo?.fullName || 'Not specified'}
          </span>
        </div>
      )}
      
      <div style={{ 
        borderTop: '1px solid #E0E0E0',
        paddingTop: '15px',
        marginTop: '20px',
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '20px' 
      }}>
        <span style={{ color: '#6C757D' }}>Consultation Fee:</span>
        <span style={{ color: '#008CBA', fontWeight: 'bold', fontSize: '18px' }}>$150</span>
      </div>
      
      <div style={{ 
        backgroundColor: '#F8FCFF', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
          Contact Information
        </div>
        <div style={{ color: '#6C757D', fontSize: '14px' }}>
          <div style={{ marginBottom: '5px' }}>
            📞 Emergency: (559) 123-4567
          </div>
          <div style={{ marginBottom: '5px' }}>
            ✉️ Support: <span style={{ color: '#008CBA' }}>support@healthconn.com</span>
          </div>
          <div>
            ⏰ Available 24/7 for urgent care
          </div>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        gap: '10px',
        marginTop: '20px'
      }}>
        {!isFirstStep && (
          <button 
            onClick={onPrev}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #008CBA', 
              color: '#008CBA', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Back
          </button>
        )}
        <button 
          onClick={onNext}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: isLastStep ? '#28A745' : '#008CBA', 
            color: '#FFFFFF', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            flex: isFirstStep ? '1' : 'auto'
          }}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};