import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

// ==========================================
// COMPONENT 1: KNOWLEDGE BASE MANAGER
// ==========================================
const KnowledgeBaseManager = ({ orgId }) => {
  const fileInputRef = useRef(null);
  
  // Start with an empty array instead of dummy data
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: null, message: '' });

  // Fetch documents on mount (Persists PDFs across refreshes)
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!orgId || orgId === "No Org Linked") return;
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/ai/documents/${orgId}`);
        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };
    fetchDocuments();
  }, [orgId]);

  // Triggers the hidden file input
  const handleDropzoneClick = () => {
    if (!isUploading) {
      fileInputRef.current.click();
    }
  };

  // Handles the actual file selection and API call
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    // 1. Package the file and orgId for the backend
    const formData = new FormData();
    formData.append('file', file);
    formData.append('organizationId', orgId);

    try {
      // 2. Send to Node.js backend (Port 5000)
      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        body: formData // Note: fetch automatically sets the correct multipart headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document.');
      }

      // 3. Handle Success: Show message and add file to the local table
      setUploadStatus({ type: 'success', message: 'Document ingested and vectorized successfully!' });
      
      const newDoc = {
        id: `doc_${Date.now()}`,
        name: file.name,
        status: "COMPLETED",
        date: new Date().toISOString().split('T')[0]
      };
      setDocuments(prev => [newDoc, ...prev]);

    } catch (error) {
      console.error("Upload Error:", error);
      setUploadStatus({ type: 'error', message: error.message });
    } finally {
      setIsUploading(false);
      // Reset the input so the user can upload the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <section className="lg:col-span-7 bg-white border border-slate-200 rounded-[2rem] shadow-sm p-8 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Knowledge Base</h2>
        <p className="text-slate-500">Upload and synchronize organizational manuals and policies into the vector database.</p>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.docx,.txt"
      />

      {/* Upload Dropzone */}
      <div 
        onClick={handleDropzoneClick}
        className={`border-2 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center transition-all mb-4
          ${isUploading ? 'bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-indigo-300 cursor-pointer group'}
        `}
      >
        <div className={`w-16 h-16 rounded-full shadow-sm border flex items-center justify-center mb-4 transition-transform
          ${isUploading ? 'bg-slate-100 border-slate-200 animate-pulse' : 'bg-white border-slate-100 group-hover:scale-110'}
        `}>
          {isUploading ? (
            <svg className="w-8 h-8 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
          )}
        </div>
        
        <button 
          disabled={isUploading}
          className="bg-slate-900 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-md pointer-events-none"
        >
          {isUploading ? "Uploading Document..." : "Select File to Upload"}
        </button>
        <p className="text-xs text-slate-400 mt-4 font-medium">Supports PDF, DOCX, and TXT (Max 10MB)</p>
      </div>

      {/* Status Messages */}
      {uploadStatus.message && (
        <div className={`mb-6 p-3 text-sm rounded-xl font-medium flex items-center gap-2
          ${uploadStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}
        `}>
          {uploadStatus.type === 'success' ? (
             <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          ) : (
             <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          )}
          {uploadStatus.message}
        </div>
      )}

      {/* Document Table */}
      <div className="flex-1 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Indexed Documents</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500">
                <th className="pb-3 pl-2">Document Name</th>
                <th className="pb-3">Added Date</th>
                <th className="pb-3 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 pl-2 font-medium text-slate-700 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                    </div>
                    {doc.name}
                  </td>
                  <td className="py-4 text-slate-500 font-mono text-xs">{doc.date}</td>
                  <td className="py-4 pr-2 text-right">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// COMPONENT 2: INTERACTIVE CHAT PLAYGROUND
// ==========================================
const ChatPlayground = ({ orgId }) => {
  // Chat resets to this default greeting on every page load/refresh
  const [messages, setMessages] = useState([
    { role: 'system', text: 'Hello! I am your AI Knowledge Base assistant. Ask me anything based on your uploaded documentation.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
    <section className="lg:col-span-5 bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col h-[750px]">
      
      {/* Chat Header */}
      <div className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 p-5 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Agent Playground</h2>
            <p className="text-xs text-slate-500 font-medium">Test your RAG Pipeline</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 border border-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full">Gemini Flash</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] px-5 py-4 text-sm shadow-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm font-medium' 
                : msg.role === 'system' 
                ? 'bg-amber-50 text-amber-900 border border-amber-200 font-mono text-xs rounded-xl' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100/50">
                  <p className="font-bold uppercase tracking-wider text-[9px] text-slate-400 mb-2">Vector Matches</p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, sIdx) => (
                      <span key={sIdx} className="bg-slate-100 border border-slate-200 text-slate-500 px-2 py-1 rounded-md font-mono text-[10px]">
                        id:{src.id.slice(-6)} <span className="text-indigo-500 font-bold">({Math.round(src.score * 100)}%)</span>
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
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
               <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="bg-white border border-slate-200 px-4 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t border-slate-100 z-10">
        <form onSubmit={handleSendMessage} className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query your organization's data..." 
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
          <button 
            type="submit"
            disabled={isTyping}
            className="absolute right-2 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>
    </section>
  );
};

// ==========================================
// COMPONENT 3: MAIN DASHBOARD WRAPPER
// ==========================================
export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const orgId = user?.organizationId || "No Org Linked";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased pb-12">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 sticky top-0 z-50 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none text-slate-900">Workspace Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Tenant ID: <span className="font-mono text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">{orgId}</span></p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-700">System Online</span>
          </div>
          
          <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Platform Admin</p>
            </div>
            <button 
              onClick={logout}
              className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace Grid */}
      <div className="max-w-[1600px] mx-auto px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <KnowledgeBaseManager orgId={orgId} />
          <ChatPlayground orgId={orgId} />
        </div>
      </div>

    </div>
  );
}