import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings2, 
  Bot, 
  MessageSquare, 
  BarChart3, 
  Code2, 
  Building2, 
  UserCircle, 
  LogOut 
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const orgId = user?.organizationId || "No Org Linked";

  // Main Workspace Links
  const workspaceItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Knowledge Base', path: '/dashboard/knowledge-base', icon: BookOpen },
    { name: 'AI Playground', path: '/dashboard/playground', icon: Bot },
    { name: 'Conversations', path: '/dashboard/conversations', icon: MessageSquare },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Widget Installation', path: '/dashboard/widget-installation', icon: Code2 },
  ];

  // Settings & Configuration Links
  const settingsItems = [
    { name: 'AI Settings', path: '/dashboard/ai-settings', icon: Settings2 },
    { name: 'Company Settings', path: '/dashboard/company-settings', icon: Building2 },
    { name: 'Profile', path: '/dashboard/profile', icon: UserCircle },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 h-full">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-8 border-b border-slate-100 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <h1 className="ml-3 text-lg font-bold tracking-tight text-slate-900">Beacon AI</h1>
      </div>

      {/* Navigation items (Scrollable area) */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        
        {/* Workspace Section */}
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Workspace</p>
        <div className="space-y-1 mb-8">
          {workspaceItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              end={item.path === '/dashboard'}
              className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Settings Section */}
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Configuration</p>
        <div className="space-y-1">
          {settingsItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Profile Info & Logout Footer */}
      <div className="p-4 border-t border-slate-100 shrink-0">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
          <div className="overflow-hidden pr-2">
            <p className="text-sm font-bold text-slate-900 leading-none truncate">{user?.name || "Admin User"}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">ID: {orgId}</p>
          </div>
          <button 
            onClick={logout} 
            title="Logout"
            className="p-2 shrink-0 rounded-lg bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}