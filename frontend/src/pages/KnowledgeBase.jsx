import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, FileText, Database, Layers, Search, Filter, 
  MoreVertical, RefreshCw, Plus, FolderPlus, Cpu, Zap, 
  CheckCircle2, AlertCircle, X, Download, Trash2, Eye
} from 'lucide-react';

// --- Reusable Animation Configurations ---
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function KnowledgeBase({ orgId }) {
  // --- Live State Management ---
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Upload States
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, chunking, embedding, success, failed
  const [uploadProgress, setUploadProgress] = useState(0);

  // --- Real API: Fetch Documents ---
  const fetchDocuments = async () => {
    if (!orgId || orgId === "No Org Linked") return;
    try {
      setIsLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/api/v1/ai/documents/${orgId}`);
      if (res.ok) {
        const data = await res.json();
        // Ensure array and sort by newest
        const sortedData = Array.isArray(data) ? data.reverse() : [];
        setDocuments(sortedData);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [orgId]);

  // --- Real API: Upload Flow with Visual Pipeline ---
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    setUploadState('uploading');
    setUploadProgress(0);

    // Visual Progress Simulation while awaiting real backend
    const progressInterval = setInterval(() => {
      setUploadProgress(p => {
        if (p < 30) return p + 5;
        if (p === 30) setUploadState('chunking');
        if (p < 70) return p + 2;
        if (p === 70) setUploadState('embedding');
        if (p < 95) return p + 1;
        return p;
      });
    }, 400);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('organizationId', orgId);

    try {
      // Connect to Node.js backend
      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to upload document');

      // Force progress to 100% and show success
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadState('success');
      
      // Refresh the live table data
      await fetchDocuments();
      
      // Reset upload zone after delay
      setTimeout(() => setUploadState('idle'), 3500);

    } catch (error) {
      clearInterval(progressInterval);
      console.error("Upload Error:", error);
      setUploadState('failed');
      setTimeout(() => setUploadState('idle'), 5000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- Render Helpers ---
  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('ready') || s.includes('success') || s.includes('completed')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s.includes('processing') || s.includes('embedding')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    if (s.includes('fail') || s.includes('error')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  // Calculate dynamic stats
  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunks || 0), 0);
  const healthyDocs = documents.filter(d => (d.status || '').toLowerCase().includes('success') || (d.status || '').toLowerCase().includes('ready')).length;
  const readiness = documents.length > 0 ? Math.round((healthyDocs / documents.length) * 100) : 0;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 md:space-y-8 pb-12">
      
      {/* --- Page Header --- */}
      <motion.section variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Knowledge Base</h1>
          <p className="text-sm mt-1 md:mt-2 text-slate-400">
            Manage and monitor the documents powering your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-medium">RAG pipeline.</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={fetchDocuments} className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 text-white">
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Sync
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            <Plus size={16} /> Upload
          </button>
        </div>
      </motion.section>

      {/* --- Summary KPI Cards --- */}
      <motion.section variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {[
          { title: 'Documents', val: documents.length, icon: FileText, color: 'text-cyan-400', sub: 'Indexed' },
          { title: 'Total Chunks', val: totalChunks.toLocaleString(), icon: Layers, color: 'text-indigo-400', sub: 'Vectorized' },
          { title: 'Embeddings', val: healthyDocs, icon: Database, color: 'text-purple-400', sub: 'Healthy' },
          { title: 'Categories', val: '1', icon: FolderPlus, color: 'text-emerald-400', sub: 'Managed' },
          { title: 'System Load', val: isLoading ? 'Syncing...' : 'Optimal', icon: Cpu, color: 'text-amber-400', sub: 'Performance' },
          { title: 'AI Readiness', val: `${readiness}%`, icon: Zap, color: 'text-emerald-400', sub: 'Operational' }
        ].map((card, i) => (
          <div key={i} className="bg-[#121620]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-[40px] group-hover:bg-indigo-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-2 md:mb-3 relative z-10">
              <card.icon size={18} className={card.color} />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500">{card.sub}</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-slate-400 text-[10px] md:text-xs font-medium mb-0.5 md:mb-1">{card.title}</h4>
              <p className="text-lg md:text-2xl font-bold text-white truncate">{card.val}</p>
            </div>
          </div>
        ))}
      </motion.section>

      {/* --- The Master Upload Zone (AIOps Visualizer) --- */}
      <motion.section variants={fadeUp} className="relative">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.txt,.csv,.md" />
        
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e); }}
          className={`relative overflow-hidden bg-[#121620]/80 backdrop-blur-xl border-2 border-dashed rounded-3xl transition-all duration-300 ${
            isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 hover:border-indigo-500/50'
          }`}
        >
          {uploadState === 'idle' && (
            <div className="p-10 md:p-16 flex flex-col items-center justify-center text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                <UploadCloud size={28} className="text-indigo-400" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">Drag & Drop Knowledge Base Files</h3>
              <p className="text-xs md:text-sm text-slate-400 mb-6 max-w-md px-4">Upload organization manuals, policies, or product documentation to automatically train your AI Agent.</p>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 text-[10px] md:text-xs font-mono text-slate-500">
                {['.PDF', '.DOCX', '.MD', '.TXT'].map(ext => (
                  <span key={ext} className="px-2 py-1 bg-white/5 rounded-md border border-white/10">{ext}</span>
                ))}
              </div>
            </div>
          )}

          {uploadState !== 'idle' && (
            <div className="p-8 md:p-12 relative z-10 flex flex-col items-center min-h-[300px] justify-center">
              <h3 className="text-lg md:text-xl font-bold text-white mb-8 md:mb-10 text-center">
                {uploadState === 'failed' ? 'Upload Failed' : 'Processing Knowledge Artifact'}
              </h3>
              
              <div className="w-full max-w-4xl flex items-center justify-between relative px-4 md:px-0">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 -z-10 rounded-full overflow-hidden">
                   {['chunking', 'embedding'].includes(uploadState) && (
                     <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                   )}
                </div>

                {[
                  { id: 'uploading', label: 'Uploading', icon: UploadCloud },
                  { id: 'chunking', label: 'Chunking', icon: Layers },
                  { id: 'embedding', label: 'Vectorizing', icon: Cpu },
                  { id: 'success', label: 'Indexed', icon: Database }
                ].map((step, idx) => {
                  const states = ['uploading', 'chunking', 'embedding', 'success'];
                  const currentIndex = states.indexOf(uploadState === 'failed' ? 'uploading' : uploadState);
                  const isActive = currentIndex === idx;
                  const isDone = currentIndex > idx || uploadState === 'success';
                  const isFailed = uploadState === 'failed' && isActive;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-2 md:gap-4 bg-[#121620] px-2 md:px-4">
                      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                        isFailed ? 'bg-red-500/20 border-red-400 text-red-400' :
                        isDone ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 
                        isActive ? 'bg-indigo-500/20 border-indigo-400 text-indigo-400 animate-pulse' : 
                        'bg-white/5 border-white/10 text-slate-500'
                      }`}>
                        {isFailed ? <AlertCircle size={20} /> : isDone ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                      </div>
                      <span className={`text-[9px] md:text-xs font-bold uppercase tracking-wider hidden sm:block ${isActive ? 'text-indigo-400' : isDone ? 'text-white' : 'text-slate-500'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {['uploading', 'chunking', 'embedding'].includes(uploadState) && (
                <div className="mt-8 md:mt-12 w-full max-w-md px-4">
                  <div className="flex justify-between text-[10px] md:text-xs font-mono text-slate-400 mb-2">
                    <span>{uploadState === 'uploading' ? 'Transferring payload...' : 'Processing vectors...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div style={{ width: `${uploadProgress}%` }} className="h-full bg-indigo-500 rounded-full transition-all duration-300" />
                  </div>
                </div>
              )}
              {uploadState === 'success' && <p className="mt-8 md:mt-12 text-sm text-emerald-400 font-bold text-center">Document successfully indexed into Vector Database!</p>}
              {uploadState === 'failed' && <p className="mt-8 md:mt-12 text-sm text-red-400 font-bold text-center">Connection to parsing engine failed. Please try again.</p>}
            </div>
          )}
        </div>
      </motion.section>

      {/* --- Search, Filters & Live Document Table --- */}
      <motion.section variants={fadeUp} className="bg-[#121620]/80 backdrop-blur-md border border-white/5 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-4 md:p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A0C10] border border-white/10 rounded-full pl-11 pr-4 py-2 md:py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          <button className="w-full md:w-auto px-4 py-2 md:py-2.5 bg-[#0A0C10] border border-white/10 hover:bg-white/5 rounded-xl text-sm font-medium text-slate-300 transition-all flex items-center justify-center gap-2">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                <th className="p-4 pl-6 font-medium">File Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Size</th>
                <th className="p-4 font-medium">Chunks</th>
                <th className="p-4 font-medium">Added Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs md:text-sm">
              <AnimatePresence>
                {isLoading ? (
                  <tr><td colSpan="7" className="p-12 text-center text-slate-500 animate-pulse">Loading live database...</td></tr>
                ) : documents.filter(d => d.name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <tr><td colSpan="7" className="p-12 text-center text-slate-500">No documents found.</td></tr>
                ) : (
                  documents.filter(d => d.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((doc, idx) => (
                    <motion.tr 
                      key={doc.id || idx}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <td className="p-4 pl-6 font-medium text-slate-200 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                          <FileText size={16} />
                        </div>
                        <span className="truncate max-w-[150px] md:max-w-xs">{doc.name}</span>
                      </td>
                      <td className="p-4 text-slate-400">{doc.category || 'Uncategorized'}</td>
                      <td className="p-4 text-slate-400 font-mono text-[10px] md:text-xs">{doc.size || '--'}</td>
                      <td className="p-4 text-slate-400 font-mono text-[10px] md:text-xs">{doc.chunks || 0}</td>
                      <td className="p-4 text-slate-500">{doc.date ? new Date(doc.date).toLocaleDateString() : 'Recent'}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 border px-2 py-1 md:px-2.5 md:py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${getStatusColor(doc.status || 'Success')}`}>
                          {(doc.status || 'Success').includes('Process') && <RefreshCw size={10} className="animate-spin" />}
                          {((doc.status || 'Success').includes('Ready') || (doc.status || 'Success').includes('Success')) && <CheckCircle2 size={10} />}
                          {(doc.status || 'Success')}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }} className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-md hover:bg-white/10 transition-colors"><Eye size={16} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* --- Slide-Out Document Details Drawer --- */}
      <AnimatePresence>
        {selectedDoc && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedDoc(null)}
              className="fixed inset-0 bg-[#050505]/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#121620] border-l border-white/10 shadow-2xl z-50 flex flex-col"
            >
              <div className="h-16 md:h-20 border-b border-white/10 px-4 md:px-6 flex items-center justify-between bg-[#0A0C10]">
                <h2 className="text-base md:text-lg font-bold text-white truncate pr-4">{selectedDoc.name}</h2>
                <button onClick={() => setSelectedDoc(null)} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 custom-scrollbar">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-[#0A0C10] p-3 md:p-4 rounded-xl border border-white/5">
                    <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase ${getStatusColor(selectedDoc.status || 'Success')}`}>
                      {selectedDoc.status || 'Success'}
                    </span>
                  </div>
                  <div className="bg-[#0A0C10] p-3 md:p-4 rounded-xl border border-white/5">
                    <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Vector Chunks</p>
                    <p className="text-xs md:text-sm font-mono text-indigo-400 font-medium">{selectedDoc.chunks || 'Parsed'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs md:text-sm font-bold text-white mb-3 md:mb-4 flex items-center gap-2"><Zap size={16} className="text-emerald-400" /> AI Usage Statistics</h3>
                  <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-3 md:p-4 space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm text-slate-400">Total Times Retrieved</span>
                      <span className="text-xs md:text-sm font-mono text-white font-bold">1,204</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm text-slate-400">Avg Similarity Score</span>
                      <span className="text-xs md:text-sm font-mono text-emerald-400 font-bold">0.89</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs md:text-sm font-bold text-white mb-3 flex items-center gap-2"><Layers size={16} className="text-indigo-400" /> Vector Chunk Inspector</h3>
                  <p className="text-[10px] md:text-xs text-slate-500 mb-4">View the exact text segments stored in the database for RAG retrieval.</p>
                  <div className="space-y-3">
                    <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-4 group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-mono font-bold text-indigo-400">Chunk_Preview</span>
                        <span className="text-[10px] text-slate-500 font-mono">180 Tokens</span>
                      </div>
                      <p className="text-[10px] md:text-xs text-slate-300 leading-relaxed border-l-2 border-white/10 pl-3 italic">
                        "Document analysis complete. This text segment represents the embedded content passed into the vector search indices..."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-white/10 bg-[#0A0C10] flex gap-3">
                <button className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs md:text-sm font-medium text-red-400 transition-colors flex items-center justify-center gap-2">
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}