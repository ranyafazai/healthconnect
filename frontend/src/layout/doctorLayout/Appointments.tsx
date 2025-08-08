import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const Appointments: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 7, 6)); 
  
  
  const todayAppointments: Appointment[] = [
    {
      id: '1',
      patientName: 'John Smith',
      time: '09:30 AM',
      type: 'Follow-up',
      status: 'confirmed'
    },
    {
      id: '2',
      patientName: 'Emily Johnson',
      time: '11:15 AM',
      type: 'New Patient',
      status: 'confirmed'
    },
    {
      id: '3',
      patientName: 'Michael Brown',
      time: '02:45 PM',
      type: 'Consultation',
      status: 'pending'
    }
  ];

 
  const renderCalendarDays = () => {
    const year = 2025;
    const month = 7;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    
    for (let i = 0; i < startingDay; i++) {
      days.push(<td key={`empty-${i}`} className="p-2"></td>);
    }

   
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === currentDate.getDate() && month === currentDate.getMonth();
      days.push(
        <td 
          key={`day-${day}`} 
          className={`p-2 text-center ${isToday ? 'bg-cyan-100 rounded-full' : ''}`}
        >
          {day}
        </td>
      );
    }

    
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(
        <tr key={`week-${i}`}>
          {days.slice(i, i + 7)}
        </tr>
      );
    }

    
    while (weeks.length < 6) {
      weeks.push(
        <tr key={`empty-week-${weeks.length}`}>
          {Array(7).fill(0).map((_, i) => (
            <td key={`empty-day-${weeks.length}-${i}`} className="p-2"></td>
          ))}
        </tr>
      );
    }

    return weeks;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Appointment Management</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{formatDate(currentDate)}</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">August 2025</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => changeMonth(1)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <table className="w-full">
          <thead>
            <tr>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <th key={day} className="p-2 text-center text-gray-500 font-medium">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderCalendarDays()}
          </tbody>
        </table>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
        
        {todayAppointments.length === 0 ? (
          <p className="text-gray-500">No appointments scheduled for today</p>
        ) : (
          <div className="space-y-4">
            {todayAppointments.map(appointment => (
              <div 
                key={appointment.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{appointment.patientName}</h3>
                    <p className="text-gray-600">{appointment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{appointment.time}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;