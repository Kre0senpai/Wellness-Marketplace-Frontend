import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/api';

function ProtectedRoute({ children, requiredRole }) {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  // Not logged in - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check it
  if (requiredRole && currentUser.role !== requiredRole) {
    // Wrong role - redirect to appropriate page
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed - show the protected component
  return children;
}

export default ProtectedRoute;