# 🔐 HealthyConnect Permission System

This document explains how to implement and use the comprehensive permission system in the HealthyConnect frontend application.

## 🏗️ Architecture Overview

The permission system consists of several key components:

1. **Permissions Library** (`permissions.ts`) - Core permission definitions and checking logic
2. **ProtectedRoute Component** - Route-level permission protection
3. **PermissionGuard Component** - Component-level permission protection
4. **useDataPermissions Hook** - Data access permission management
5. **Permission-based data filtering** - Automatic data filtering based on user permissions

## 🎯 Permission Types

### User Management Permissions
- `READ_OWN_PROFILE` - Read user's own profile
- `UPDATE_OWN_PROFILE` - Update user's own profile
- `READ_OTHER_PROFILES` - Read other users' profiles

### Doctor-Specific Permissions
- `MANAGE_DOCTOR_PROFILE` - Manage doctor profile details
- `MANAGE_AVAILABILITY` - Manage appointment availability
- `MANAGE_CERTIFICATIONS` - Manage doctor certifications
- `READ_DOCTOR_REVIEWS` - Read reviews about the doctor

### Patient-Specific Permissions
- `MANAGE_PATIENT_PROFILE` - Manage patient profile details
- `READ_MEDICAL_HISTORY` - Read medical history
- `UPDATE_MEDICAL_HISTORY` - Update medical history

### Appointment Permissions
- `CREATE_APPOINTMENT` - Create new appointments
- `READ_OWN_APPOINTMENTS` - Read user's own appointments
- `UPDATE_OWN_APPOINTMENTS` - Update user's own appointments
- `CANCEL_OWN_APPOINTMENTS` - Cancel user's own appointments
- `READ_DOCTOR_APPOINTMENTS` - Read appointments for doctors
- `MANAGE_DOCTOR_APPOINTMENTS` - Manage appointments for doctors

### Message Permissions
- `SEND_MESSAGE` - Send messages
- `READ_OWN_MESSAGES` - Read user's own messages
- `READ_CONVERSATION` - Read conversation threads

### Review Permissions
- `CREATE_REVIEW` - Create reviews
- `READ_REVIEWS` - Read reviews
- `UPDATE_OWN_REVIEW` - Update user's own reviews
- `DELETE_OWN_REVIEW` - Delete user's own reviews

### File Permissions
- `UPLOAD_FILE` - Upload files
- `READ_OWN_FILES` - Read user's own files
- `READ_SHARED_FILES` - Read shared files
- `DELETE_OWN_FILES` - Delete user's own files

### Video Call Permissions
- `INITIATE_VIDEO_CALL` - Start video calls
- `JOIN_VIDEO_CALL` - Join video calls

### Notification Permissions
- `READ_OWN_NOTIFICATIONS` - Read user's own notifications
- `MARK_NOTIFICATION_READ` - Mark notifications as read

### Medical Record Permissions
- `READ_OWN_MEDICAL_RECORDS` - Read user's own medical records
- `CREATE_MEDICAL_RECORD` - Create medical records
- `UPDATE_MEDICAL_RECORD` - Update medical records
- `READ_PATIENT_MEDICAL_RECORDS` - Read patient medical records (doctors)

## 🛡️ Route Protection

### Basic Route Protection

```tsx
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { PERMISSIONS } from '../lib/permissions';

// Protect a route with role requirement
<Route 
  path="/patient/*" 
  element={
    <ProtectedRoute requiredRole="PATIENT">
      <PatientPage />
    </ProtectedRoute>
  } 
/>

// Protect a route with specific permissions
<Route 
  path="/appointments" 
  element={
    <ProtectedRoute requiredPermissions={[PERMISSIONS.READ_OWN_APPOINTMENTS]}>
      <Appointments />
    </ProtectedRoute>
  } 
/>

// Protect a route with both role and permissions
<Route 
  path="/doctor/profile" 
  element={
    <ProtectedRoute 
      requiredRole="DOCTOR"
      requiredPermissions={[PERMISSIONS.MANAGE_DOCTOR_PROFILE]}
    >
      <DoctorProfile />
    </ProtectedRoute>
  } 
/>
```

### Nested Route Protection

```tsx
function PatientPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <Routes>
          <Route 
            path="appointments" 
            element={
              <ProtectedRoute requiredPermissions={[PERMISSIONS.READ_OWN_APPOINTMENTS]}>
                <Appointments />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="profile/*" 
            element={
              <ProtectedRoute requiredPermissions={[PERMISSIONS.READ_OWN_PROFILE]}>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}
```

## 🚪 Component-Level Protection

### Using PermissionGuard

```tsx
import PermissionGuard from '../components/auth/PermissionGuard';
import { PERMISSIONS } from '../lib/permissions';

// Show/hide components based on permissions
<PermissionGuard permission={PERMISSIONS.CREATE_APPOINTMENT}>
  <button className="btn-primary">Book Appointment</button>
</PermissionGuard>

// Show fallback content when permission is denied
<PermissionGuard 
  permission={PERMISSIONS.READ_OWN_APPOINTMENTS}
  fallback={<p>You don't have permission to view appointments.</p>}
  showFallback={true}
>
  <AppointmentsList />
</PermissionGuard>

// Check permissions for specific resources
<PermissionGuard 
  permission={PERMISSIONS.UPDATE_OWN_APPOINTMENTS}
  resource="appointments"
  resourceId={appointmentId}
>
  <button className="btn-edit">Edit Appointment</button>
</PermissionGuard>
```

## 📊 Data Permission Management

### Using useDataPermissions Hook

```tsx
import { useDataPermissions } from '../hooks/useDataPermissions';

function AppointmentsComponent() {
  const { 
    user, 
    canRead, 
    canCreate, 
    canUpdate, 
    canDelete, 
    filterData, 
    isOwner,
    isDoctor,
    isPatient 
  } = useDataPermissions();

  // Check if user can read appointments
  if (!canRead('appointments')) {
    return <p>Access denied</p>;
  }

  // Filter data based on permissions
  const filteredAppointments = filterData(
    appointments, 
    'appointments', 
    PERMISSIONS.READ_OWN_APPOINTMENTS
  );

  // Check ownership
  const canEditAppointment = (appointment) => {
    return isOwner(appointment, 'patientId') && canUpdate('appointments');
  };

  return (
    <div>
      {/* Only show create button if user has permission */}
      {canCreate('appointments') && (
        <button>Create Appointment</button>
      )}

      {/* Render filtered appointments */}
      {filteredAppointments.map(appointment => (
        <div key={appointment.id}>
          <h3>Appointment #{appointment.id}</h3>
          
          {/* Only show edit button if user owns the appointment */}
          {canEditAppointment(appointment) && (
            <button>Edit</button>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 🔍 Permission Checking Functions

### Direct Permission Checks

```tsx
import { hasPermission, canAccessResource } from '../lib/permissions';

// Check if user has a specific permission
const canCreateAppointment = hasPermission(user, PERMISSIONS.CREATE_APPOINTMENT);

// Check if user can access a specific resource
const canEditAppointment = canAccessResource(
  user, 
  'appointments', 
  PERMISSIONS.UPDATE_OWN_APPOINTMENTS, 
  appointmentId
);

// Check role-based access
const isDoctor = user?.role === 'DOCTOR';
const isPatient = user?.role === 'PATIENT';
```

### Data Filtering

```tsx
import { filterDataByPermissions } from '../lib/permissions';

// Filter appointments based on user permissions
const visibleAppointments = filterDataByPermissions(
  user,
  appointments,
  'appointments',
  PERMISSIONS.READ_OWN_APPOINTMENTS
);
```

## 🎨 UI Patterns

### Conditional Rendering

```tsx
// Show different content based on user role
{isDoctor ? (
  <DoctorDashboard />
) : isPatient ? (
  <PatientDashboard />
) : (
  <GuestView />
)}

// Show actions based on permissions
<div className="action-buttons">
  {canCreate('appointments') && (
    <button className="btn-primary">Book Appointment</button>
  )}
  
  {canUpdate('profile') && (
    <button className="btn-secondary">Edit Profile</button>
  )}
  
  {isOwner(item) && canDelete('items') && (
    <button className="btn-danger">Delete</button>
  )}
</div>
```

### Permission-Based Navigation

```tsx
// Show navigation items based on permissions
const navigationItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    requiredPermission: PERMISSIONS.READ_OWN_PROFILE
  },
  {
    label: 'Appointments',
    path: '/appointments',
    requiredPermission: PERMISSIONS.READ_OWN_APPOINTMENTS
  },
  {
    label: 'Messages',
    path: '/messages',
    requiredPermission: PERMISSIONS.READ_OWN_MESSAGES
  }
].filter(item => hasPermission(user, item.requiredPermission));

return (
  <nav>
    {navigationItems.map(item => (
      <Link key={item.path} to={item.path}>
        {item.label}
      </Link>
    ))}
  </nav>
);
```

## 🚨 Error Handling

### Unauthorized Access

```tsx
// Redirect to unauthorized page
<Route path="/unauthorized" element={<Unauthorized />} />

// Custom fallback for specific routes
<ProtectedRoute 
  requiredPermissions={[PERMISSIONS.READ_OWN_APPOINTMENTS]}
  fallbackPath="/access-denied"
>
  <Appointments />
</ProtectedRoute>
```

### Permission Denied Messages

```tsx
// Show appropriate messages when permissions are denied
{!canRead('appointments') ? (
  <div className="permission-denied">
    <h3>Access Denied</h3>
    <p>You don't have permission to view appointments.</p>
    <Link to="/dashboard">Return to Dashboard</Link>
  </div>
) : (
  <AppointmentsList />
)}
```

## 🧪 Testing Permissions

### Development Debug Info

```tsx
// Show permission debug info in development
{process.env.NODE_ENV === 'development' && (
  <div className="debug-info">
    <h4>Permission Debug:</h4>
    <p>User Role: {user?.role}</p>
    <p>Can Read Appointments: {canRead('appointments') ? 'Yes' : 'No'}</p>
    <p>Can Create Appointments: {canCreate('appointments') ? 'Yes' : 'No'}</p>
    <p>Can Update Appointments: {canUpdate('appointments') ? 'Yes' : 'No'}</p>
  </div>
)}
```

### Testing Different User Roles

```tsx
// Test with different user roles
const testUsers = {
  doctor: { id: 1, email: 'doctor@test.com', role: 'DOCTOR' },
  patient: { id: 2, email: 'patient@test.com', role: 'PATIENT' },
  admin: { id: 3, email: 'admin@test.com', role: 'ADMIN' }
};

// Use in development/testing
const currentUser = process.env.NODE_ENV === 'development' 
  ? testUsers.doctor 
  : user;
```

## 🔧 Best Practices

### 1. Always Check Permissions Before API Calls

```tsx
useEffect(() => {
  if (canRead('appointments')) {
    dispatch(fetchAppointments());
  }
}, [canRead, dispatch]);
```

### 2. Use Permission Guards for UI Elements

```tsx
// Good: Use PermissionGuard
<PermissionGuard permission={PERMISSIONS.CREATE_APPOINTMENT}>
  <button>Create</button>
</PermissionGuard>

// Avoid: Manual permission checking in render
{hasPermission(user, PERMISSIONS.CREATE_APPOINTMENT) && (
  <button>Create</button>
)}
```

### 3. Filter Data at the Component Level

```tsx
// Filter data based on permissions before rendering
const visibleData = filterData(rawData, 'resource', 'action');

// Don't filter in the API call unless necessary
```

### 4. Provide Clear Feedback for Permission Denials

```tsx
// Show helpful messages when access is denied
{!canAccess ? (
  <div className="access-denied">
    <p>You need additional permissions to access this feature.</p>
    <p>Contact your administrator for access.</p>
  </div>
) : (
  <ProtectedFeature />
)}
```

### 5. Use Consistent Permission Naming

```tsx
// Use the predefined permission constants
PERMISSIONS.READ_OWN_APPOINTMENTS  // ✅ Good
'read:appointments'                // ❌ Avoid hardcoding
```

## 🚀 Getting Started

1. **Import the permission system**:
   ```tsx
   import { PERMISSIONS } from '../lib/permissions';
   import ProtectedRoute from '../components/auth/ProtectedRoute';
   import PermissionGuard from '../components/auth/PermissionGuard';
   import { useDataPermissions } from '../hooks/useDataPermissions';
   ```

2. **Protect your routes**:
   ```tsx
   <ProtectedRoute requiredPermissions={[PERMISSIONS.READ_OWN_PROFILE]}>
     <YourComponent />
   </ProtectedRoute>
   ```

3. **Protect your components**:
   ```tsx
   <PermissionGuard permission={PERMISSIONS.CREATE_APPOINTMENT}>
     <CreateButton />
   </PermissionGuard>
   ```

4. **Manage data permissions**:
   ```tsx
   const { canRead, canCreate, filterData } = useDataPermissions();
   ```

5. **Test with different user roles** to ensure permissions work correctly.

## 🔒 Security Notes

- **Frontend permissions are for UX only** - Always validate permissions on the backend
- **Never expose sensitive data** - Use the permission system to filter data before rendering
- **Test thoroughly** - Ensure users can't access unauthorized resources
- **Log permission denials** - Monitor for potential security issues

---

This permission system provides a robust foundation for managing user access and data visibility in your HealthyConnect application. Use it consistently across all components to ensure a secure and user-friendly experience.
