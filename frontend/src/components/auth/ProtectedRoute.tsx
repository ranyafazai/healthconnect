import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../Redux/hooks';
import type { RootState } from '../../Redux/store';
import { hasPermission, getProtectedRouteProps } from '../../lib/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: 'DOCTOR' | 'PATIENT' | 'ADMIN';
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  fallbackPath = '/auth/signin'
}) => {
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const { isAuthorized, redirectTo } = getProtectedRouteProps(user, requiredPermissions);
    if (!isAuthorized) {
      return <Navigate to={redirectTo || fallbackPath} state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
