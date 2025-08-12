// No React default import required
import { useEffect, useState } from 'react';
import DoctorCard from './DoctorCard';
import FullLine from './FullLine';
import { BookingSummary } from './BookingSummary';
import type { DoctorProfile } from '../../../types/data/doctor';
import { getDoctorAvailability } from '../../../Api/doctor.api';

interface DateTimeProps {
  onNext: () => void;
  bookingData: {
    date: string;
    time: string;
    [key: string]: any;
  };
  updateBookingData: (data: { date?: string; time?: string; [key: string]: any }) => void;
  doctor?: DoctorProfile;
}

const DateTime: React.FC<DateTimeProps> = ({ onNext, bookingData, updateBookingData, doctor }) => {
  const [selectedDate, setSelectedDate] = useState(bookingData.date || '');
  const [selectedTime, setSelectedTime] = useState(bookingData.time || '');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate next 30 days with proper formatting
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push({
          value: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    return dates;
  };

  const dates = generateAvailableDates();

  // Generate time slots (9 AM to 5 PM with 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      if (hour === 17) {
        slots.push(`${hour}:00`);
      } else {
        slots.push(`${hour}:00`);
        slots.push(`${hour}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Fetch doctor availability when date changes
  useEffect(() => {
    if (selectedDate && doctor?.id) {
      fetchDoctorAvailability();
    }
  }, [selectedDate, doctor?.id]);

  const fetchDoctorAvailability = async () => {
    if (!doctor?.id || !selectedDate) return;
    
    setLoading(true);
    setError(null);
    try {
      // This would call your backend API to get real availability
      // For now, we'll simulate it
      const response = await getDoctorAvailability(doctor.id, selectedDate);
      setAvailableSlots(response.data.data.availableSlots || timeSlots);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setError('Failed to load availability. Showing default time slots.');
      // Fallback to all time slots if API fails
      setAvailableSlots(timeSlots);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }
    updateBookingData({ date: selectedDate, time: selectedTime });
    onNext();
  };

  // Update booking data immediately when date or time changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      updateBookingData({ date: selectedDate, time: selectedTime });
    }
  }, [selectedDate, selectedTime]); // Remove updateBookingData from dependencies

  return (
    <div>
      {/* Doctor Card at the top */}
      <DoctorCard doctor={doctor} />

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
          {error && (
            <div style={{
              marginTop: '10px',
              marginBottom: '10px',
              border: '1px solid #fecaca',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
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
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px'
            }}>
              {dates.map((date) => (
                <button
                  key={date.value}
                  onClick={() => setSelectedDate(date.value)}
                  style={{
                    padding: '15px',
                    backgroundColor: selectedDate === date.value ? '#008CBA' : '#F8FCFF',
                    color: selectedDate === date.value ? '#FFFFFF' : '#333',
                    border: selectedDate === date.value ? '2px solid #008CBA' : '2px solid #E0E0E0',
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
                  <div>{date.display.split(', ')[0]}</div>
                  <div>{date.display.split(', ').slice(1).join(', ')}</div>
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
              {loading && (
                <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="loader" style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid #bae6fd',
                    borderTopColor: '#0284c7',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Loading...
                </span>
              )}
            </h2>

            {selectedDate ? (
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px'
              }}>
                {availableSlots.map((time) => (
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
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666',
                backgroundColor: '#F8FCFF',
                borderRadius: '8px'
              }}>
                Please select a date to see available time slots
              </div>
            )}
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
