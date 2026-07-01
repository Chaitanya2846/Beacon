import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Search, Filter, Download, RefreshCw, Star, 
  AlertTriangle, Clock, Zap, CheckCircle2, ChevronRight, 
  MoreVertical, Bot, User, FileText, CornerDownRight, Play, 
  Pause, RotateCcw, ShieldCheck, ThumbsUp, ThumbsDown, Cpu
} from 'lucide-react';

// --- Animation Configs ---
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

// --- Mock Data ---
const mockConversations = [
  { id: 'CONV-8829', customer: 'Sarah Jenkins', email: 'sarah.j@example.com', status: 'Resolved', priority: 'High', lastMessage: 'That perfectly answers my question, thank you!', time: '2m ago', unread: true, aiConfidence: 96, avatar: 'SJ' },
  { id: 'CONV-8828', customer: 'Michael Chen', email: 'mchen@acme.co', status: 'Needs Review', priority: 'Medium', lastMessage: 'I am getting an API error 429.', time: '14m ago', unread: false, aiConfidence: 64, avatar: 'MC' },
  { id: 'CONV-8827', customer: 'Emma Watson', email: 'emma@design.co', status: 'Open', priority: 'Low', lastMessage: 'How do I downgrade my billing plan?', time: '1h ago', unread: false, aiConfidence: 88, avatar: 'EW' },
  { id: 'CONV-8826', customer: 'David Okafor', email: 'david.o@startup.io', status: 'Resolved', priority: 'Medium', lastMessage: 'Thanks for the documentation link.', time: '3h ago', unread: false, aiConfidence: 99, avatar: 'DO' },
];

const mockChatDetails = [
  { role: 'user', text: 'Hi, I need help understanding your refund policy. If I cancel halfway through my annual plan, do I get a prorated refund?', time: '10:42 AM', id: 'msg-1' },
  { 
    role: 'assistant', 
    text: 'Hello Sarah! Based on our Terms of Service, annual plans are heavily discounted and therefore non-refundable once the 14-day trial period has ended. If you cancel, your account will remain active until the end of your current billing cycle, but no prorated refunds will be issued.', 
    time: '10:42 AM', 
    id: 'msg-2',
    metrics: { confidence: 96, latency: '840ms', tokens: 142, model: 'Llama-3.3-70b' },
    sources: [
      { id: 'Terms_Of_Service.pdf', page: 4, score: 0.96, text: "Annual subscriptions are billed upfront. Because they include a 20% discount, they are non-refundable after the 14-day cooling-off period." },
      { id: 'Billing_FAQ.md', page: 1, score: 0.88, text: "Cancellations take effect at the end of the current billing cycle. We do not offer prorated refunds for partial years." }
    ]
  },
  { role: 'user', text: 'That perfectly answers my question, thank you!', time: '10:45 AM', id: 'msg-3' }
];

export default function Conversations() {
  const [activeChat, setActiveChat] = useState(mockConversations[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('inspector'); // inspector, timeline, notes
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat]);

  // --- Helpers ---
  const getStatusColor = (status) => {
    switch(status) {
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Needs Review': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Open': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="h-full flex flex-col text-slate-300 overflow-hidden pb-4">
      
      {/* ========================================== */}
      {/* PAGE HEADER & KPIS                         */}
      {/* ========================================== */}
      <div className="shrink-0 mb-6">
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Conversations</h1>
            <p className="text-sm text-slate-400 mt-1">Monitor, review, and analyze every AI-powered customer interaction.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-[#121620] hover:bg-white/5 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center gap-2 text-white">
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition-all flex items-center gap-2 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              <Download size={16} /> Export Logs
            </button>
          </div>
        </motion.div>

        {/* KPI Grid */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { title: 'Total Conversations', val: '12,548', icon: MessageSquare, color: 'text-indigo-400', trend: '+8%' },
            { title: 'Conversations Today', val: '356', icon: Zap, color: 'text-cyan-400', trend: 'Live' },
            { title: 'AI Resolution Rate', val: '94%', icon: CheckCircle2, color: 'text-emerald-400', trend: '+1.2%' },
            { title: 'Needs Human Review', val: '18', icon: AlertTriangle, color: 'text-amber-400', trend: '-3' },
            { title: 'Average Confidence', val: '92%', icon: Star, color: 'text-purple-400', trend: 'Stable' },
            { title: 'Avg Response Time', val: '1.2s', icon: Clock, color: 'text-emerald-400', trend: '-8%' }
          ].map((card, i) => (
            <div key={i} className="bg-[#121620]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-[40px] group-hover:bg-indigo-500/10 transition-colors" />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <card.icon size={16} className={card.color} />
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/5 ${card.trend.includes('-') && !card.trend.includes('%') ? 'text-emerald-400' : 'text-slate-400'}`}>{card.trend}</span>
              </div>
              <div className="relative z-10">
                <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">{card.title}</h4>
                <p className="text-xl font-bold text-white">{card.val}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ========================================== */}
      {/* MAIN WORKSPACE (Split Layout)              */}
      {/* ========================================== */}
      <motion.div variants={fadeUp} className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        
        {/* --- LEFT PANEL: INBOX (30%) --- */}
        <div className="w-1/3 max-w-[400px] bg-[#121620]/80 backdrop-blur-md border border-white/5 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl shrink-0 hidden lg:flex">
          
          {/* Inbox Header & Search */}
          <div className="p-4 border-b border-white/5 shrink-0">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0A0C10] border border-white/10 rounded-xl pl-9 pr-10 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button className="absolute right-2 p-1.5 text-slate-500 hover:text-white transition-colors bg-[#121620] rounded-lg">
                <Filter size={14} />
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {mockConversations.map((conv) => (
              <div 
                key={conv.id} 
                onClick={() => setActiveChat(conv)}
                className={`p-4 border-b border-white/5 cursor-pointer transition-all relative group ${
                  activeChat.id === conv.id ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        {conv.avatar}
                      </div>
                      {conv.unread && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-[#121620] rounded-full" />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${activeChat.id === conv.id ? 'text-white' : 'text-slate-200'}`}>{conv.customer}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{conv.id}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">{conv.time}</span>
                </div>
                
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">{conv.lastMessage}</p>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${getStatusColor(conv.status)}`}>
                    {conv.status}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
                    conv.aiConfidence > 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    <Star size={10} /> AI: {conv.aiConfidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT PANEL: CONVERSATION DETAILS & ANALYSIS (70%) --- */}
        <div className="flex-1 flex gap-4 min-w-0">
          
          {/* Main Chat Area */}
          <div className="flex-1 bg-[#121620]/80 backdrop-blur-md border border-white/5 rounded-2xl md:rounded-[2rem] flex flex-col overflow-hidden shadow-2xl relative min-w-0">
            <div className="absolute top-0 left-0 w-full h-32 bg-indigo-500/5 blur-[50px] pointer-events-none" />

            {/* Chat Header */}
            <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-[#0A0C10]/50 z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                  {activeChat.avatar}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{activeChat.customer} <span className="text-[10px] font-mono text-slate-500 ml-2">{activeChat.email}</span></h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${getStatusColor(activeChat.status)}`}>
                      {activeChat.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1"><Clock size={10} /> Started 10:40 AM</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"><Download size={16} /></button>
                <button className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"><MoreVertical size={16} /></button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 custom-scrollbar z-10">
              {mockChatDetails.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mr-3 mt-1">
                      <Bot size={14} className="text-indigo-400" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] relative group ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                    <div className={`px-5 py-4 text-sm shadow-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm font-medium' 
                        : 'bg-[#0A0C10] text-slate-200 border border-white/5 rounded-2xl rounded-tl-sm w-full'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      
                      {/* AI Observability Metadata (Only for assistant) */}
                      {msg.role === 'assistant' && msg.metrics && (
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                          
                          {/* Metrics Strip */}
                          <div className="flex flex-wrap gap-3">
                            <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md flex items-center gap-1">
                              <Star size={10} /> Conf: {msg.metrics.confidence}%
                            </span>
                            <span className="text-[9px] font-mono uppercase bg-white/5 text-slate-400 border border-white/10 px-2 py-1 rounded-md flex items-center gap-1">
                              <Clock size={10} /> {msg.metrics.latency}
                            </span>
                            <span className="text-[9px] font-mono uppercase bg-white/5 text-slate-400 border border-white/10 px-2 py-1 rounded-md flex items-center gap-1">
                              <Zap size={10} /> {msg.metrics.tokens} Tok
                            </span>
                            <span className="text-[9px] font-mono uppercase bg-white/5 text-slate-400 border border-white/10 px-2 py-1 rounded-md flex items-center gap-1">
                              <Cpu size={10} /> {msg.metrics.model}
                            </span>
                          </div>

                          {/* RAG Sources Used */}
                          <div className="bg-[#121620] border border-white/5 rounded-xl p-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5"><FileText size={12} /> Context Sources Retrieved</p>
                            <div className="space-y-2">
                              {msg.sources.map((src, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/5 rounded-lg p-3 hover:border-indigo-500/30 transition-colors">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1.5">
                                      <span className="w-4 h-4 rounded bg-indigo-500/20 flex items-center justify-center">{idx + 1}</span> {src.id} (Pg {src.page})
                                    </span>
                                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Match: {Math.round(src.score * 100)}%</span>
                                  </div>
                                  <div className="relative pl-3 border-l-2 border-indigo-500/30">
                                    <CornerDownRight size={10} className="absolute -left-[6px] top-1 text-slate-600" />
                                    <p className="text-[10px] text-slate-400 leading-relaxed font-mono line-clamp-2">"{src.text}"</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Feedback / Debug Tools */}
                          <div className="flex justify-between items-center pt-2">
                            <div className="flex gap-2">
                              <button className="text-slate-500 hover:text-emerald-400 bg-white/5 p-1.5 rounded transition-colors"><ThumbsUp size={12} /></button>
                              <button className="text-slate-500 hover:text-rose-400 bg-white/5 p-1.5 rounded transition-colors"><ThumbsDown size={12} /></button>
                            </div>
                            <button className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors">View Raw JSON</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] text-slate-500 mt-1 absolute -bottom-5 ${msg.role === 'user' ? 'right-2' : 'left-2'}`}>{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} className="h-6" />
            </div>

            {/* Replay Controls Footer */}
            <div className="p-4 bg-[#0A0C10] border-t border-white/5 z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors">
                  <Play size={14} className="ml-0.5" />
                </button>
                <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-indigo-500 rounded-full" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">Replay Mode</span>
              </div>
              <button className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-colors">
                Escalate to Human
              </button>
            </div>
          </div>

          {/* --- AI ANALYSIS & INSPECTOR PANEL (Far Right) --- */}
          <div className="w-72 bg-[#121620]/80 backdrop-blur-md border border-white/5 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl shrink-0 hidden xl:flex">
            
            {/* Tabs */}
            <div className="flex border-b border-white/5 p-2 bg-[#0A0C10]/50">
              {['inspector', 'timeline', 'notes'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === tab ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
              
              {/* Hallucination Risk Assessor */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> Hallucination Risk</h3>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-emerald-400">Low Risk</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Strictly grounded in docs</p>
                  </div>
                  <CheckCircle2 size={24} className="text-emerald-400 opacity-50" />
                </div>
              </div>

              {/* RAG Performance Radar */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">AI Evaluation</h3>
                <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-4 space-y-4">
                  {[
                    { label: 'Context Relevance', score: 96 },
                    { label: 'Factual Accuracy', score: 98 },
                    { label: 'Tone & Policy', score: 100 }
                  ].map((metric, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                        <span>{metric.label}</span>
                        <span className="text-indigo-400">{metric.score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div style={{ width: `${metric.score}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Box */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Admin Actions</h3>
                <div className="space-y-2">
                  <button className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                    <CheckCircle2 size={14} /> Mark as Reviewed
                  </button>
                  <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                    Add Internal Note
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}