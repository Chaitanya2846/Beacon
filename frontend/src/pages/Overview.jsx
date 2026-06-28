import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'Mon', queries: 240 },
  { name: 'Tue', queries: 310 },
  { name: 'Wed', queries: 450 },
  { name: 'Thu', queries: 280 },
  { name: 'Fri', queries: 590 },
  { name: 'Sat', queries: 180 },
  { name: 'Sun', queries: 220 },
];

export default function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Queries</h3>
          <p className="text-4xl font-bold text-slate-900">1,248</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Deflection Rate</h3>
          <p className="text-4xl font-bold text-emerald-500">84%</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Active Documents</h3>
          <p className="text-4xl font-bold text-indigo-500">12</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6">Conversation Volume (7 Days)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="queries" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorQueries)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}