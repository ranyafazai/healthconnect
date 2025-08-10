import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../Redux/store';
import { hasPermission, canAccessResource } from '../../lib/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: string;
  resource?: string;
  resourceId?: number | string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  resource,
  resourceId,
  fallback = null,
  showFallback = false
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const hasAccess = resource 
    ? canAccessResource(user, resource, permission, resourceId)
    : hasPermission(user, permission);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showFallback) {
    return <>{fallback}</>;
  }

  return null;
};

export default PermissionGuard;
