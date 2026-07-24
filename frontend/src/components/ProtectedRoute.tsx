import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
}) => {
  // Session state (isAuthenticated/user) is established once in App.tsx via
  // fetchCurrentUser(), which reads the httpOnly cookie. ProtectedRoute just
  // reads that result — it should not re-fetch or track tokens itself.
  const { isAuthenticated, user, isInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  // App.tsx already blocks rendering of routes until isInitialized is true,
  // but guard here too in case ProtectedRoute is ever used outside that flow.
  if (!isInitialized) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};