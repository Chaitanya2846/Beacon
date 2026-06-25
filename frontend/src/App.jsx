import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Global Contexts
import { AuthProvider, AuthContext } from './context/AuthContext';

// Pages
import Landing from './pages/Landing'; // <-- 1. Import the new Landing page
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

/**
 * ProtectedRoute Component
 * Prevents unauthenticated users from accessing secure pages.
 */
const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 2. Change the default route to point to the Landing component */}
          <Route path="/" element={<Landing />} />
          
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Secure Workspace Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}