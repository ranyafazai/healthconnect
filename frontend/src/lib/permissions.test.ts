// This file demonstrates how the permission system works
// You can run this in the browser console to test permissions

import { 
  hasPermission, 
  canAccessResource, 
  filterDataByPermissions,
  PERMISSIONS,
  ROLE_PERMISSIONS 
} from './permissions';

// Test user objects
const testUsers = {
  doctor: {
    id: 1,
    email: 'doctor@test.com',
    role: 'DOCTOR'
  },
  patient: {
    id: 2,
    email: 'patient@test.com',
    role: 'PATIENT'
  },
  admin: {
    id: 3,
    email: 'admin@test.com',
    role: 'ADMIN'
  },
  guest: {
    id: null,
    email: null,
    role: null
  }
};

// Test data
const testAppointments = [
  { id: 1, patientId: 2, doctorId: 1, date: '2024-01-15', status: 'CONFIRMED' },
  { id: 2, patientId: 4, doctorId: 1, date: '2024-01-16', status: 'PENDING' },
  { id: 3, patientId: 2, doctorId: 3, date: '2024-01-17', status: 'CANCELLED' }
];

// Test functions
export const testPermissionSystem = () => {
  console.log('🔐 Testing HealthyConnect Permission System\n');

  // Test 1: Basic permission checking
  console.log('📋 Test 1: Basic Permission Checking');
  console.log('Doctor can create appointment:', hasPermission(testUsers.doctor, PERMISSIONS.CREATE_APPOINTMENT));
  console.log('Patient can create appointment:', hasPermission(testUsers.patient, PERMISSIONS.CREATE_APPOINTMENT));
  console.log('Guest can create appointment:', hasPermission(testUsers.guest, PERMISSIONS.CREATE_APPOINTMENT));
  console.log('');

  // Test 2: Resource-specific permissions
  console.log('📋 Test 2: Resource-Specific Permissions');
  console.log('Doctor can read doctor appointments:', canAccessResource(testUsers.doctor, 'appointments', PERMISSIONS.READ_DOCTOR_APPOINTMENTS));
  console.log('Patient can read doctor appointments:', canAccessResource(testUsers.patient, 'appointments', PERMISSIONS.READ_DOCTOR_APPOINTMENTS));
  console.log('');

  // Test 3: Data filtering
  console.log('📋 Test 3: Data Filtering');
  const doctorAppointments = filterDataByPermissions(testUsers.doctor, testAppointments, 'appointments', PERMISSIONS.READ_DOCTOR_APPOINTMENTS);
  const patientAppointments = filterDataByPermissions(testUsers.patient, testAppointments, 'appointments', PERMISSIONS.READ_OWN_APPOINTMENTS);
  
  console.log('Doctor sees appointments:', doctorAppointments.length);
  console.log('Patient sees appointments:', patientAppointments.length);
  console.log('');

  // Test 4: Role-based permissions
  console.log('📋 Test 4: Role-Based Permissions');
  console.log('Doctor permissions:', ROLE_PERMISSIONS.DOCTOR.map(p => p.resource));
  console.log('Patient permissions:', ROLE_PERMISSIONS.PATIENT.map(p => p.resource));
  console.log('Admin permissions:', ROLE_PERMISSIONS.ADMIN.map(p => p.resource));
  console.log('');

  // Test 5: Specific permission checks
  console.log('📋 Test 5: Specific Permission Checks');
  console.log('Doctor can manage availability:', hasPermission(testUsers.doctor, PERMISSIONS.MANAGE_AVAILABILITY));
  console.log('Patient can manage availability:', hasPermission(testUsers.patient, PERMISSIONS.MANAGE_AVAILABILITY));
  console.log('Doctor can read patient medical records:', hasPermission(testUsers.doctor, PERMISSIONS.READ_PATIENT_MEDICAL_RECORDS));
  console.log('Patient can read patient medical records:', hasPermission(testUsers.patient, PERMISSIONS.READ_PATIENT_MEDICAL_RECORDS));
  console.log('');

  // Test 6: Permission combinations
  console.log('📋 Test 6: Permission Combinations');
  const patientCanManageAppointments = hasPermission(testUsers.patient, PERMISSIONS.CREATE_APPOINTMENT) &&
                                     hasPermission(testUsers.patient, PERMISSIONS.READ_OWN_APPOINTMENTS) &&
                                     hasPermission(testUsers.patient, PERMISSIONS.UPDATE_OWN_APPOINTMENTS);
  
  console.log('Patient can fully manage appointments:', patientCanManageAppointments);
  console.log('');

  return {
    testUsers,
    testAppointments,
    doctorAppointments,
    patientAppointments
  };
};

// Export for use in components
export { testUsers, testAppointments };

// Example usage in a component:
/*
import { testPermissionSystem } from '../lib/permissions.test';

// In your component, you can test permissions:
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    const results = testPermissionSystem();
    console.log('Permission test results:', results);
  }
}, []);
*/
