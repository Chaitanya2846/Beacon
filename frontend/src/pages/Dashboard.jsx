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
      case '/dashboard/knowledge-base': return 'Knowledge Base';
      case '/dashboard/playground': return 'Agent Playground';
      case '/dashboard/widget-installation': return 'Widget Installation';
      case '/dashboard/ai-settings': return 'AI Settings';
      case '/dashboard/conversations': return 'Conversations';
      case '/dashboard/analytics': return 'Analytics';
      case '/dashboard/company-settings': return 'Company Settings';
      case '/dashboard/profile': return 'Profile';
      default: return 'Overview & Analytics';
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-slate-300 font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Persistent Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Dashboard Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Ambient Top Glow for the entire dashboard */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-indigo-600/10 blur-[120px] pointer-events-none z-0" />

        <Navbar title={getHeaderTitle()} />

        {/* Dynamic Nested View Injection Layer */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-[1600px] mx-auto h-full fade-in">
            <Outlet />
          </div>
        </div>
      </div>
      
      {/* Layout State Motion Animations & Custom Dark Scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Custom Dark Mode Scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}