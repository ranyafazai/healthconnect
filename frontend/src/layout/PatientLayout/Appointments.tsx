// No React default import required
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, AlertTriangle } from 'lucide-react';
import type { RootState } from '../../Redux/store';
import { fetchAppointmentsByPatient, updateAppointmentStatus, deleteAppointment, setPage } from '../../Redux/appointmentSlice/appointmentSlice';
import type { AppointmentStatus } from '../../types/data/appointment';

const Appointments: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { appointments, loading, page, limit, total } = useAppSelector((state: RootState) => state.appointment);
  
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [confirmCancel, setConfirmCancel] = useState<{ id: number } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  // Remove unused state to satisfy linter
  // const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (user?.patientProfile?.id) {
      dispatch(fetchAppointmentsByPatient(user.patientProfile.id));
    }
  }, [dispatch, user?.patientProfile?.id, page, limit]);

  const onPrevPage = () => {
    if (page && page > 1) dispatch(setPage(page - 1));
  };

  const onNextPage = () => {
    const totalPages = total && limit ? Math.ceil(total / limit) : 1;
    if (page && page < totalPages) dispatch(setPage(page + 1));
  };

  // Filter appointments for the current month
  const currentMonthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.getMonth() === currentDate.getMonth() && 
           aptDate.getFullYear() === currentDate.getFullYear();
  });

  // Compute today's appointments when needed in the future
  // const todayAppointments = appointments.filter(apt => new Date(apt.date).toDateString() === new Date().toDateString());

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
    setConfirmCancel({ id: appointmentId });
  };

  const confirmDelete = async () => {
    if (!confirmCancel) return;
    try {
      setIsCancelling(true);
      await dispatch(deleteAppointment(confirmCancel.id)).unwrap();
      setConfirmCancel(null);
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    } finally {
      setIsCancelling(false);
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
        <h2 className="text-xl font-semibold mb-4">Appointments</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading appointments...</div>
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500">No appointments found</p>
        ) : (
          <>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="text-gray-400" size={16} />
                        <span className="font-semibold">{new Date(appointment.date).toLocaleString()}</span>
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

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={onPrevPage}
                disabled={!page || page <= 1}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Previous
              </button>
              <div className="text-sm text-gray-600">
                Page {page || 1} of {total && limit ? Math.max(1, Math.ceil(total / limit)) : 1}
              </div>
              <button
                onClick={onNextPage}
                disabled={!total || !limit || !page || page >= Math.ceil((total || 0) / (limit || 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Elegant Confirm Cancel Modal */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isCancelling && setConfirmCancel(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel appointment?</h3>
              </div>
              <p className="text-sm text-gray-600">
                This action cannot be undone. The selected appointment will be permanently cancelled.
              </p>
            </div>
            <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setConfirmCancel(null)}
                disabled={isCancelling}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50"
              >
                Keep
              </button>
              <button
                onClick={confirmDelete}
                disabled={isCancelling}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling…' : 'Cancel appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
