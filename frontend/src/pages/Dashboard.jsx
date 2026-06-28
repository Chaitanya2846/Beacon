import React, { useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Dynamically map active sub-routes to human-readable header titles
  const getHeaderTitle = () => {
    switch (location.pathname) {
      case '/dashboard/knowledge-base':
        return 'Knowledge Base';
      case '/dashboard/playground':
        return 'Agent Playground';
      case '/dashboard/widget-installation':
        return 'Widget Installation';
      default:
        return 'Overview & Analytics';
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f7f9] text-slate-900 font-sans overflow-hidden">
      {/* Persistent Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Workspace Dashboard Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Navbar title={getHeaderTitle()} />

        {/* Dynamic Nested View Injection Layer */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto h-full fade-in">
            <Outlet />
          </div>
        </div>
      </div>
      
      {/* Layout State Motion Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.25s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}