import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import type { RootState } from '../../Redux/store';
import { fetchAppointments } from '../../Redux/appointmentSlice/appointmentSlice'; 
import { useDataPermissions } from '../../hooks/useDataPermissions';
import PermissionGuard from '../auth/PermissionGuard';
import { PERMISSIONS } from '../../lib/permissions';
import type { Appointment } from '../../types/data/appointment';

const ProtectedAppointmentsExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const { appointments, loading, error } = useAppSelector((state: RootState) => state.appointment);
  const { user, canRead, canCreate, canUpdate, canDelete, filterData, isOwner } = useDataPermissions();
  
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (canRead('appointments')) {
      dispatch(fetchAppointments() as any);
    }
  }, [dispatch, canRead]);

  useEffect(() => {
    // Filter appointments based on user permissions
    if (appointments.length > 0) {
      const filtered = filterData(appointments, 'appointments', PERMISSIONS.READ_OWN_APPOINTMENTS);
      setFilteredAppointments(filtered);
    }
  }, [appointments, filterData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading appointments</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with permission-based actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
        
        <div className="flex space-x-3">
          {/* Only show create button if user has permission */}
          <PermissionGuard permission={PERMISSIONS.CREATE_APPOINTMENT} resource="appointments">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Book New Appointment
            </button>
          </PermissionGuard>
          
          {/* Only show export button if user has permission */}
          <PermissionGuard permission={PERMISSIONS.READ_OWN_APPOINTMENTS} resource="appointments">
            <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
              Export
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
            <p className="mt-1 text-sm text-gray-500">
              {canCreate('appointments') 
                ? 'Get started by booking your first appointment.'
                : 'You don\'t have permission to view appointments.'
              }
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <li key={appointment.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Appointment #{appointment.id}
                      </p>
                      <div className="flex items-center space-x-2">
                        {/* Status badge */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                        
                        {/* Type badge */}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {appointment.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(appointment.date).toLocaleDateString()}
                    </div>
                    
                    {appointment.notes && (
                      <p className="mt-1 text-sm text-gray-600">{appointment.notes}</p>
                    )}
                  </div>
                  
                  {/* Action buttons based on permissions */}
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {/* View button - always visible if user can read */}
                    <PermissionGuard permission={PERMISSIONS.READ_OWN_APPOINTMENTS} resource="appointments">
                      <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        View
                      </button>
                    </PermissionGuard>
                    
                    {/* Edit button - only if user owns the appointment and can update */}
                    <PermissionGuard 
                      permission={PERMISSIONS.UPDATE_OWN_APPOINTMENTS} 
                      resource="appointments"
                      resourceId={appointment.id}
                    >
                      {isOwner(appointment, 'patientId') && (
                        <button className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md text-sm hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                          Edit
                        </button>
                      )}
                    </PermissionGuard>
                    
                    {/* Cancel button - only if user owns the appointment and can cancel */}
                    <PermissionGuard 
                      permission={PERMISSIONS.CANCEL_OWN_APPOINTMENTS} 
                      resource="appointments"
                      resourceId={appointment.id}
                    >
                      {isOwner(appointment, 'patientId') && appointment.status !== 'CANCELLED' && (
                        <button className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500">
                          Cancel
                        </button>
                      )}
                    </PermissionGuard>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Permission Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Debug Info:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>User Role: {user?.role}</p>
            <p>Can Read: {canRead('appointments') ? 'Yes' : 'No'}</p>
            <p>Can Create: {canCreate('appointments') ? 'Yes' : 'No'}</p>
            <p>Can Update: {canUpdate('appointments') ? 'Yes' : 'No'}</p>
            <p>Can Delete: {canDelete('appointments') ? 'Yes' : 'No'}</p>
            <p>Total Appointments: {appointments.length}</p>
            <p>Filtered Appointments: {filteredAppointments.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtectedAppointmentsExample;
