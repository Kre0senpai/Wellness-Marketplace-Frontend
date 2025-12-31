import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Temporary placeholder components (we'll build these later)
const Dashboard = () => <div className="p-8"><h1 className="text-3xl">User Dashboard</h1></div>;
const PractitionerDashboard = () => <div className="p-8"><h1 className="text-3xl">Practitioner Dashboard</h1></div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/practitioner/dashboard" 
          element={
            <ProtectedRoute requiredRole="PRACTITIONER">
              <PractitionerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;