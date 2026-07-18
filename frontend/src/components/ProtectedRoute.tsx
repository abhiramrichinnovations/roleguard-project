import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchCurrentUser } from '../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, isLoading, tokens } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated && !user && tokens) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, user, tokens, dispatch]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !tokens) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};