import { useSelector } from 'react-redux';
import type { RootState } from '../Redux/store';
import { 
  hasPermission, 
  canAccessResource, 
  filterDataByPermissions,
  PERMISSIONS 
} from '../lib/permissions';

export const useDataPermissions = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Check if user can read data for a specific resource
  const canRead = (resource: string, resourceId?: number | string): boolean => {
    const readPermissions = [
      PERMISSIONS.READ_OWN_PROFILE,
      PERMISSIONS.READ_OWN_APPOINTMENTS,
      PERMISSIONS.READ_OWN_MESSAGES,
      PERMISSIONS.READ_REVIEWS,
      PERMISSIONS.READ_OWN_FILES,
      PERMISSIONS.READ_OWN_NOTIFICATIONS,
      PERMISSIONS.READ_OWN_MEDICAL_RECORDS,
    ];

    return readPermissions.some(permission => 
      canAccessResource(user, resource, permission, resourceId)
    );
  };

  // Check if user can create data for a specific resource
  const canCreate = (resource: string): boolean => {
    const createPermissions = [
      PERMISSIONS.CREATE_APPOINTMENT,
      PERMISSIONS.CREATE_REVIEW,
      PERMISSIONS.CREATE_MEDICAL_RECORD,
      PERMISSIONS.UPLOAD_FILE,
    ];

    return createPermissions.some(permission => 
      hasPermission(user, permission, resource)
    );
  };

  // Check if user can update data for a specific resource
  const canUpdate = (resource: string, resourceId?: number | string): boolean => {
    const updatePermissions = [
      PERMISSIONS.UPDATE_OWN_PROFILE,
      PERMISSIONS.UPDATE_OWN_APPOINTMENTS,
      PERMISSIONS.UPDATE_OWN_REVIEW,
      PERMISSIONS.UPDATE_MEDICAL_RECORD,
    ];

    return updatePermissions.some(permission => 
      canAccessResource(user, resource, permission, resourceId)
    );
  };

  // Check if user can delete data for a specific resource
  const canDelete = (resource: string, resourceId?: number | string): boolean => {
    const deletePermissions = [
      PERMISSIONS.DELETE_OWN_REVIEW,
      PERMISSIONS.DELETE_OWN_FILES,
      PERMISSIONS.CANCEL_OWN_APPOINTMENTS,
    ];

    return deletePermissions.some(permission => 
      canAccessResource(user, resource, permission, resourceId)
    );
  };

  // Filter data based on user permissions
  const filterData = <T extends { id: number | string; userId?: number | string }>(
    data: T[],
    resource: string,
    action: string
  ): T[] => {
    return filterDataByPermissions(user, data, resource, action);
  };

  // Check if user owns a specific resource
  const isOwner = (resource: any, userIdField: string = 'userId'): boolean => {
    if (!user || !resource) return false;
    
    const resourceUserId = resource[userIdField];
    if (resourceUserId === undefined) return false;
    
    return String(resourceUserId) === String(user.id);
  };

  // Check if user can access a specific resource by ID
  const canAccessById = (resource: string, resourceId: number | string): boolean => {
    return canRead(resource, resourceId);
  };

  // Get user's role
  const getUserRole = (): string | null => {
    return user?.role || null;
  };

  // Check if user is a doctor
  const isDoctor = (): boolean => {
    return user?.role === 'DOCTOR';
  };

  // Check if user is a patient
  const isPatient = (): boolean => {
    return user?.role === 'PATIENT';
  };



  return {
    user,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    filterData,
    isOwner,
    canAccessById,
    getUserRole,
    isDoctor,
    isPatient,
    PERMISSIONS,
  };
};
