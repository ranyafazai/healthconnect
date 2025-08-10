import type { UserLite } from '../types/user';

export type UserRole = 'DOCTOR' | 'PATIENT' | 'ADMIN';

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: (user: UserLite, resourceId?: number | string) => boolean;
}

export interface RolePermissions {
  [key: string]: Permission[];
}

// Define all available permissions
export const PERMISSIONS = {
  // User management
  READ_OWN_PROFILE: 'read:own_profile',
  UPDATE_OWN_PROFILE: 'update:own_profile',
  READ_OTHER_PROFILES: 'read:other_profiles',
  
  // Doctor-specific permissions
  MANAGE_DOCTOR_PROFILE: 'manage:doctor_profile',
  MANAGE_AVAILABILITY: 'manage:availability',
  MANAGE_CERTIFICATIONS: 'manage:certifications',
  READ_DOCTOR_REVIEWS: 'read:doctor_reviews',
  
  // Patient-specific permissions
  MANAGE_PATIENT_PROFILE: 'manage:patient_profile',
  READ_MEDICAL_HISTORY: 'read:medical_history',
  UPDATE_MEDICAL_HISTORY: 'update:medical_history',
  
  // Appointment permissions
  CREATE_APPOINTMENT: 'create:appointment',
  READ_OWN_APPOINTMENTS: 'read:own_appointments',
  UPDATE_OWN_APPOINTMENTS: 'update:own_appointments',
  CANCEL_OWN_APPOINTMENTS: 'cancel:own_appointments',
  READ_DOCTOR_APPOINTMENTS: 'read:doctor_appointments',
  MANAGE_DOCTOR_APPOINTMENTS: 'manage:doctor_appointments',
  
  // Message permissions
  SEND_MESSAGE: 'send:message',
  READ_OWN_MESSAGES: 'read:own_messages',
  READ_CONVERSATION: 'read:conversation',
  
  // Review permissions
  CREATE_REVIEW: 'create:review',
  READ_REVIEWS: 'read:reviews',
  UPDATE_OWN_REVIEW: 'update:own_review',
  DELETE_OWN_REVIEW: 'delete:own_review',
  
  // File permissions
  UPLOAD_FILE: 'upload:file',
  READ_OWN_FILES: 'read:own_files',
  READ_SHARED_FILES: 'read:shared_files',
  DELETE_OWN_FILES: 'delete:own_files',
  
  // Video call permissions
  INITIATE_VIDEO_CALL: 'initiate:video_call',
  JOIN_VIDEO_CALL: 'join:video_call',
  
  // Notification permissions
  READ_OWN_NOTIFICATIONS: 'read:own_notifications',
  MARK_NOTIFICATION_READ: 'mark:notification_read',
  
  // Medical record permissions
  READ_OWN_MEDICAL_RECORDS: 'read:own_medical_records',
  CREATE_MEDICAL_RECORD: 'create:medical_record',
  UPDATE_MEDICAL_RECORD: 'update:medical_record',
  READ_PATIENT_MEDICAL_RECORDS: 'read:patient_medical_records',
} as const;

// Define role-based permissions
export const ROLE_PERMISSIONS: RolePermissions = {
  DOCTOR: [
    // Profile management
    {
      resource: 'profile',
      actions: [PERMISSIONS.READ_OWN_PROFILE, PERMISSIONS.UPDATE_OWN_PROFILE],
    },
    {
      resource: 'doctor_profile',
      actions: [PERMISSIONS.MANAGE_DOCTOR_PROFILE, PERMISSIONS.MANAGE_AVAILABILITY, PERMISSIONS.MANAGE_CERTIFICATIONS],
    },
    
    // Appointments
    {
      resource: 'appointments',
      actions: [PERMISSIONS.READ_DOCTOR_APPOINTMENTS, PERMISSIONS.MANAGE_DOCTOR_APPOINTMENTS],
    },
    
    // Messages
    {
      resource: 'messages',
      actions: [PERMISSIONS.SEND_MESSAGE, PERMISSIONS.READ_OWN_MESSAGES, PERMISSIONS.READ_CONVERSATION],
    },
    
    // Reviews
    {
      resource: 'reviews',
      actions: [PERMISSIONS.READ_DOCTOR_REVIEWS],
    },
    
    // Files
    {
      resource: 'files',
      actions: [PERMISSIONS.UPLOAD_FILE, PERMISSIONS.READ_OWN_FILES, PERMISSIONS.DELETE_OWN_FILES],
    },
    
    // Video calls
    {
      resource: 'video_calls',
      actions: [PERMISSIONS.INITIATE_VIDEO_CALL, PERMISSIONS.JOIN_VIDEO_CALL],
    },
    
    // Notifications
    {
      resource: 'notifications',
      actions: [PERMISSIONS.READ_OWN_NOTIFICATIONS, PERMISSIONS.MARK_NOTIFICATION_READ],
    },
    
    // Medical records (can read patient records they're treating)
    {
      resource: 'medical_records',
      actions: [PERMISSIONS.READ_PATIENT_MEDICAL_RECORDS],
      conditions: (user, resourceId) => {
        // Doctors can only read medical records of patients they have appointments with
        // This would need to be checked against appointment data
        return true; // Simplified for now
      },
    },
  ],
  
  PATIENT: [
    // Profile management
    {
      resource: 'profile',
      actions: [PERMISSIONS.READ_OWN_PROFILE, PERMISSIONS.UPDATE_OWN_PROFILE],
    },
    {
      resource: 'patient_profile',
      actions: [PERMISSIONS.MANAGE_PATIENT_PROFILE],
    },
    
    // Appointments
    {
      resource: 'appointments',
      actions: [PERMISSIONS.CREATE_APPOINTMENT, PERMISSIONS.READ_OWN_APPOINTMENTS, PERMISSIONS.UPDATE_OWN_APPOINTMENTS, PERMISSIONS.CANCEL_OWN_APPOINTMENTS],
    },
    
    // Messages
    {
      resource: 'messages',
      actions: [PERMISSIONS.SEND_MESSAGE, PERMISSIONS.READ_OWN_MESSAGES, PERMISSIONS.READ_CONVERSATION],
    },
    
    // Reviews
    {
      resource: 'reviews',
      actions: [PERMISSIONS.CREATE_REVIEW, PERMISSIONS.READ_REVIEWS, PERMISSIONS.UPDATE_OWN_REVIEW, PERMISSIONS.DELETE_OWN_REVIEW],
    },
    
    // Files
    {
      resource: 'files',
      actions: [PERMISSIONS.UPLOAD_FILE, PERMISSIONS.READ_OWN_FILES, PERMISSIONS.DELETE_OWN_FILES],
    },
    
    // Video calls
    {
      resource: 'video_calls',
      actions: [PERMISSIONS.JOIN_VIDEO_CALL],
    },
    
    // Notifications
    {
      resource: 'notifications',
      actions: [PERMISSIONS.READ_OWN_NOTIFICATIONS, PERMISSIONS.MARK_NOTIFICATION_READ],
    },
    
    // Medical records
    {
      resource: 'medical_records',
      actions: [PERMISSIONS.READ_OWN_MEDICAL_RECORDS, PERMISSIONS.CREATE_MEDICAL_RECORD, PERMISSIONS.UPDATE_MEDICAL_RECORD],
    },
  ],
  
  ADMIN: [
    // Admins have access to everything
    {
      resource: '*',
      actions: ['*'],
    },
  ],
};

// Permission checking functions
export const hasPermission = (
  user: UserLite | null,
  permission: string,
  resource?: string,
  resourceId?: number | string
): boolean => {
  if (!user || !user.role) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[user.role as UserRole];
  if (!rolePermissions) return false;
  
  // Check if user has the specific permission
  for (const perm of rolePermissions) {
    if (perm.resource === '*' || perm.resource === resource) {
      if (perm.actions.includes('*') || perm.actions.includes(permission)) {
        // Check conditions if they exist
        if (perm.conditions) {
          return perm.conditions(user, resourceId);
        }
        return true;
      }
    }
  }
  
  return false;
};

export const canAccessResource = (
  user: UserLite | null,
  resource: string,
  action: string,
  resourceId?: number | string
): boolean => {
  return hasPermission(user, action, resource, resourceId);
};

export const canReadOwnData = (user: UserLite | null, resource: string): boolean => {
  return hasPermission(user, PERMISSIONS.READ_OWN_PROFILE, resource);
};

export const canModifyOwnData = (user: UserLite | null, resource: string): boolean => {
  return hasPermission(user, PERMISSIONS.UPDATE_OWN_PROFILE, resource);
};

export const canCreateResource = (user: UserLite | null, resource: string): boolean => {
  const createPermissions = [
    PERMISSIONS.CREATE_APPOINTMENT,
    PERMISSIONS.CREATE_REVIEW,
    PERMISSIONS.CREATE_MEDICAL_RECORD,
    PERMISSIONS.UPLOAD_FILE,
  ];
  
  for (const permission of createPermissions) {
    if (hasPermission(user, permission, resource)) {
      return true;
    }
  }
  
  return false;
};

// Route protection helpers
export const getProtectedRouteProps = (user: UserLite | null, requiredPermissions: string[]) => {
  const hasAllPermissions = requiredPermissions.every(permission => 
    hasPermission(user, permission)
  );
  
  return {
    isAuthorized: hasAllPermissions,
    redirectTo: hasAllPermissions ? undefined : '/signin',
  };
};

// Data filtering helpers
export const filterDataByPermissions = <T extends { id: number | string; userId?: number | string }>(
  user: UserLite | null,
  data: T[],
  resource: string,
  action: string
): T[] => {
  if (!user) return [];
  
  // If user has admin access or can read all data
  if (hasPermission(user, action, resource)) {
    return data;
  }
  
  // Filter to only show user's own data
  if (canReadOwnData(user, resource)) {
    return data.filter(item => 
      item.userId === user.id || 
      (item as any).patientId === user.id || 
      (item as any).doctorId === user.id
    );
  }
  
  return [];
};

// Export permission constants for easy use
export const {
  READ_OWN_PROFILE,
  UPDATE_OWN_PROFILE,
  CREATE_APPOINTMENT,
  READ_OWN_APPOINTMENTS,
  UPDATE_OWN_APPOINTMENTS,
  CANCEL_OWN_APPOINTMENTS,
  SEND_MESSAGE,
  READ_OWN_MESSAGES,
  CREATE_REVIEW,
  READ_REVIEWS,
  UPDATE_OWN_REVIEW,
  DELETE_OWN_REVIEW,
  UPLOAD_FILE,
  READ_OWN_FILES,
  DELETE_OWN_FILES,
  JOIN_VIDEO_CALL,
  READ_OWN_NOTIFICATIONS,
  READ_OWN_MEDICAL_RECORDS,
  CREATE_MEDICAL_RECORD,
  UPDATE_MEDICAL_RECORD,
} = PERMISSIONS;
