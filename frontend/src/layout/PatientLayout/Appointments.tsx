import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone } from 'lucide-react';
import type { RootState, AppDispatch } from '../../Redux/store';
import { fetchAppointmentsByPatient, updateAppointmentStatus, deleteAppointment } from '../../Redux/appointmentSlice/appointmentSlice';
import type { Appointment, AppointmentStatus } from '../../types/data/appointment';

const Appointments: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { appointments, loading } = useAppSelector((state: RootState) => state.appointment);
  
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (user?.patientProfile?.id) {
      console.log('Fetching appointments for patient ID:', user.patientProfile.id);
      dispatch(fetchAppointmentsByPatient(user.patientProfile.id));
    }
  }, [dispatch, user?.patientProfile?.id]);

  // Filter appointments for the current month
  const currentMonthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.getMonth() === currentDate.getMonth() && 
           aptDate.getFullYear() === currentDate.getFullYear();
  });

  // Get today's appointments
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<td key={`empty-${i}`} className="p-2"></td>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === new Date().getDate() && month === new Date().getMonth();
      const hasAppointment = currentMonthAppointments.some(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getDate() === day;
      });
      
      days.push(
        <td 
          key={`day-${day}`} 
          className={`p-2 text-center cursor-pointer hover:bg-gray-100 ${
            isToday ? 'bg-cyan-100 rounded-full' : ''
          } ${hasAppointment ? 'font-bold text-blue-600' : ''}`}
        >
          {day}
        </td>
      );
    }

    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(
        <tr key={`week-${i}`}>
          {days.slice(i, i + 7)}
        </tr>
      );
    }

    // Add empty weeks to fill the calendar
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

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const handleStatusUpdate = async (appointmentId: number, newStatus: AppointmentStatus) => {
    try {
      await dispatch(updateAppointmentStatus({ id: appointmentId, status: newStatus })).unwrap();
      
      // Refresh the patient's appointments to show the updated appointment
      if (user?.patientProfile?.id) {
        dispatch(fetchAppointmentsByPatient(user.patientProfile.id));
      }
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await dispatch(deleteAppointment(appointmentId)).unwrap();
      } catch (error) {
        console.error('Failed to delete appointment:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{formatDate(currentDate)}</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
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
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading appointments...</div>
          </div>
        ) : todayAppointments.length === 0 ? (
          <p className="text-gray-500">No appointments scheduled for today</p>
        ) : (
          <div className="space-y-4">
            {todayAppointments.map(appointment => (
              <div 
                key={appointment.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="text-gray-400" size={16} />
                      <span className="font-semibold">Appointment #{appointment.id}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="text-gray-400" size={16} />
                      <span className="text-gray-600">{formatTime(String(appointment.date))}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="text-gray-400" size={16} />
                      <span className="text-gray-600">Doctor #{appointment.doctorId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Type: {appointment.type}</span>
                    </div>
                    {appointment.reason && (
                      <p className="text-gray-600 mt-2 text-sm">Reason: {appointment.reason}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <div className="mt-2 space-y-1">
                      {appointment.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, 'CONFIRMED')}
                            className="block w-full text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            className="block w-full text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="block w-full text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
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