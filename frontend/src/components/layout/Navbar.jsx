import React from 'react';

export default function Navbar({ title }) {
  return (
    <header className="h-20 bg-[#0A0C10]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-20">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">System Online</span>
      </div>
    </header>
  );
}