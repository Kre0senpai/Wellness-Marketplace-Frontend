import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Dashboard Pages
import DashboardHome from './pages/DashboardHome';
import Profile from './pages/Profile';
import PractitionerProfile from './pages/PractitionerProfile';
import Bookings from './pages/Bookings';
import Orders from './pages/Orders';
import BrowsePractitioners from './pages/BrowsePractitioners';
import PractitionerDetail from './pages/PractitionerDetail';
import BookingForm from './pages/BookingForm';
import BrowseProducts from './pages/BrowseProducts';
import CommunityQA from './pages/CommunityQA';
import Recommendations from './pages/Recommendations';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Admin route - separate from dashboard */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Dashboard routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="practitioner-profile" element={<PractitionerProfile />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="orders" element={<Orders />} />
          <Route path="practitioners" element={<BrowsePractitioners />} />
          <Route path="practitioners/:id" element={<PractitionerDetail />} />
          <Route path="book/:practitionerId" element={<BookingForm />} />
          <Route path="products" element={<BrowseProducts />} />
          <Route path="community" element={<CommunityQA />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;