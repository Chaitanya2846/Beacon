import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, BookOpen, Settings2, Bot, MessageSquare, 
  BarChart3, Code2, Building2, UserCircle, LogOut, Sparkles
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
    <aside className="w-72 bg-[#0A0C10] border-r border-white/5 flex flex-col z-20 h-full relative">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
      
      {/* Brand Header */}
      <div className="h-20 flex items-center px-8 border-b border-white/5 shrink-0 relative z-10">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          <Sparkles size={16} className="text-white" />
        </div>
        <h1 className="ml-3 text-lg font-bold tracking-tight text-white">Beacon AI</h1>
      </div>

      {/* Navigation items (Scrollable area) */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide relative z-10">
        
        {/* Workspace Section */}
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Workspace</p>
        <div className="space-y-1 mb-8">
          {workspaceItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              end={item.path === '/dashboard'}
              className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
                isActive ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Settings Section */}
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Configuration</p>
        <div className="space-y-1">
          {settingsItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
                isActive ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Profile Info & Logout Footer */}
      <div className="p-4 border-t border-white/5 shrink-0 relative z-10">
        <div className="bg-[#121620] rounded-2xl p-4 flex items-center justify-between border border-white/5">
          <div className="overflow-hidden pr-2">
            <p className="text-sm font-bold text-white leading-none truncate">{user?.name || "Admin User"}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">ID: {orgId}</p>
          </div>
          <button 
            onClick={logout} 
            title="Logout"
            className="p-2 shrink-0 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}