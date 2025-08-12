// No React default import required
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone, Filter, Search, Eye, Edit, Trash2, RefreshCw, TrendingUp, AlertCircle, CheckCircle, MapPin, Stethoscope } from 'lucide-react';
import type { RootState } from '../../Redux/store';
import { fetchAppointmentsByDoctor, updateAppointmentStatus, deleteAppointment } from '../../Redux/appointmentSlice/appointmentSlice';
import type { Appointment, AppointmentStatus } from '../../types/data/appointment';

const Appointments: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { appointments, loading } = useAppSelector((state: RootState) => state.appointment);
  
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (user?.doctorProfile?.id) {
      dispatch(fetchAppointmentsByDoctor(user.doctorProfile.id));
    }
  }, [dispatch, user?.doctorProfile?.id]);

  // Filter appointments based on search and status
  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesSearch = !searchTerm || 
      apt.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Calculate appointment statistics
  const appointmentStats = {
    total: filteredAppointments.length,
    pending: filteredAppointments.filter(apt => apt.status === 'PENDING').length,
    confirmed: filteredAppointments.filter(apt => apt.status === 'CONFIRMED').length,
    completed: filteredAppointments.filter(apt => apt.status === 'COMPLETED').length,
    cancelled: filteredAppointments.filter(apt => apt.status === 'CANCELLED').length,
    today: filteredAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const today = new Date();
      return aptDate.toDateString() === today.toDateString();
    }).length,
    upcoming: filteredAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return aptDate >= today && aptDate <= nextWeek;
    }).length
  };

  // Filter appointments for the current month
  const currentMonthAppointments = filteredAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.getMonth() === currentDate.getMonth() && 
           aptDate.getFullYear() === currentDate.getFullYear();
  });

  // Get today's appointments
  const todayAppointments = filteredAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  // Get upcoming appointments (next 7 days)
  const upcomingAppointments = filteredAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return aptDate >= today && aptDate <= nextWeek;
  });

  const handleRefresh = () => {
    if (user?.doctorProfile?.id) {
      dispatch(fetchAppointmentsByDoctor(user.doctorProfile.id));
    }
  };

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
      days.push(<td key={`empty-${i}`} className="p-1 md:p-2"></td>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === new Date().getDate() && month === new Date().getMonth();
      const dayAppointments = currentMonthAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getDate() === day;
      });
      
      days.push(
        <td 
          key={`day-${day}`} 
          className={`p-1 md:p-2 text-center cursor-pointer hover:bg-cyan-50 transition-colors relative min-h-[60px] md:min-h-[80px] ${
            isToday ? 'bg-cyan-100 rounded-lg' : ''
          }`}
          onClick={() => {
            const clickedDate = new Date(year, month, day);
            setCurrentDate(clickedDate);
            setViewMode('list');
          }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <span className={`text-sm md:text-base font-medium ${
              dayAppointments.length > 0 ? 'text-cyan-700' : 'text-gray-700'
            }`}>
              {day}
            </span>
            {dayAppointments.length > 0 && (
              <div className="mt-1">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mx-auto"></div>
                <span className="text-xs text-cyan-600 font-medium block mt-1">
                  {dayAppointments.length > 3 ? '3+' : dayAppointments.length}
                </span>
              </div>
            )}
          </div>
        </td>
      );
    }

    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(
        <tr key={`week-${i}`} className="h-16 md:h-20">
          {days.slice(i, i + 7)}
        </tr>
      );
    }

    // Add empty weeks to fill the calendar
    while (weeks.length < 6) {
      weeks.push(
        <tr key={`empty-week-${weeks.length}`} className="h-16 md:h-20">
          {Array(7).fill(0).map((_, i) => (
            <td key={`empty-day-${weeks.length}-${i}`} className="p-1 md:p-2"></td>
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

  const formatDateShort = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
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
      
      // Refresh the doctor's appointments to show the updated appointment
      if (user?.doctorProfile?.id) {
        dispatch(fetchAppointmentsByDoctor(user.doctorProfile.id));
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

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPatientName = (appointment: Appointment): string => {
    if (appointment.patient?.firstName && appointment.patient?.lastName) {
      return `${appointment.patient.firstName} ${appointment.patient.lastName}`;
    }
    return `Patient #${appointment.patientId}`;
  };

  const getPatientInitials = (appointment: Appointment): string => {
    if (appointment.patient?.firstName && appointment.patient?.lastName) {
      return `${appointment.patient.firstName.charAt(0)}${appointment.patient.lastName.charAt(0)}`;
    }
    return 'PT';
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <div 
      key={appointment.id} 
      className="border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-all duration-200 bg-white hover:border-cyan-200"
    >
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left Section - Patient Info */}
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white text-sm font-semibold shadow-md">
                {getPatientInitials(appointment)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-lg mb-1">{getPatientName(appointment)}</div>
              <div className="text-sm text-gray-500 space-y-1">
                {appointment.patient?.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{appointment.patient.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-gray-400" />
                  <span className="capitalize">{appointment.type?.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Appointment Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="text-cyan-500" size={18} />
              <div>
                <div className="text-sm font-medium text-gray-900">{formatDateShort(String(appointment.date))}</div>
                <div className="text-xs text-gray-500">Date & Time</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="text-blue-500" size={18} />
              <div>
                <div className="text-sm font-medium text-gray-900">{formatTime(String(appointment.date))}</div>
                <div className="text-xs text-gray-500">Time</div>
              </div>
            </div>
          </div>
          
          {/* Reason and Notes */}
          {appointment.reason && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Reason for Visit</div>
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border-l-4 border-l-cyan-400">
                {appointment.reason}
              </p>
            </div>
          )}
          
          {appointment.notes && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Notes</div>
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border-l-4 border-l-blue-400">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>
        
        {/* Right Section - Status and Actions */}
        <div className="flex-shrink-0 lg:w-48">
          <div className="text-center mb-4">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
              {appointment.status === 'CONFIRMED' && <CheckCircle className="w-4 h-4 mr-1" />}
              {appointment.status === 'PENDING' && <AlertCircle className="w-4 h-4 mr-1" />}
              {appointment.status === 'COMPLETED' && <TrendingUp className="w-4 h-4 mr-1" />}
              {appointment.status === 'CANCELLED' && <AlertCircle className="w-4 h-4 mr-1" />}
              {appointment.status}
            </span>
          </div>
          
          <div className="space-y-2">
            {appointment.status === 'PENDING' && (
              <>
                <button
                  onClick={() => handleStatusUpdate(appointment.id, 'CONFIRMED')}
                  className="w-full text-sm bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Confirm
                </button>
                <button
                  onClick={() => handleStatusUpdate(appointment.id, 'CANCELLED')}
                  className="w-full text-sm bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
              </>
            )}
            {appointment.status === 'CONFIRMED' && (
              <>
                <button
                  onClick={() => handleStatusUpdate(appointment.id, 'COMPLETED')}
                  className="w-full text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Complete
                </button>
                <button
                  onClick={() => handleStatusUpdate(appointment.id, 'CANCELLED')}
                  className="w-full text-sm bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={() => setSelectedAppointment(appointment)}
              className="w-full text-sm bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2.5 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <Eye className="w-4 h-4 inline mr-2" />
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Patient Appointments</h1>
          <p className="text-gray-600 mt-1">Manage and track all your patient appointments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              viewMode === 'calendar' 
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              viewMode === 'list' 
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <User className="w-4 h-4" />
            List
          </button>
        </div>
      </div>

      {/* Appointment Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl md:text-3xl font-bold text-gray-900">{appointmentStats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl md:text-3xl font-bold text-yellow-600">{appointmentStats.pending}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl md:text-3xl font-bold text-green-600">{appointmentStats.confirmed}</div>
          <div className="text-sm text-gray-500">Confirmed</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl md:text-3xl font-bold text-blue-600">{appointmentStats.completed}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl md:text-3xl font-bold text-red-600">{appointmentStats.cancelled}</div>
          <div className="text-sm text-gray-500">Cancelled</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl md:text-3xl font-bold text-cyan-600">{appointmentStats.today}</div>
          <div className="text-sm text-gray-500">Today</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl md:text-3xl font-bold text-purple-600">{appointmentStats.upcoming}</div>
          <div className="text-sm text-gray-500">Upcoming</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients, reasons, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <>
          {/* Calendar View */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => changeMonth(1)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors font-medium"
                >
                  Today
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <th key={day} className="p-2 text-center text-gray-500 font-medium text-sm md:text-base">
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
          </div>
        </>
      ) : (
        <>
          {/* List View */}
          <div className="space-y-6">
            {/* Today's Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  Today's Schedule
                  {todayAppointments.length > 0 && (
                    <span className="ml-3 bg-cyan-100 text-cyan-800 text-sm px-3 py-1 rounded-full font-medium">
                      {todayAppointments.length}
                    </span>
                  )}
                </div>
              </h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500 text-lg">Loading appointments...</div>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No appointments scheduled for today</p>
                  <p className="text-gray-400 text-sm mt-2">Enjoy your free time!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map(renderAppointmentCard)}
                </div>
              )}
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  Upcoming Appointments (Next 7 Days)
                  {upcomingAppointments.length > 0 && (
                    <span className="ml-3 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                      {upcomingAppointments.length}
                    </span>
                  )}
                </div>
              </h2>
              
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No upcoming appointments</p>
                  <p className="text-gray-400 text-sm mt-2">Your schedule is clear for the next week</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map(renderAppointmentCard)}
                </div>
              )}
            </div>

            {/* All Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  All Appointments
                  <span className="ml-3 bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full font-medium">
                    {filteredAppointments.length}
                  </span>
                </div>
              </h2>
              
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No appointments found</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map(renderAppointmentCard)}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900">Appointment Details</h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                  <p className="text-gray-900 font-medium">{getPatientName(selectedAppointment)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                  <p className="text-gray-900 font-medium">{formatDateShort(String(selectedAppointment.date))}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <p className="text-gray-900 font-medium capitalize">{selectedAppointment.type?.toLowerCase()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>
              
              {selectedAppointment.reason && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                  <p className="text-gray-900">{selectedAppointment.reason}</p>
                </div>
              )}
              
              {selectedAppointment.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <p className="text-gray-900">{selectedAppointment.notes}</p>
                </div>
              )}
              
              {selectedAppointment.patient?.phoneNumber && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Phone</label>
                  <p className="text-gray-900">{selectedAppointment.patient.phoneNumber}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;