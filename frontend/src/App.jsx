import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Global Contexts
import { AuthProvider, AuthContext } from './context/AuthContext';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Widget from './pages/Widget';

// Dashboard Shell & Sub-Pages
import Dashboard from './pages/Dashboard';
import Overview from './pages/Overview';
import KnowledgeBase from './pages/KnowledgeBase';
import Playground from './pages/Playground';
import WidgetInstall from './pages/WidgetInstall';
import Conversations from './pages/Conversations';

// Placeholder Components for the new routes (We will build these out in separate files later)
const AiSettings = ({ orgId }) => <div className="p-8 text-slate-500">AI Settings Component</div>;
const Analytics = ({ orgId }) => <div className="p-8 text-slate-500">Analytics Component</div>;
const CompanySettings = ({ orgId }) => <div className="p-8 text-slate-500">Company Settings Component</div>;
const Profile = ({ orgId }) => <div className="p-8 text-slate-500">Profile Component</div>;

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

/**
 * Inner Routes Component
 * Extracted so we can consume AuthContext and pass orgId to sub-routes
 */
const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  const orgId = user?.organizationId || "No Org Linked";

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/widget/:orgId" element={<Widget />} />

      {/* Secure Workspace Routes with Nested Sub-Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      >
        {/* The 'index' route loads automatically at /dashboard */}
        <Route index element={<Overview />} />
        
        {/* Existing Routes */}
        <Route path="knowledge-base" element={<KnowledgeBase orgId={orgId} />} />
        <Route path="playground" element={<Playground orgId={orgId} />} />
        <Route path="widget-installation" element={<WidgetInstall orgId={orgId} />} />
        
        {/* New Routes */}
        <Route path="ai-settings" element={<AiSettings orgId={orgId} />} />
        <Route path="conversations" element={<Conversations orgId={orgId} />} />
        <Route path="analytics" element={<Analytics orgId={orgId} />} />
        <Route path="company-settings" element={<CompanySettings orgId={orgId} />} />
        <Route path="profile" element={<Profile orgId={orgId} />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}