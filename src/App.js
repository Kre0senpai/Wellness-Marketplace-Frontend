import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';  // Only import once here
import Bookings from './pages/Bookings'; 
import Orders from './pages/Orders';
import BrowsePractitioners from './pages/BrowsePractitioners';
import PractitionerDetail from './pages/PractitionerDetail';
import PractitionerProfile from './pages/PractitionerProfile';
import DashboardHome from './pages/DashboardHome';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import './App.css';

// Temporary placeholders (we'll build these next)
const Practitioners = () => <div className="p-8"><h1 className="text-3xl">Browse Practitioners - Coming Soon</h1></div>;
const Products = () => <div className="p-8"><h1 className="text-3xl">Browse Products - Coming Soon</h1></div>;
const Community = () => <div className="p-8"><h1 className="text-3xl">Community Q&A - Coming Soon</h1></div>;
const Recommendations = () => <div className="p-8"><h1 className="text-3xl">Recommendations - Coming Soon</h1></div>;
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
          {/* Nested routes inside dashboard layout */}
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="orders" element={<Orders />} />
          <Route path="practitioners" element={<BrowsePractitioners />} />
          <Route path="practitioners/:id" element={<PractitionerDetail />} /> 
          <Route path="practitioner-profile" element={<PractitionerProfile />} />
          <Route path="practitioners" element={<Practitioners />} />
          <Route path="products" element={<Products />} />
          <Route path="community" element={<Community />} />
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