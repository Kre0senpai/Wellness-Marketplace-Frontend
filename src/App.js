import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';

// Profile Pages
import Profile from './pages/Profile';
import PractitionerProfile from './pages/PractitionerProfile';

// Booking & Orders
import Bookings from './pages/Bookings';
import Orders from './pages/Orders';

// Practitioners
import BrowsePractitioners from './pages/BrowsePractitioners';
import PractitionerDetail from './pages/PractitionerDetail';
import BookingForm from './pages/BookingForm';

// Products
import BrowseProducts from './pages/BrowseProducts';

// Community & Recommendations
import CommunityQA from './pages/CommunityQA';
import Recommendations from './pages/Recommendations';

// Components
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

// Placeholder for Notifications
const Notifications = () => <div className="p-8"><h1 className="text-3xl">Notifications - Coming Soon</h1></div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested routes */}
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