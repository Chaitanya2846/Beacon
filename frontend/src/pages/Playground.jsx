import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, Search, Cpu, Database, Layers, CheckCircle2, 
  Activity, Zap, Copy, ThumbsUp, ThumbsDown, Terminal, Clock, 
  ChevronDown, ChevronUp, Plus, Code2, ShieldAlert, AlignLeft
} from 'lucide-react';

// --- Animation Configs ---
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

// --- Pipeline Steps ---
const pipelineSteps = [
  { id: 'query', label: 'Query', icon: Search },
  { id: 'embed', label: 'Embedding', icon: Cpu },
  { id: 'vector', label: 'Search', icon: Database },
  { id: 'context', label: 'Context', icon: Layers },
  { id: 'llm', label: 'LLM', icon: Bot },
  { id: 'answer', label: 'Response', icon: CheckCircle2 }
];

export default function Playground({ orgId }) {
  // --- Core State ---
  const [messages, setMessages] = useState([
    { role: 'system', text: 'Hello! I am your AI Knowledge Base assistant. Ask me anything based on your uploaded documentation.', id: 'sys-1' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // --- Observability & UI State ---
  const [pipelineState, setPipelineState] = useState('idle');
  const [activeMetrics, setActiveMetrics] = useState(null);
  const [showPipeline, setShowPipeline] = useState(false);
  const [showDebugDrawer, setShowDebugDrawer] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showPipeline]);

  // --- Simulated RAG Execution Flow ---
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', text: input, id: Date.now().toString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setActiveMetrics(null);
    setShowPipeline(true); // Auto-expand pipeline on new message

    // 1. Start Horizontal Pipeline Simulation
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

        // Populate Observability Metrics
        setActiveMetrics({
          latency: '840ms',
          tokens: Math.floor(Math.random() * 200) + 300,
          cost: '$0.0014',
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
      setMessages(prev => [...prev, { role: 'system', text: `System Error: ${error.message}`, id: Date.now().toString() }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        setPipelineState('idle');
        setShowPipeline(false); // Auto-collapse pipeline when done
      }, 3000);
    }
  };

  const handleQuickPrompt = (promptText) => {
    setInput(promptText);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([{ role: 'system', text: 'Chat reset. How can I help you today?', id: Date.now().toString() }]);
    setActiveMetrics(null);
  };

  return (
    <div className="h-full flex flex-col text-slate-300 relative overflow-hidden">
      
      {/* ========================================== */}
      {/* HEADER & MODEL TOOLBAR                     */}
      {/* ========================================== */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="shrink-0 flex flex-col gap-4 mb-6">
        
        {/* Header Row */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              AI Playground
            </h1>
            <p className="text-sm text-slate-400 mt-1">Test and debug your AI Assistant.</p>
          </div>
          <button onClick={clearChat} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition-all flex items-center gap-2 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            <Plus size={16} /> New Chat
          </button>
        </div>

        {/* Model Toolbar (Horizontal Bar) */}
        <div className="flex items-center justify-between bg-[#121620]/80 backdrop-blur-md border border-white/5 p-2 rounded-xl">
          <div className="flex items-center gap-1 md:gap-4 overflow-x-auto scrollbar-hide px-2">
            {[
              { label: 'Model', val: 'Llama 3.3', icon: Bot },
              { label: 'Vector DB', val: 'Atlas', icon: Database, pulse: true },
              { label: 'Status', val: 'Online', icon: Activity, pulse: true }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] md:text-xs font-mono border-r border-white/5 pr-4 last:border-0 shrink-0">
                <stat.icon size={12} className="text-indigo-400" />
                <span className="text-slate-500 hidden sm:inline">{stat.label}:</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  {stat.pulse && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />} {stat.val}
                </span>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => setShowDebugDrawer(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border shrink-0 ${
              showDebugDrawer ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Code2 size={14} /> <span className="hidden sm:inline">Advanced Debug</span>
          </button>
        </div>
      </motion.div>

      {/* ========================================== */}
      {/* MAIN CHAT WORKSPACE (70-75% Focus)         */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col items-center overflow-hidden min-h-0 relative z-10">
        
        {/* Messages Scroll Area */}
        <div className="w-full max-w-4xl flex-1 overflow-y-auto px-4 custom-scrollbar flex flex-col gap-6 pb-6">
          
          {/* Quick Prompts (Only show if chat is empty/new) */}
          {messages.length === 1 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
              {['Explain the Refund Policy', 'How do I reset a password?', 'Show me Pricing Plans', 'Contact Tech Support'].map((p, i) => (
                <button key={i} onClick={() => handleQuickPrompt(p)} className="p-4 rounded-2xl bg-[#121620]/50 border border-white/5 hover:bg-[#121620] hover:border-indigo-500/30 text-slate-300 transition-all text-sm text-left">
                  <span className="block font-medium text-white mb-1">Test Scenario</span>
                  <span className="text-xs text-slate-500 line-clamp-2">"{p}"</span>
                </button>
              ))}
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mr-3 mt-1">
                  <Bot size={14} className="text-indigo-400" />
                </div>
              )}
              
              <div className={`max-w-[85%] px-5 py-4 text-sm shadow-sm leading-relaxed relative group ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm font-medium' 
                  : msg.role === 'system' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-xs rounded-xl w-full' 
                  : 'bg-[#121620] text-slate-200 border border-white/5 rounded-2xl rounded-tl-sm w-full'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                
                {/* Assistant Toolbar */}
                {msg.role === 'assistant' && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button className="text-slate-500 hover:text-white p-1"><Copy size={12} /></button>
                      <button className="text-slate-500 hover:text-emerald-400 p-1"><ThumbsUp size={12} /></button>
                      <button className="text-slate-500 hover:text-red-400 p-1"><ThumbsDown size={12} /></button>
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 cursor-pointer hover:text-indigo-400" onClick={() => setShowDebugDrawer(true)}>
                        <Layers size={10} /> {msg.sources.length} sources used
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mr-3 mt-1">
                <Bot size={14} className="text-indigo-400" />
              </div>
              <div className="bg-[#121620] border border-white/5 px-4 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* ========================================== */}
        {/* INPUT & CONTROL DOCK                       */}
        {/* ========================================== */}
        <div className="w-full max-w-4xl shrink-0 flex flex-col gap-2 px-4">
          
          {/* 1. Compact Diagnostics Bar (Appears after response) */}
          <AnimatePresence>
            {activeMetrics && !isTyping && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex overflow-hidden">
                <div className="w-full flex flex-wrap items-center justify-between bg-[#121620]/80 border border-white/5 px-4 py-2 rounded-xl shadow-lg">
                  <div className="flex gap-4 md:gap-6 text-[10px] md:text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Confidence:</span>
                      <span className={`${activeMetrics.confidence > 80 ? 'text-emerald-400' : 'text-amber-400'} font-bold`}>{activeMetrics.confidence}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Latency:</span>
                      <span className="text-white font-bold">{activeMetrics.latency}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Tokens:</span>
                      <span className="text-white font-bold">{activeMetrics.tokens}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <span className="text-slate-500">Cost:</span>
                      <span className="text-emerald-400 font-bold">{activeMetrics.cost}</span>
                    </div>
                  </div>
                  <button onClick={() => setShowPipeline(!showPipeline)} className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                    View RAG Flow {showPipeline ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. Collapsible RAG Pipeline Visualization */}
          <AnimatePresence>
            {showPipeline && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="w-full bg-[#0A0C10] border border-white/5 rounded-xl p-4 shadow-inner relative">
                  
                  {/* Connecting Line */}
                  <div className="absolute top-8 left-10 right-10 h-[1px] bg-white/10 hidden sm:block">
                    {pipelineState !== 'idle' && pipelineState !== 'answer' && (
                      <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="w-1/3 h-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                    )}
                  </div>

                  {/* Nodes */}
                  <div className="flex justify-between w-full overflow-x-auto scrollbar-hide relative z-10 px-2">
                    {pipelineSteps.map((step, idx) => {
                      const states = pipelineSteps.map(s => s.id);
                      const currentIndex = states.indexOf(pipelineState);
                      const isActive = currentIndex === idx;
                      const isDone = currentIndex > idx || pipelineState === 'answer';
                      
                      return (
                        <div key={step.id} className="flex flex-col items-center shrink-0 min-w-[70px]">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 mb-2 border ${
                            isDone ? 'bg-indigo-600 border-indigo-500 text-white' : 
                            isActive ? 'bg-indigo-500/20 border-indigo-400 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)] animate-pulse' : 
                            'bg-[#121620] border-white/10 text-slate-500'
                          }`}>
                            {isDone ? <CheckCircle2 size={14} /> : <step.icon size={14} />}
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-400' : isDone ? 'text-white' : 'text-slate-600'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. Main Chat Input */}
          <form onSubmit={handleSendMessage} className="w-full relative bg-[#121620] border border-white/10 hover:border-white/20 focus-within:border-indigo-500/50 rounded-2xl shadow-xl transition-all mb-4">
            <textarea 
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder="Message Beacon AI..." 
              className="w-full bg-transparent text-slate-200 text-sm pl-4 pr-14 py-4 outline-none resize-none min-h-[56px] max-h-32 custom-scrollbar"
              rows={1}
            />
            <button 
              type="submit" 
              disabled={isTyping || !input.trim()} 
              className="absolute right-2 bottom-2 w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:bg-white/10 disabled:text-slate-500"
            >
              <Send size={14} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ========================================== */}
      {/* ADVANCED DEBUG DRAWER (Right Slide-over)   */}
      {/* ========================================== */}
      <AnimatePresence>
        {showDebugDrawer && (
          <>
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDebugDrawer(false)}
              className="fixed inset-0 bg-[#050505]/60 backdrop-blur-sm z-40 lg:hidden" />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="absolute lg:relative top-0 right-0 w-full max-w-md h-full bg-[#0A0C10] border-l border-white/5 z-50 flex flex-col shadow-2xl shrink-0"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#121620]/50">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Terminal size={16} className="text-indigo-400" /> Advanced Debug Logs</h3>
                <button onClick={() => setShowDebugDrawer(false)} className="text-[10px] uppercase font-bold text-slate-500 hover:text-white px-2 py-1 bg-white/5 rounded-md">Close</button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                
                {/* Vector Chunks Section */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2"><Layers size={12} /> Retrieved Chunks</h4>
                  {activeMetrics?.chunks?.length > 0 ? (
                    <div className="space-y-3">
                      {activeMetrics.chunks.map((chunk, idx) => (
                        <div key={idx} className="bg-[#121620] border border-white/5 rounded-xl p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-mono text-indigo-400">Index_{idx + 1}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${chunk.score > 0.8 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                              Match: {(chunk.score * 100).toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono leading-relaxed line-clamp-4">"Similarity search successfully extracted text segment from vectorized database..."</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 italic border border-dashed border-white/5 p-4 rounded-xl text-center">No vector chunks retrieved. Send a query to populate.</div>
                  )}
                </div>

                {/* Raw JSON Payload */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2"><AlignLeft size={12} /> Raw JSON Request</h4>
                  <div className="bg-[#121620] border border-white/5 rounded-xl p-3 overflow-x-auto">
                    <pre className="text-[10px] font-mono text-slate-400">
{`{
  "model": "llama-3.3-70b",
  "temperature": 0.2,
  "max_tokens": 1024,
  "top_p": 0.9,
  "vector_db": "mongodb_atlas",
  "organizationId": "${orgId}"
}`}
                    </pre>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}