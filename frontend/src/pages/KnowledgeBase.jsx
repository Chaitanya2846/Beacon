import React, { useState, useEffect, useRef } from 'react';

export default function KnowledgeBase({ orgId }) {
  // --- KEEP YOUR EXISTING STATE ---
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: null, message: '' });

  // --- KEEP YOUR EXACT EXISTING EFFECT & UPLOAD HANDLERS ---
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

  const handleDropzoneClick = () => {
    if (!isUploading) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('organizationId', orgId);

    try {
      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to upload document.');

      setUploadStatus({ type: 'success', message: 'Document ingested and vectorized successfully!' });
      const newDoc = {
        id: `doc_${Date.now()}`,
        name: file.name,
        status: "SUCCESS",
        date: new Date().toISOString().split('T')[0]
      };
      setDocuments(prev => [newDoc, ...prev]);
    } catch (error) {
      setUploadStatus({ type: 'error', message: error.message });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm p-8 flex flex-col h-full">
      <div className="mb-8">
        <p className="text-slate-500">Upload and synchronize organizational manuals and policies into the vector database.</p>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.txt" />

      <div onClick={handleDropzoneClick} className={`border-2 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center transition-all mb-4 ${isUploading ? 'bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-indigo-300 cursor-pointer group'}`}>
        <div className={`w-16 h-16 rounded-full shadow-sm border flex items-center justify-center mb-4 transition-transform ${isUploading ? 'bg-slate-100 border-slate-200 animate-pulse' : 'bg-white border-slate-100 group-hover:scale-110'}`}>
          {isUploading ? (
            <svg className="w-8 h-8 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
          )}
        </div>
        <button disabled={isUploading} className="bg-slate-900 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-md pointer-events-none">
          {isUploading ? "Uploading Document..." : "Select File to Upload"}
        </button>
        <p className="text-xs text-slate-400 mt-4 font-medium">Supports PDF, DOCX, and TXT (Max 10MB)</p>
      </div>

      {uploadStatus.message && (
        <div className={`mb-6 p-3 text-sm rounded-xl font-medium flex items-center gap-2 ${uploadStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {uploadStatus.message}
        </div>
      )}

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
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}