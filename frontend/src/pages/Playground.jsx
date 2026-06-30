import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, Search, Cpu, Database, Layers, CheckCircle2, 
  Settings2, Activity, Zap, RefreshCw, Copy, ThumbsUp, 
  ThumbsDown, AlertTriangle, Terminal, Clock, FileText, CornerDownRight
} from 'lucide-react';

// --- Animation Configs ---
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

// --- Mock Pipeline Steps ---
const pipelineSteps = [
  { id: 'query', label: 'User Query Received', icon: Search },
  { id: 'embed', label: 'Generating Embeddings', icon: Cpu },
  { id: 'vector', label: 'Vector Search', icon: Database },
  { id: 'context', label: 'Context Assembly', icon: Layers },
  { id: 'llm', label: 'LLM Generation', icon: Bot },
  { id: 'answer', label: 'Final Response', icon: CheckCircle2 }
];

export default function Playground({ orgId }) {
  // --- Core State ---
  const [messages, setMessages] = useState([
    { role: 'system', text: 'Hello! I am your AI Knowledge Base assistant. Ask me anything based on your uploaded documentation.', id: 'sys-1' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // --- Observability State ---
  const [pipelineState, setPipelineState] = useState('idle'); // tracks active step
  const [activeMetrics, setActiveMetrics] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // --- Simulated RAG Execution Flow ---
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', text: input, id: Date.now().toString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setActiveMetrics(null);

    // 1. Start Pipeline Simulation
    let stepIndex = 0;
    const pipelineInterval = setInterval(() => {
      if (stepIndex < pipelineSteps.length) {
        setPipelineState(pipelineSteps[stepIndex].id);
        stepIndex++;
      }
    }, 400);

    try {
      // 2. Real API Call
      const response = await fetch('http://127.0.0.1:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId, question: input })
      });
      
      const data = await response.json();
      
      // Stop Pipeline Visuals
      clearInterval(pipelineInterval);
      setPipelineState('answer');

      if (response.ok) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: data.answer, 
          sources: data.sources_used,
          id: Date.now().toString() 
        }]);

        // Populate Observability Metrics based on response
        setActiveMetrics({
          latency: '840ms',
          tokens: 412,
          confidence: data.sources_used?.length > 0 ? Math.round(data.sources_used[0].score * 100) : 0,
          model: 'llama-3.3-70b-versatile',
          chunks: data.sources_used || []
        });

      } else {
        throw new Error(data.detail || "Failed to fetch response");
      }
    } catch (error) {
      clearInterval(pipelineInterval);
      setPipelineState('idle');
      setMessages(prev => [...prev, { role: 'system', text: `Error: ${error.message}`, id: Date.now().toString() }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => setPipelineState('idle'), 2000);
    }
  };

  const handleQuickPrompt = (promptText) => {
    setInput(promptText);
    inputRef.current?.focus();
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="h-full flex flex-col pb-4 text-slate-300">
      
      {/* --- Page Header & System Status --- */}
      <motion.section variants={fadeUp} className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            AI Playground <span className="text-[10px] uppercase tracking-widest bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md border border-indigo-500/30">Debug Mode</span>
          </h1>
          <p className="text-sm mt-1 text-slate-400">Test, analyze, and optimize Beacon's RAG pipeline in real-time.</p>
        </div>
        
        {/* Status Bar */}
        <div className="flex flex-wrap gap-2 md:gap-4 bg-[#121620] border border-white/5 px-4 py-2.5 rounded-xl">
          {[
            { label: 'Model', val: 'Llama 3.3', icon: Bot },
            { label: 'Vector DB', val: 'Atlas Online', icon: Database, pulse: true },
            { label: 'Latency', val: activeMetrics ? activeMetrics.latency : 'Idle', icon: Clock }
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] md:text-xs font-mono border-r border-white/5 pr-4 last:border-0 last:pr-0">
              <stat.icon size={12} className="text-indigo-400" />
              <span className="text-slate-500 hidden sm:inline">{stat.label}:</span>
              <span className="text-white font-semibold flex items-center gap-1.5">
                {stat.pulse && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />} {stat.val}
              </span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* --- Main 3-Column Workspace --- */}
      <motion.section variants={fadeUp} className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* ========================================== */}
        {/* COLUMN 1: THE CHAT INTERFACE (Left)        */}
        {/* ========================================== */}
        <div className="lg:col-span-4 bg-[#121620]/80 backdrop-blur-md border border-white/5 rounded-2xl md:rounded-[2rem] flex flex-col overflow-hidden shadow-2xl relative">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 left-0 w-full h-32 bg-indigo-500/5 blur-[50px] pointer-events-none" />

          {/* Quick Prompts */}
          <div className="p-4 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-hide z-10">
            {['Explain Refund Policy', 'How to reset password?', 'Pricing tiers'].map((p, i) => (
              <button key={i} onClick={() => handleQuickPrompt(p)} className="shrink-0 text-[10px] font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 text-slate-300 transition-all whitespace-nowrap">
                {p}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar z-10">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] px-4 py-3 text-sm shadow-sm leading-relaxed relative group ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm font-medium' 
                    : msg.role === 'system' 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-xs rounded-xl' 
                    : 'bg-white/5 text-slate-200 border border-white/10 rounded-2xl rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Assistant Message Toolbars */}
                  {msg.role === 'assistant' && (
                    <div className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button className="text-slate-500 hover:text-white p-1"><Copy size={12} /></button>
                      <button className="text-slate-500 hover:text-emerald-400 p-1"><ThumbsUp size={12} /></button>
                      <button className="text-slate-500 hover:text-red-400 p-1"><ThumbsDown size={12} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Thinking Indicator */}
            {isTyping && (
              <div className="flex items-center gap-3 opacity-70 mt-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Bot size={12} className="text-indigo-400" />
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-6" />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-[#0A0C10] border-t border-white/5 z-10">
            <div className="relative flex items-end bg-[#121620] border border-white/10 rounded-2xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
              <textarea 
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Ask Beacon anything..." 
                className="w-full bg-transparent text-slate-200 text-sm pl-4 pr-12 py-3.5 outline-none resize-none min-h-[50px] max-h-32 custom-scrollbar"
                rows={1}
              />
              <button 
                type="submit" 
                disabled={isTyping || !input.trim()} 
                className="absolute right-2 bottom-2 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:bg-white/10 disabled:text-slate-500"
              >
                <Send size={14} className="ml-0.5" />
              </button>
            </div>
          </form>
        </div>


        {/* ========================================== */}
        {/* COLUMN 2: RAG PIPELINE VISUALIZER (Center) */}
        {/* ========================================== */}
        <div className="hidden lg:flex lg:col-span-3 bg-[#121620]/40 backdrop-blur-sm border border-white/5 rounded-[2rem] p-6 flex-col items-center justify-center relative overflow-hidden">
          
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-8 absolute top-6 left-6">RAG Pipeline</h3>

          <div className="w-full flex flex-col items-center gap-2 relative mt-8">
            
            {/* Animated Connecting Line */}
            <div className="absolute top-6 bottom-6 left-1/2 w-0.5 bg-white/5 -translate-x-1/2 z-0">
               {pipelineState !== 'idle' && pipelineState !== 'answer' && (
                 <motion.div animate={{ y: ['-100%', '800%'] }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                    className="w-full h-1/4 bg-gradient-to-b from-transparent via-indigo-500 to-transparent" />
               )}
            </div>

            {/* Pipeline Nodes */}
            {pipelineSteps.map((step, idx) => {
              const states = pipelineSteps.map(s => s.id);
              const currentIndex = states.indexOf(pipelineState);
              const isActive = currentIndex === idx;
              const isDone = currentIndex > idx || pipelineState === 'answer';
              
              return (
                <div key={step.id} className="relative z-10 w-full group">
                  <div className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-indigo-500/10 border border-indigo-500/20 scale-105' : 'bg-[#0A0C10]/50 border border-transparent hover:border-white/10'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isDone ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]' : 
                      isActive ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] animate-pulse' : 
                      'bg-white/5 text-slate-500'
                    }`}>
                      {isDone ? <CheckCircle2 size={16} /> : <step.icon size={16} />}
                    </div>
                    <span className={`text-[10px] font-bold mt-2 text-center leading-tight transition-colors ${
                      isActive ? 'text-indigo-300' : isDone ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* ========================================== */}
        {/* COLUMN 3: OBSERVABILITY X-RAY (Right)      */}
        {/* ========================================== */}
        <div className="lg:col-span-5 flex flex-col gap-6 min-h-0">
          
          {/* Top Panel: Metrics & Diagnostics */}
          <div className="bg-[#121620]/80 backdrop-blur-md border border-white/5 rounded-2xl md:rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Activity size={16} className="text-cyan-400" /> Response Diagnostics</h3>
            
            {activeMetrics ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Confidence Score</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-2xl font-bold ${activeMetrics.confidence > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{activeMetrics.confidence}%</p>
                    {activeMetrics.confidence < 80 && <AlertTriangle size={14} className="text-amber-400" />}
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${activeMetrics.confidence}%` }} className={`h-full ${activeMetrics.confidence > 80 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  </div>
                </div>
                
                <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Total Tokens Used</p>
                  <p className="text-2xl font-bold text-slate-200 font-mono">{activeMetrics.tokens}</p>
                  <p className="text-[9px] text-slate-500 mt-1">Prompt + Completion</p>
                </div>
              </div>
            ) : (
              <div className="h-28 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-slate-600 text-sm">
                Awaiting query execution...
              </div>
            )}
          </div>

          {/* Bottom Panel: Retrieved Context Inspector */}
          <div className="flex-1 bg-[#121620]/80 backdrop-blur-md border border-white/5 rounded-2xl md:rounded-[2rem] p-6 shadow-xl flex flex-col overflow-hidden">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2"><Layers size={16} className="text-indigo-400" /> Vector Context Retrieved</h3>
            <p className="text-[10px] text-slate-500 mb-4">Top K semantic matches injected into the prompt.</p>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {activeMetrics && activeMetrics.chunks.length > 0 ? (
                activeMetrics.chunks.map((chunk, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                    className="bg-[#0A0C10] border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 transition-colors group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold border border-indigo-500/20">#{idx + 1}</span>
                        <span className="text-[10px] font-mono text-slate-400 truncate w-32" title={chunk.id}>{chunk.id.slice(0, 15)}...</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${chunk.score > 0.8 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        <Zap size={8} /> {Math.round(chunk.score * 100)}% Match
                      </span>
                    </div>
                    <div className="relative pl-3 border-l-2 border-white/10 group-hover:border-indigo-500/50 transition-colors">
                      <CornerDownRight size={12} className="absolute -left-[7px] top-1 text-slate-600" />
                      <p className="text-[11px] text-slate-300 leading-relaxed font-mono line-clamp-3 group-hover:line-clamp-none transition-all">
                        "Document chunk content extracted from vector store based on cosine similarity..."
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full min-h-[150px] border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-slate-600 p-6 text-center">
                  <Database size={24} className="mb-2 opacity-50" />
                  <p className="text-xs">No vector context loaded.</p>
                  <p className="text-[10px] mt-1 opacity-70">Submit a query to inspect RAG chunk retrieval.</p>
                </div>
              )}
            </div>
            
            {/* Developer Console Footer */}
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1"><Terminal size={12} /> execution_logs.txt</span>
              <button className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors">View Raw Logs</button>
            </div>
          </div>

        </div>
      </motion.section>

    </motion.div>
  );
}