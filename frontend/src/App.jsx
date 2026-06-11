import React, { useState } from 'react';

export default function App() {
  // --- Admin States ---
  const [documents, setDocuments] = useState([
    { id: "doc_01", name: "Novatra_1.0_Guidelines.pdf", status: "COMPLETED", date: "2026-06-11" },
    { id: "doc_02", name: "Tourist_Safety_FAQ.pdf", status: "COMPLETED", date: "2026-06-10" }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [orgId] = useState("666b3c9f2f81a7b4c8d9e0f1"); // Your working test ID

  // --- Chat States ---
  const [messages, setMessages] = useState([
    { role: 'system', text: 'Hello! I am your AI Knowledge Base assistant. Ask me anything based on your uploaded documentation.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // --- Simulating Document Upload ---
  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newDoc = {
        id: `doc_${Date.now()}`,
        name: `User_Manual_${Math.floor(Math.random() * 100)}.pdf`,
        status: "COMPLETED",
        date: new Date().toISOString().split('T')[0]
      };
      setDocuments(prev => [newDoc, ...prev]);
      setIsUploading(false);
    }, 2000);
  };

  // --- Sending Message to FastAPI Chat Endpoint ---
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
        body: JSON.stringify({
          organizationId: orgId,
          question: input
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: data.answer,
          sources: data.sources_used 
        }]);
      } else {
        throw new Error(data.detail || "Failed to fetch response");
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'system', 
        text: `Error connecting to AI Service: ${error.message}. Make sure FastAPI is running on port 8000.` 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#1a1a1a] font-sans antialiased p-8">
      {/* Header */}
      <header className="border-b-2 border-[#1a1a1a] pb-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI SUPPORT PLATFORM</h1>
          <p className="text-sm text-gray-500 mt-1">Workspace Org ID: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{orgId}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wider uppercase">FastAPI Core Connected</span>
        </div>
      </header>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Admin Knowledge Base Dashboard */}
        <section className="lg:col-span-7 border-2 border-[#1a1a1a] bg-white p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4">Knowledge Base Manager</h2>
          <p className="text-sm text-gray-600 mb-6">Upload and synchronize organizational reference manuals, policies, and files into the vector database.</p>

          <div className="border-2 border-dashed border-[#1a1a1a] p-8 text-center bg-[#fafafa] mb-6 flex flex-col items-center justify-center">
            <svg className="w-8 h-8 text-gray-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <button 
              onClick={handleSimulatedUpload}
              disabled={isUploading}
              className="bg-[#1a1a1a] text-white text-xs font-bold tracking-widest uppercase px-4 py-2 hover:bg-gray-800 transition disabled:opacity-50"
            >
              {isUploading ? "Processing Vectors..." : "Simulate Document Upload"}
            </button>
            <p className="text-xs text-gray-400 mt-2">Supports PDF file extraction directly to memory</p>
          </div>

          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Indexed Documents</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#1a1a1a] text-xs font-bold text-gray-500 uppercase">
                  <th className="pb-2">Document Name</th>
                  <th className="pb-2">Added Date</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                      {doc.name}
                    </td>
                    <td className="py-3 text-gray-500 font-mono text-xs">{doc.date}</td>
                    <td className="py-3 text-right">
                      <span className="inline-block bg-green-100 text-green-800 font-mono text-xs font-bold px-2 py-0.5 rounded">
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* RIGHT COLUMN: Interactive Chat Playground */}
        <section className="lg:col-span-5 border-2 border-[#1a1a1a] bg-white shadow-[4px_4px_0px_0px_#1a1a1a] h-[600px] flex flex-col">
          <div className="border-b-2 border-[#1a1a1a] p-4 bg-[#fafafa] flex justify-between items-center">
            <h2 className="font-bold uppercase tracking-wide text-sm">Agent Playground (RAG)</h2>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">Gemini 2.5 Flash</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm border border-[#1a1a1a] ${
                  msg.role === 'user' 
                    ? 'bg-[#1a1a1a] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]' 
                    : msg.role === 'system' 
                    ? 'bg-amber-50 text-amber-900 border-amber-300 font-mono text-xs' 
                    : 'bg-white text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                      <p className="font-bold uppercase tracking-wider text-[10px] text-gray-400 mb-1">Vector Matches:</p>
                      <div className="flex flex-wrap gap-1">
                        {msg.sources.map((src, sIdx) => (
                          <span key={sIdx} className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[10px]">
                            id: ...{src.id.slice(-6)} ({Math.round(src.score * 100)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-1.5 text-gray-400 text-xs font-mono p-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="border-t-2 border-[#1a1a1a] p-3 bg-white flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your knowledge base..." 
              className="flex-1 border border-[#1a1a1a] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button 
              type="submit"
              disabled={isTyping}
              className="bg-[#1a1a1a] text-white font-bold text-xs uppercase tracking-wider px-4 py-2 hover:bg-gray-800 transition disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}