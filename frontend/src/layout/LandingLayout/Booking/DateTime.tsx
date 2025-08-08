import React, { useState } from 'react';
import DoctorCard from './DoctorCard';
import FullLine from './FullLine';
import { BookingSummary } from './BookingSummary';

interface DateTimeProps {
  onNext: () => void;
  bookingData: any;
  updateBookingData: (data: any) => void;
}

const DateTime: React.FC<DateTimeProps> = ({ onNext, bookingData, updateBookingData }) => {
  const [selectedDate, setSelectedDate] = useState(bookingData.date || 'Mon, Jan 15');
  const [selectedTime, setSelectedTime] = useState(bookingData.time || '9:00 AM');

  const dates = [
    'Mon, Jan 15', 'Tue, Jan 16', 'Wed, Jan 17', 'Thu, Jan 18',
    'Fri, Jan 19', 'Mon, Jan 22', 'Tue, Jan 23', 'Wed, Jan 24'
  ];

  const morningTimes = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'
  ];

  const afternoonTimes = [
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  const handleNext = () => {
    updateBookingData({ date: selectedDate, time: selectedTime });
    onNext();
  };

  // Update booking data immediately when date or time changes
  React.useEffect(() => {
    updateBookingData({ date: selectedDate, time: selectedTime });
  }, [selectedDate, selectedTime, updateBookingData]);

  return (
    <div>
      {/* Doctor Card at the top */}
      <DoctorCard />

      {/* Two-column layout */}
      <div style={{ 
        display: 'flex', 
        gap: '30px',
        alignItems: 'flex-start',
        marginTop: '30px',  
        marginLeft: '30px',
        marginRight: '30px'
      }}>
        {/* Left column - Date and Time Selection */}
        <div style={{ 
          flex: 1,
          fontFamily: 'Arial, sans-serif',
          padding: '20px',
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E0E0E0',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            color: '#333', 
            fontSize: '24px', 
            marginBottom: '10px', 
            textAlign: 'center' 
          }}>
            Select Date & Time
          </h2>
          
          <FullLine currentStep={1} />
          
          {/* Select Date Section */}
          <div style={{ marginBottom: '30px', marginTop: '30px' }}>
            <h2 style={{ 
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '20px'
            }}>
              Select Date
            </h2>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px'
            }}>
              {dates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    padding: '15px',
                    backgroundColor: selectedDate === date ? '#008CBA' : '#F8FCFF',
                    color: selectedDate === date ? '#FFFFFF' : '#333',
                    border: selectedDate === date ? '2px solid #008CBA' : '2px solid #E0E0E0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60px'
                  }}
                >
                  <div>{date.split(', ')[0]}</div>
                  <div>{date.split(', ')[1]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Available Times Section */}
          <div>
            <h2 style={{ 
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '20px'
            }}>
              Available Times
            </h2>

            {/* Morning Times */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ 
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#666',
                marginBottom: '15px'
              }}>
                Morning
              </h3>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '15px'
              }}>
                {morningTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    style={{
                      padding: '15px',
                      backgroundColor: selectedTime === time ? '#008CBA' : '#F8FCFF',
                      color: selectedTime === time ? '#FFFFFF' : '#333',
                      border: selectedTime === time ? '2px solid #008CBA' : '2px solid #E0E0E0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '50px'
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Afternoon Times */}
            <div>
              <h3 style={{ 
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#666',
                marginBottom: '15px'
              }}>
                Afternoon
              </h3>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '15px'
              }}>
                {afternoonTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    style={{
                      padding: '15px',
                      backgroundColor: selectedTime === time ? '#008CBA' : '#F8FCFF',
                      color: selectedTime === time ? '#FFFFFF' : '#333',
                      border: selectedTime === time ? '2px solid #008CBA' : '2px solid #E0E0E0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '50px'
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
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
            bookingData={bookingData}
            currentStep={1}
          />
        </div>
      </div>
    </div>
  );
};

export default DateTime;
