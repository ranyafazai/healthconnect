import React from 'react';
import type { DoctorProfile } from '../../../types/data/doctor';

interface BookingSummaryProps {
  onNext?: () => void;
  onPrev?: () => void;
  bookingData?: {
    date?: string;
    time?: string;
    consultationType?: 'TEXT' | 'VIDEO';
    patientInfo?: {
      fullName?: string;
      email?: string;
      phone?: string;
      reasonForVisit?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  currentStep: number;
  doctor?: DoctorProfile;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({ onNext, onPrev, bookingData, currentStep, doctor }) => {
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

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not selected';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Format time for display
  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Not selected';
    return timeString;
  };

  // Get consultation type display text
  const getConsultationTypeText = (type?: string) => {
    if (!type) return 'Not selected';
    return type === 'VIDEO' ? 'Video Call' : 'Text Chat';
  };

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '400px', 
      padding: '25px', 
      backgroundColor: '#FFFFFF', 
      borderRadius: '15px', 
      border: '2px solid #E8F4FD',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: '20px'
    }}>
      <h2 style={{ 
        color: '#1E3A8A', 
        fontSize: '22px',
        fontWeight: 'bold',
        marginBottom: '20px',
        textAlign: 'center',
        borderBottom: '2px solid #E8F4FD',
        paddingBottom: '15px'
      }}>
        📋 Booking Summary
      </h2>
      
      {/* Doctor Information */}
      {doctor && (
        <div style={{ 
          backgroundColor: '#F0F9FF',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid #BAE6FD'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '10px' 
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#3B82F6', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <span style={{ color: '#FFFFFF', fontSize: '18px' }}>👨‍⚕️</span>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#1E3A8A' }}>
                Dr. {doctor.firstName} {doctor.lastName}
              </div>
              <div style={{ color: '#64748B', fontSize: '14px' }}>
                {doctor.specialization}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Booking Details */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          color: '#374151', 
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '15px',
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: '8px'
        }}>
          Appointment Details
        </h3>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '12px',
          padding: '8px 0'
        }}>
          <span style={{ color: '#6B7280', display: 'flex', alignItems: 'center' }}>
            📅 Date:
          </span>
          <span style={{ color: '#111827', fontWeight: '600' }}>
            {formatDate(bookingData?.date)}
          </span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '12px',
          padding: '8px 0'
        }}>
          <span style={{ color: '#6B7280', display: 'flex', alignItems: 'center' }}>
            ⏰ Time:
          </span>
          <span style={{ color: '#111827', fontWeight: '600' }}>
            {formatTime(bookingData?.time)}
          </span>
        </div>
        
        {/* Only show Type field if not on step 1 (DateTime page) */}
        {currentStep !== 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '12px',
            padding: '8px 0'
          }}>
            <span style={{ color: '#6B7280', display: 'flex', alignItems: 'center' }}>
              🎥 Type:
            </span>
            <span style={{ color: '#111827', fontWeight: '600' }}>
              {getConsultationTypeText(bookingData?.consultationType)}
            </span>
          </div>
        )}
        
        {/* Only show Patient field if not on step 1 or 2 */}
        {currentStep !== 1 && currentStep !== 2 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '12px',
            padding: '8px 0'
          }}>
            <span style={{ color: '#6B7280', display: 'flex', alignItems: 'center' }}>
              👤 Patient:
            </span>
            <span style={{ color: '#111827', fontWeight: '600' }}>
              {bookingData?.patientInfo?.fullName || 'Not specified'}
            </span>
          </div>
        )}
      </div>
      
      {/* Pricing */}
      <div style={{ 
        backgroundColor: '#FEF3C7',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #F59E0B'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <span style={{ color: '#92400E', fontWeight: '600' }}>Consultation Fee:</span>
          <span style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '20px' }}>
            $150
          </span>
        </div>
        <div style={{ 
          color: '#92400E', 
          fontSize: '12px', 
          marginTop: '5px',
          fontStyle: 'italic'
        }}>
          *Payment will be processed after appointment confirmation
        </div>
      </div>
      
      {/* Contact Information */}
      <div style={{ 
        backgroundColor: '#F0FDF4', 
        padding: '15px', 
        borderRadius: '10px', 
        marginBottom: '25px',
        border: '1px solid #86EFAC'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '12px', 
          color: '#166534',
          display: 'flex',
          alignItems: 'center'
        }}>
          📞 Contact Information
        </div>
        <div style={{ color: '#166534', fontSize: '13px' }}>
          <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>🚨</span>
            Emergency: (559) 123-4567
          </div>
          <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>✉️</span>
            Support: <span style={{ color: '#059669', textDecoration: 'underline' }}>support@healthconn.com</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>⏰</span>
            Available 24/7 for urgent care
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        gap: '12px',
        marginTop: '20px'
      }}>
        {!isFirstStep && (
          <button 
            onClick={onPrev}
            style={{ 
              padding: '12px 20px', 
              backgroundColor: '#FFFFFF', 
              border: '2px solid #3B82F6', 
              color: '#3B82F6', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              flex: '1'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#F0F9FF';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ← Back
          </button>
        )}
        <button 
          onClick={onNext}
          style={{ 
            padding: '12px 20px', 
            backgroundColor: isLastStep ? '#10B981' : '#3B82F6', 
            color: '#FFFFFF', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            flex: isFirstStep ? '1' : 'auto',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};