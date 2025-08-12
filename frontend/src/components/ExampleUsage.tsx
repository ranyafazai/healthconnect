import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../Redux/hooks';
import { fetchAllDoctors, searchDoctors } from '../Redux/doctorSlice/doctorSlice';
import { fetchAppointments } from '../Redux/appointmentSlice/appointmentSlice';
import { createAppointment } from '../Redux/appointmentSlice/appointmentSlice';
import { formatDate, formatDateTime } from '../lib/utils';


const ExampleUsage: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Redux state selectors
  const { doctors, loading: doctorsLoading, error: doctorsError } = useAppSelector(state => state.doctor);
  const { appointments, loading: appointmentsLoading } = useAppSelector(state => state.appointment);
  const { user } = useAppSelector(state => state.auth);

  // Local state for form
  const [searchFilters, setSearchFilters] = useState({
    specialization: '',
    city: '',
    rating: 0
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchAllDoctors());
    dispatch(fetchAppointments());
  }, [dispatch]);

  // Handle doctor search
  const handleSearch = () => {
    const filters = Object.fromEntries(
      Object.entries(searchFilters).filter(([_, value]) => value !== '' && value !== 0)
    );
    dispatch(searchDoctors(filters));
  };

  // Handle appointment creation
  const handleCreateAppointment = async (doctorId: number) => {
    try {
      await dispatch(createAppointment({
        doctorId,
        date: new Date().toISOString(),
        type: 'TEXT',
        reason: 'General consultation',
        patientInfo: {
          fullName: user?.email || 'Patient',
          email: user?.email || '',
          phoneNumber: '',
          dateOfBirth: '',
          medicalHistory: ''
        }
      })).unwrap();
      alert('Appointment created successfully!');
    } catch (error) {
      alert('Failed to create appointment');
    }
  };

  if (doctorsLoading || appointmentsLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (doctorsError) {
    return <div className="text-red-500 text-center py-8">Error: {doctorsError}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        HealthyConnect - Example Usage
      </h1>

      {/* Doctor Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Search Doctors</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Specialization"
            value={searchFilters.specialization}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, specialization: e.target.value }))}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="City"
            value={searchFilters.city}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, city: e.target.value }))}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Minimum Rating"
            value={searchFilters.rating}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
            className="border rounded px-3 py-2"
          />
        </div>
        
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Search Doctors
        </button>
      </div>

      {/* Doctors List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Available Doctors ({doctors.length})</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">
                Dr. {doctor.firstName} {doctor.lastName}
              </h3>
              <p className="text-gray-600 mb-2">{doctor.specialization}</p>
              <p className="text-sm text-gray-500 mb-2">
                {doctor.yearsExperience} years experience
              </p>
              {doctor.avgReview && (
                <p className="text-sm text-gray-500 mb-3">
                  ⭐ {doctor.avgReview.toFixed(1)} rating
                </p>
              )}
              <button
                onClick={() => handleCreateAppointment(doctor.id)}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Appointments ({appointments.length})</h2>
        
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">
                    {appointment.doctor ? 
                      `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 
                      'Unknown Doctor'
                    }
                  </h4>
                  <p className="text-gray-600">
                    {formatDateTime(appointment.date)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Type: {appointment.type} | Status: {appointment.status}
                  </p>
                  {appointment.reason && (
                    <p className="text-sm text-gray-600 mt-2">
                      Reason: {appointment.reason}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
          
          {appointments.length === 0 && (
            <p className="text-gray-500 text-center py-8">No appointments found</p>
          )}
        </div>
      </div>



      {/* Redux State Debug */}
      <div className="bg-gray-100 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Redux State Debug</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Auth State:</h3>
            <pre className="bg-white p-3 rounded text-sm overflow-auto">
              {JSON.stringify({ user: user?.email, isAuthenticated: !!user }, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Doctors State:</h3>
            <pre className="bg-white p-3 rounded text-sm overflow-auto">
              {JSON.stringify({ count: doctors.length, loading: doctorsLoading, error: doctorsError }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleUsage;
