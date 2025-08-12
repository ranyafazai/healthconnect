import type { ReactNode, FC } from 'react';
import { useAppSelector } from '../../Redux/hooks';
import type { RootState } from '../../Redux/store';
import { hasPermission, canAccessResource } from '../../lib/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permission: string;
  resource?: string;
  resourceId?: number | string;
  fallback?: ReactNode;
  showFallback?: boolean;
}

const PermissionGuard: FC<PermissionGuardProps> = ({
  children,
  permission,
  resource,
  resourceId,
  fallback = null,
  showFallback = false
}) => {
  const { user } = useAppSelector((state: RootState) => state.auth);

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
