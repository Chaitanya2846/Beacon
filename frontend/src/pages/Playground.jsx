import React, { useState, useEffect, useRef } from 'react';

export default function Playground({ orgId }) {
  // --- KEEP YOUR EXACT EXISTING STATE ARCHITECTURE ---
  const [messages, setMessages] = useState([
    { role: 'system', text: 'Hello! I am your AI Knowledge Base assistant. Ask me anything based on your uploaded documentation.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId, question: input })
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.answer, sources: data.sources_used }]);
      } else {
        throw new Error(data.detail || "Failed to fetch response");
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'system', text: `Error: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col h-[680px] max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] px-5 py-4 text-sm shadow-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm font-medium' : msg.role === 'system' ? 'bg-amber-50 text-amber-900 border border-amber-200 font-mono text-xs rounded-xl' : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100/50">
                  <p className="font-bold uppercase tracking-wider text-[9px] text-slate-400 mb-2">Sources Referenced</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((src, sIdx) => (
                      <span key={sIdx} className="bg-slate-50 border border-slate-200 shadow-sm text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-medium flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Doc Snippet {sIdx + 1} 
                        <span className={`font-bold ${src.score > 0.8 ? 'text-emerald-500' : 'text-amber-500'}`}>({Math.round(src.score * 100)}% Match)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-4 opacity-70">
            <div className="bg-white border border-slate-200 px-4 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-5 bg-white border-t border-slate-100 z-10 relative flex items-center">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Query your organization's data..." className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"/>
        <button type="submit" disabled={isTyping} className="absolute right-7 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 hover:scale-105 transition-all disabled:opacity-50">
          <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </form>
    </div>
  );
}