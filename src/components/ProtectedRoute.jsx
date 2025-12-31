import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/api';

/**
 * ProtectedRoute Component
 * 
 * This component protects routes that require authentication.
 * If user is not logged in, they get redirected to login page.
 * 
 * Usage:
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 */

function ProtectedRoute({ children, requiredRole }) {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  // Not logged in - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check it
  if (requiredRole && currentUser.role !== requiredRole) {
    // Wrong role - redirect to their appropriate dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed - show the protected component
  return children;
}

export default ProtectedRoute;