import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  Gauge,
  Layers,
  Maximize2,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  Tags,
  Trash2,
  UploadCloud,
  X,
  Zap,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
const fileTypes = ['PDF', 'DOCX', 'TXT', 'MD'];
const statuses = ['COMPLETED', 'PROCESSING', 'PENDING', 'FAILED'];
const uploadSteps = ['uploading', 'extracting', 'embedding', 'indexing'];

const formatFileSize = (bytes) => {
  if (!bytes) return '--';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

const formatDate = (value) => {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const compactNumber = (value) => new Intl.NumberFormat(undefined, { notation: 'compact' }).format(value || 0);

const normalizeDocument = (doc, index) => {
  const name = doc.name || doc.file_name || doc.fileName || `Document ${index + 1}`;
  const ext = (name.split('.').pop() || doc.type || 'PDF').toUpperCase();
  const status = doc.status || 'PENDING';
  const score = Number(doc.averageScore || doc.average_score || 0);

  return {
    ...doc,
    id: doc.id || doc._id || `${name}-${index}`,
    documentId: doc.documentId || doc.document_id || doc.id,
    name,
    category: doc.category || 'Uncategorized',
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    type: ['PDF', 'DOCX', 'TXT', 'MD', 'MARKDOWN'].includes(ext) ? (ext === 'MARKDOWN' ? 'MD' : ext) : 'PDF',
    size: doc.size || doc.file_size || formatFileSize(doc.sizeBytes),
    pages: doc.pages || doc.page_count || 0,
    chunks: Number(doc.chunks || doc.chunk_count || 0),
    embeddings: Number(doc.embeddings || doc.embedding_count || 0),
    embeddingStatus: doc.embeddingStatus || doc.embedding_status || (status === 'FAILED' ? 'FAILED' : status === 'PENDING' ? 'PENDING' : 'GENERATED'),
    embeddingModel: doc.embeddingModel || '--',
    generatedDate: doc.generatedDate,
    uploadDate: doc.uploadDate || doc.createdAt || doc.date,
    lastUpdated: doc.lastUpdated || doc.updatedAt || doc.uploadDate || doc.date,
    usageCount: Number(doc.usageCount || doc.usage_count || 0),
    averageScore: score,
    confidence: Number(doc.confidence || 0).toFixed(1),
    lastRetrieved: doc.lastRetrieved,
    status,
    errorReason: doc.error_log || doc.errorReason || '',
    aiResponses: Number(doc.aiResponses || 0)
  };
};

const statusClass = (status = '') => {
  const normalized = status.toLowerCase();
  if (normalized.includes('complete') || normalized.includes('success') || normalized.includes('generated')) {
    return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
  }
  if (normalized.includes('process') || normalized.includes('pending') || normalized.includes('index')) {
    return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
  }
  if (normalized.includes('fail') || normalized.includes('error')) {
    return 'bg-red-500/10 text-red-300 border-red-500/20';
  }
  return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
};

function ToastStack({ toasts, dismissToast }) {
  return (
    <div className="fixed bottom-5 right-5 z-[70] space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className={`w-80 max-w-[calc(100vw-2rem)] rounded-xl border p-4 shadow-2xl backdrop-blur-xl ${toast.type === 'error' ? 'border-red-500/20 bg-red-950/80 text-red-100' : 'border-emerald-500/20 bg-emerald-950/80 text-emerald-100'}`}
          >
            <div className="flex items-start gap-3">
              {toast.type === 'error' ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="mt-0.5 text-xs opacity-75">{toast.message}</p>
              </div>
              <button onClick={() => dismissToast(toast.id)} className="rounded-md p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.06] ${className}`} />;
}

function CountUpValue({ value, suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = Number(value) || 0;

  useEffect(() => {
    const duration = 650;
    const startedAt = performance.now();
    const frame = requestAnimationFrame(function tick(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      setDisplayValue(Math.round(numericValue * progress));
      if (progress < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [numericValue]);

  return <>{compactNumber(displayValue)}{suffix}</>;
}

function MetricCard({ icon: Icon, label, value, detail, tone = 'text-indigo-300', tooltip, suffix = '' }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      title={tooltip}
      className="group flex min-h-[132px] flex-col justify-between rounded-xl border border-white/10 bg-[#121620]/85 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-colors hover:border-indigo-400/30 hover:bg-[#151b28]"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition group-hover:scale-105">
          <Icon size={18} className={tone} />
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{detail}</span>
      </div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 truncate text-2xl font-bold text-white">
        {typeof value === 'number' ? <CountUpValue value={value} suffix={suffix} /> : value}
      </p>
    </motion.div>
  );
}

function SelectControl({ icon: Icon, value, onChange, options, label }) {
  return (
    <label className="relative flex min-w-0 flex-1 items-center">
      <Icon size={15} className="pointer-events-none absolute left-3 text-slate-500" />
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-white/10 bg-[#0A0C10] pl-9 pr-8 text-xs font-medium text-slate-300 outline-none transition focus:border-indigo-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 text-slate-500" />
    </label>
  );
}

export default function KnowledgeBase({ orgId }) {
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [analyticsTrend, setAnalyticsTrend] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTag, setActiveTag] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [drawerView, setDrawerView] = useState('preview');
  const [previewText, setPreviewText] = useState('');
  const [previewPages, setPreviewPages] = useState([]);
  const [previewSearch, setPreviewSearch] = useState('');
  const [previewMatches, setPreviewMatches] = useState([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [isPreviewSearching, setIsPreviewSearching] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [fitWidth, setFitWidth] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingFile, setProcessingFile] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [replacingDoc, setReplacingDoc] = useState(null);
  const [metadataCategory, setMetadataCategory] = useState('');
  const [metadataTags, setMetadataTags] = useState('');
  const [toasts, setToasts] = useState([]);
  const [filterNow] = useState(() => Date.now());

  const addToast = useCallback((title, message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, title, message, type }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4200);
  }, []);

  const dismissToast = (id) => setToasts((items) => items.filter((item) => item.id !== id));

  const fetchDocuments = useCallback(async () => {
    if (!orgId || orgId === 'No Org Linked') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/api/v1/ai/documents/${orgId}`);
      if (!res.ok) throw new Error('Document sync failed');
      const data = await res.json();
      const sourceDocs = Array.isArray(data) ? data : data.documents || [];
      setDocuments(sourceDocs.map(normalizeDocument));
      setAnalyticsTrend(data.analytics?.trend || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      addToast('Knowledge base sync failed', 'The AI service did not return documents.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast, orgId]);

  useEffect(() => {
    const syncTimer = window.setTimeout(() => fetchDocuments(), 0);
    return () => window.clearTimeout(syncTimer);
  }, [fetchDocuments]);

  const categories = useMemo(() => Array.from(new Set(documents.map((doc) => doc.category).filter(Boolean))), [documents]);
  const allTags = useMemo(() => Array.from(new Set(documents.flatMap((doc) => doc.tags || []))), [documents]);

  const runUploadPipeline = async (file, replaceDoc = null) => {
    setProcessingFile(file.name);
    setUploadState('uploading');
    setUploadProgress(0);

    const progressInterval = window.setInterval(() => {
      setUploadProgress((progress) => {
        const next = Math.min(progress + 4, 94);
        if (next >= 25 && next < 50) setUploadState('extracting');
        if (next >= 50 && next < 76) setUploadState('embedding');
        if (next >= 76) setUploadState('indexing');
        return next;
      });
    }, 260);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('organizationId', orgId);
    formData.append('category', replaceDoc?.category || uploadCategory.trim() || 'Uncategorized');
    formData.append('tags', replaceDoc?.tags?.join(',') || uploadTags.trim());
    if (replaceDoc) formData.append('replaceDocumentId', replaceDoc.documentId || replaceDoc.id);

    try {
      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to upload document');

      window.clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadState('success');
      addToast(replaceDoc ? 'Document replaced' : 'Upload successful', `${file.name} was processed and indexed.`);
      await fetchDocuments();
      if (!replaceDoc) {
        setUploadCategory('');
        setUploadTags('');
      }
      window.setTimeout(() => setUploadState('idle'), 2600);
    } catch (error) {
      window.clearInterval(progressInterval);
      console.error('Upload Error:', error);
      setUploadState('failed');
      addToast('Upload failed', error.message || 'The parsing engine could not process this file.', 'error');
      window.setTimeout(() => setUploadState('idle'), 4000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (replaceInputRef.current) replaceInputRef.current.value = '';
      setReplacingDoc(null);
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || event.dataTransfer?.files || []);
    if (!files.length) return;
    for (const file of files) await runUploadPipeline(file);
  };

  const handleReplaceFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !replacingDoc) return;
    await runUploadPipeline(file, replacingDoc);
  };

  const docKey = (doc) => doc.documentId || doc.id;

  const loadPreview = async (doc) => {
    setSelectedDoc(doc);
    setDrawerView('preview');
    setPreviewSearch('');
    setPreviewMatches([]);
    setActiveMatchIndex(0);
    setPreviewText('');
    setPreviewPages([]);
    setPreviewPage(1);
    setPreviewZoom(100);
    setFitWidth(true);
    setMetadataCategory(doc.category || '');
    setMetadataTags(doc.tags?.join(', ') || '');
    setIsPreviewLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/ai/documents/${orgId}/${docKey(doc)}/preview`);
      if (!response.ok) throw new Error('Preview failed');
      const data = await response.json();
      setPreviewText(data.text || '');
      setPreviewPages(data.renderedPages || []);
    } catch (error) {
      console.error('Preview error:', error);
      addToast('Preview failed', 'The document preview could not be loaded.', 'error');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const rebuildDocument = async (doc) => {
    const response = await fetch(`http://127.0.0.1:8000/api/v1/ai/documents/${orgId}/${docKey(doc)}/rebuild`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Rebuild failed');
  };

  const handleRefresh = async () => {
    await fetchDocuments();
    addToast('Knowledge base refreshed', 'Document and embedding status was synced.');
  };

  const handleRebuildAll = async () => {
    try {
      await Promise.all(documents.map((doc) => rebuildDocument(doc)));
      await fetchDocuments();
      addToast('Embeddings rebuilt', 'All documents were re-embedded successfully.');
    } catch (error) {
      console.error('Rebuild all error:', error);
      addToast('Rebuild failed', 'One or more documents could not be rebuilt.', 'error');
    }
  };

  const handleMetadataSave = async () => {
    if (!selectedDoc) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/ai/documents/${orgId}/${docKey(selectedDoc)}/metadata`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: metadataCategory,
          tags: metadataTags.split(',').map((tag) => tag.trim()).filter(Boolean)
        })
      });
      if (!response.ok) throw new Error('Metadata update failed');
      await fetchDocuments();
      addToast('Metadata updated', `${selectedDoc.name} was updated.`);
    } catch (error) {
      console.error('Metadata error:', error);
      addToast('Metadata update failed', 'Category and tags could not be saved.', 'error');
    }
  };

  const handleRowAction = async (event, action, doc) => {
    event.stopPropagation();

    if (action === 'preview') {
      await loadPreview(doc);
      return;
    }

    if (action === 'analytics') {
      setSelectedDoc(doc);
      setDrawerView('stats');
      setMetadataCategory(doc.category || '');
      setMetadataTags(doc.tags?.join(', ') || '');
      return;
    }

    if (action === 'rename') {
      const nextName = window.prompt('Rename document', doc.name);
      if (!nextName || nextName.trim() === doc.name) return;
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/ai/documents/${orgId}/${docKey(doc)}/rename`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nextName.trim() })
        });
        if (!response.ok) throw new Error('Rename failed');
        await fetchDocuments();
        addToast('Document renamed', `${doc.name} was renamed.`);
      } catch (error) {
        console.error('Rename error:', error);
        addToast('Rename failed', 'The document could not be renamed.', 'error');
      }
      return;
    }

    if (action === 'replace') {
      setReplacingDoc(doc);
      replaceInputRef.current?.click();
      return;
    }

    if (action === 'download') {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/ai/documents/${orgId}/${docKey(doc)}/download`);
        if (!response.ok) throw new Error('Download failed');
        const blob = await response.blob();
        if (!blob.size) throw new Error('Downloaded file is empty');
        const disposition = response.headers.get('Content-Disposition') || '';
        const match = disposition.match(/filename="?([^"]+)"?/i);
        const filename = match?.[1] || doc.name || 'document';
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        addToast('Download started', `${filename} is downloading.`);
      } catch (error) {
        console.error('Download error:', error);
        addToast('Download failed', 'The original document could not be downloaded.', 'error');
      }
      return;
    }

    if (action === 'rebuild') {
      try {
        await rebuildDocument(doc);
        await fetchDocuments();
        addToast('Embeddings rebuilt', `${doc.name} was re-embedded.`);
      } catch (error) {
        console.error('Rebuild error:', error);
        addToast('Rebuild failed', 'The document could not be re-embedded.', 'error');
      }
      return;
    }

    if (action === 'delete') {
      if (!window.confirm(`Delete ${doc.name}?`)) return;
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/ai/documents/${orgId}/${docKey(doc)}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Delete failed');
        await fetchDocuments();
        addToast('Document deleted', `${doc.name} was removed from the knowledge base.`);
      } catch (error) {
        console.error('Delete error:', error);
        addToast('Delete failed', 'The document could not be deleted from the AI service.', 'error');
      }
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        const query = searchQuery.trim().toLowerCase();
        const searchable = [doc.name, doc.category, ...(doc.tags || [])].join(' ').toLowerCase();
        const uploaded = new Date(doc.uploadDate).getTime();
        const dateMatches = dateFilter === 'all'
          || (dateFilter === 'week' && filterNow - uploaded <= 7 * 24 * 60 * 60 * 1000)
          || (dateFilter === 'month' && filterNow - uploaded <= 30 * 24 * 60 * 60 * 1000);

        return (!query || searchable.includes(query))
          && (categoryFilter === 'all' || doc.category === categoryFilter)
          && (typeFilter === 'all' || doc.type === typeFilter)
          && (statusFilter === 'all' || doc.status === statusFilter)
          && (activeTag === 'all' || doc.tags?.includes(activeTag))
          && dateMatches;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') return new Date(a.uploadDate) - new Date(b.uploadDate);
        if (sortBy === 'most-used') return b.usageCount - a.usageCount;
        if (sortBy === 'updated') return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      });
  }, [activeTag, categoryFilter, dateFilter, documents, filterNow, searchQuery, sortBy, statusFilter, typeFilter]);

  const totals = useMemo(() => {
    const chunks = documents.reduce((sum, doc) => sum + Number(doc.chunks || 0), 0);
    const embeddings = documents.reduce((sum, doc) => sum + doc.embeddings, 0);
    const failed = documents.filter((doc) => doc.status === 'FAILED').length;
    const pending = documents.filter((doc) => doc.status === 'PENDING' || doc.status === 'PROCESSING').length;
    const indexed = documents.length - failed - pending;
    const health = documents.length ? Math.max(0, Math.round((indexed / documents.length) * 100)) : 0;
    const confidenceDocs = documents.filter((doc) => Number(doc.confidence) > 0);
    const averageConfidence = confidenceDocs.length ? Math.round(confidenceDocs.reduce((sum, doc) => sum + Number(doc.confidence || 0), 0) / confidenceDocs.length) : 0;
    const usage = documents.reduce((sum, doc) => sum + doc.usageCount, 0);
    return { chunks, embeddings, failed, pending, indexed, health, averageConfidence, usage };
  }, [documents]);

  const failedDocuments = documents.filter((doc) => doc.status === 'FAILED');
  const hasNoDocuments = !isLoading && documents.length === 0;
  const hasAnalytics = analyticsTrend.some((item) => item.retrievals > 0 || item.usage > 0);
  const visiblePreviewText = previewSearch
    ? previewText.split('\n').filter((line) => line.toLowerCase().includes(previewSearch.toLowerCase())).join('\n')
    : previewText;
  const activePreviewPage = previewPages[Math.max(0, previewPage - 1)];
  const activeMatch = previewMatches[activeMatchIndex];
  const pageMatches = previewMatches.filter((match) => match.page === previewPage);

  const runPreviewSearch = async (value) => {
    setPreviewSearch(value);
    setActiveMatchIndex(0);
    const query = value.trim().toLowerCase();
    if (!query || !selectedDoc) {
      setPreviewMatches([]);
      return;
    }

    setIsPreviewSearching(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/ai/documents/${orgId}/${docKey(selectedDoc)}/preview/search?query=${encodeURIComponent(value.trim())}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      const matches = data.matches || [];
      setPreviewMatches(matches);
      if (matches[0]?.page) setPreviewPage(matches[0].page);
    } catch (error) {
      console.error('Preview search error:', error);
      setPreviewMatches([]);
      addToast('Search failed', 'Could not search inside this document.', 'error');
    } finally {
      setIsPreviewSearching(false);
    }
  };

  const movePreviewMatch = (direction) => {
    if (!previewMatches.length) return;
    const nextIndex = (activeMatchIndex + direction + previewMatches.length) % previewMatches.length;
    setActiveMatchIndex(nextIndex);
    if (previewMatches[nextIndex]?.page) setPreviewPage(previewMatches[nextIndex].page);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 pb-12 text-slate-300">
      <ToastStack toasts={toasts} dismissToast={dismissToast} />
      <input ref={replaceInputRef} type="file" onChange={handleReplaceFile} className="hidden" accept=".pdf,.docx,.txt,.md,.markdown" />

      <motion.section variants={fadeUp}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">Beacon Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Knowledge Base</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Manage company knowledge documents, embeddings, health, and retrieval analytics for your RAG platform.
        </p>
      </motion.section>

      <motion.section variants={fadeUp} className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => <SkeletonBlock key={index} className="h-32" />)
        ) : (
          <>
            <MetricCard icon={FileText} label="Total Documents" value={documents.length} detail="Indexed" tone="text-cyan-300" tooltip="Total documents uploaded to this company knowledge base." progress={totals.health} />
            <MetricCard icon={Layers} label="Total Chunks" value={totals.chunks} detail="Internal" tone="text-indigo-300" tooltip="Total retrieval chunks generated by the RAG pipeline." progress={Math.min(totals.chunks, 100)} />
            <MetricCard icon={Database} label="Total Embeddings" value={totals.embeddings} detail="Vectors" tone="text-violet-300" tooltip="Stored vector embeddings available for retrieval." progress={Math.min(totals.embeddings, 100)} />
            <MetricCard icon={Gauge} label="Average Retrieval Confidence" value={totals.averageConfidence} suffix="%" detail="Quality" tone="text-emerald-300" tooltip="Average confidence from retrieved knowledge sources." progress={totals.averageConfidence} />
            <MetricCard icon={Activity} label="Knowledge Base Usage" value={totals.usage} detail="Retrievals" tone="text-rose-300" tooltip="How often documents were retrieved by the AI." progress={Math.min(totals.usage, 100)} />
            <MetricCard icon={AlertCircle} label="Failed Documents" value={totals.failed} detail="Action" tone="text-red-300" tooltip="Documents that need retry or review." progress={documents.length ? (totals.failed / documents.length) * 100 : 0} />
          </>
        )}
      </motion.section>

      <motion.section variants={fadeUp} className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-xl border border-white/10 bg-[#121620]/85 p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Document Upload</h2>
              <p className="mt-1 text-xs text-slate-500">Assign category and tags before upload so documents are organized from day one.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRefresh}
                className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                Refresh
              </button>

              <button
                onClick={handleRebuildAll}
                className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-3 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/20"
              >
                <Zap size={14} />
                Rebuild All
              </button>
            </div>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Category</span>
              <input
                value={uploadCategory}
                onChange={(event) => setUploadCategory(event.target.value)}
                placeholder="Policies, Support, Product..."
                className="h-10 w-full rounded-lg border border-white/10 bg-[#0A0C10] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tags</span>
              <input
                value={uploadTags}
                onChange={(event) => setUploadTags(event.target.value)}
                placeholder="onboarding, pricing, faq"
                className="h-10 w-full rounded-lg border border-white/10 bg-[#0A0C10] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
              />
            </label>
          </div>

          <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.txt,.md,.markdown" />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => { event.preventDefault(); setIsDragging(false); handleFileChange(event); }}
            className={`min-h-52 cursor-pointer rounded-xl border-2 border-dashed p-6 transition ${isDragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/10 bg-[#0A0C10] hover:border-indigo-400/60'}`}
          >
            {uploadState === 'idle' ? (
              <div className="flex h-full min-h-40 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <UploadCloud size={26} className="text-indigo-300" />
                </div>
                <h3 className="text-lg font-bold text-white">Drag and drop company documents</h3>
                <p className="mt-2 max-w-md text-sm text-slate-400">The AI service extracts text, generates embeddings, and indexes the document for retrieval.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {fileTypes.map((type) => <span key={type} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-400">{type}</span>)}
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-40 flex-col justify-center">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-white">{uploadState === 'failed' ? 'Processing failed' : uploadState === 'success' ? 'Upload complete' : 'Processing upload'}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{processingFile}</p>
                  </div>
                  <span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${statusClass(uploadState)}`}>{uploadState}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {uploadSteps.map((step, index) => {
                    const currentIndex = uploadSteps.indexOf(uploadState);
                    const done = uploadState === 'success' || currentIndex > index;
                    const active = currentIndex === index;
                    return (
                      <div key={step} className={`rounded-lg border p-3 ${done ? 'border-emerald-500/20 bg-emerald-500/10' : active ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-white/10 bg-white/5'}`}>
                        <div className="mb-2 flex items-center justify-between">
                          {done ? <CheckCircle2 size={16} className="text-emerald-300" /> : <RefreshCw size={16} className={active ? 'animate-spin text-indigo-300' : 'text-slate-500'} />}
                          <span className="text-[10px] font-bold uppercase text-slate-500">0{index + 1}</span>
                        </div>
                        <p className="text-xs font-semibold capitalize text-slate-200">{step}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
                  <div style={{ width: `${uploadProgress}%` }} className={`h-full rounded-full transition-all ${uploadState === 'failed' ? 'bg-red-400' : 'bg-indigo-500'}`} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-xl border border-white/10 bg-[#121620]/85 p-4">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-white">AI Knowledge Health</h2>
              <span className="text-2xl font-bold text-emerald-300">{totals.health}%</span>
            </div>
            <div className="space-y-3">
              {[
                ['Documents Indexed', totals.indexed, CheckCircle2, 'text-emerald-300'],
                ['Embeddings Generated', totals.embeddings, Database, 'text-indigo-300'],
                ['Failed Documents', totals.failed, AlertCircle, 'text-red-300'],
                ['Pending Documents', totals.pending, RefreshCw, 'text-amber-300']
              ].map(([label, value, Icon, tone]) => (
                <div key={label} className="flex items-center justify-between rounded-lg bg-[#0A0C10] px-3 py-2.5">
                  <span className="flex items-center gap-2 text-xs text-slate-400"><Icon size={14} className={tone} /> {label}</span>
                  <span className="text-sm font-bold text-white">{compactNumber(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#121620]/85 p-4">
            <h2 className="mb-4 font-bold text-white">Categories and Tags</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              {categories.length ? categories.map((category) => (
                <button key={category} onClick={() => setCategoryFilter(category)} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${categoryFilter === category ? 'border-indigo-400/40 bg-indigo-500/20 text-indigo-100' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'}`}>
                  {category}
                </button>
              )) : <span className="text-sm text-slate-500">No categories yet.</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveTag('all')} className={`rounded-full px-3 py-1 text-[11px] font-bold ${activeTag === 'all' ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-400'}`}>All tags</button>
              {allTags.map((tag) => (
                <button key={tag} onClick={() => setActiveTag(tag)} className={`rounded-full px-3 py-1 text-[11px] font-bold ${activeTag === tag ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="rounded-xl border border-white/10 bg-[#121620]/85">
        <div className="border-b border-white/10 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by document name, category, or tags"
                className="h-10 w-full rounded-lg border border-white/10 bg-[#0A0C10] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5 xl:w-[760px]">
              <SelectControl icon={Tags} label="Category" value={categoryFilter} onChange={setCategoryFilter} options={[{ value: 'all', label: 'All categories' }, ...categories.map((category) => ({ value: category, label: category }))]} />
              <SelectControl icon={FileText} label="File type" value={typeFilter} onChange={setTypeFilter} options={[{ value: 'all', label: 'All types' }, ...fileTypes.map((type) => ({ value: type, label: type }))]} />
              <SelectControl icon={Filter} label="Status" value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'All statuses' }, ...statuses.map((status) => ({ value: status, label: status }))]} />
              <SelectControl icon={Calendar} label="Upload date" value={dateFilter} onChange={setDateFilter} options={[{ value: 'all', label: 'Any date' }, { value: 'week', label: 'Last 7 days' }, { value: 'month', label: 'Last 30 days' }]} />
              <SelectControl icon={BarChart3} label="Sort" value={sortBy} onChange={setSortBy} options={[{ value: 'newest', label: 'Newest' }, { value: 'oldest', label: 'Oldest' }, { value: 'most-used', label: 'Most used' }, { value: 'updated', label: 'Recently updated' }]} />
            </div>
          </div>
        </div>

        <div className="max-h-[640px] overflow-auto p-2">
          <table className="w-full min-w-[1120px] border-separate border-spacing-y-2 text-left">
            <thead>
              <tr className="sticky top-0 z-10 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <th className="rounded-l-xl border-y border-l border-white/10 bg-[#0A0C10]/95 px-4 py-3 backdrop-blur-xl">File Name</th>
                <th className="border-y border-white/10 bg-[#0A0C10]/95 px-4 py-3 backdrop-blur-xl">Category</th>
                <th className="border-y border-white/10 bg-[#0A0C10]/95 px-4 py-3 backdrop-blur-xl">Type</th>
                <th className="border-y border-white/10 bg-[#0A0C10]/95 px-4 py-3 backdrop-blur-xl">Size</th>
                <th className="border-y border-white/10 bg-[#0A0C10]/95 px-4 py-3 backdrop-blur-xl">Pages</th>
                <th className="border-y border-white/10 bg-[#0A0C10]/95 px-4 py-3 backdrop-blur-xl">Embedding Status</th>
                <th className="border-y border-white/10 bg-[#0A0C10]/95 px-4 py-3 backdrop-blur-xl">Upload Date</th>
                <th className="border-y border-white/10 bg-[#0A0C10]/95 px-4 py-3 backdrop-blur-xl">Last Updated</th>
                <th className="border-y border-white/10 bg-[#0A0C10]/95 px-4 py-3 backdrop-blur-xl">Usage</th>
                <th className="border-y border-white/10 bg-[#0A0C10]/95 px-4 py-3 backdrop-blur-xl">Status</th>
                <th className="rounded-r-xl border-y border-r border-white/10 bg-[#0A0C10]/95 px-4 py-3 text-right backdrop-blur-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td colSpan="11" className="px-4 py-3"><SkeletonBlock className="h-12" /></td>
                  </tr>
                ))
              ) : hasNoDocuments ? (
                <tr>
                  <td colSpan="11" className="px-4 py-16">
                    <div className="mx-auto flex max-w-md flex-col items-center text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                        <FileText size={30} className="text-indigo-300" />
                      </div>
                      <h3 className="text-lg font-bold text-white">No documents uploaded yet.</h3>
                      <p className="mt-2 text-sm text-slate-500">Upload your first policy, guide, manual, or support document to activate the knowledge base.</p>
                      <button onClick={() => fileInputRef.current?.click()} className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500">
                        <UploadCloud size={16} /> Upload Document
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr><td colSpan="11" className="px-4 py-12 text-center text-sm text-slate-500">No documents match the current search and filters.</td></tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} onClick={(event) => handleRowAction(event, 'preview', doc)} className="group cursor-pointer transition">
                    <td className="rounded-l-xl border-y border-l border-white/5 bg-white/[0.025] px-4 py-4 transition group-hover:border-indigo-400/20 group-hover:bg-indigo-500/[0.045]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-100">{doc.name}</p>
                          <p className="mt-1 flex flex-wrap gap-1">
                            {doc.tags?.slice(0, 2).map((tag) => <span key={tag} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">#{tag}</span>)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="border-y border-white/5 bg-white/[0.025] px-4 py-4 text-slate-400 transition group-hover:border-indigo-400/20 group-hover:bg-indigo-500/[0.045]">{doc.category}</td>
                    <td className="border-y border-white/5 bg-white/[0.025] px-4 py-4 font-mono text-xs text-slate-400 transition group-hover:border-indigo-400/20 group-hover:bg-indigo-500/[0.045]">{doc.type}</td>
                    <td className="border-y border-white/5 bg-white/[0.025] px-4 py-4 font-mono text-xs text-slate-400 transition group-hover:border-indigo-400/20 group-hover:bg-indigo-500/[0.045]">{doc.size}</td>
                    <td className="border-y border-white/5 bg-white/[0.025] px-4 py-4 font-mono text-xs text-slate-400 transition group-hover:border-indigo-400/20 group-hover:bg-indigo-500/[0.045]">{doc.pages || '--'}</td>
                    <td className="border-y border-white/5 bg-white/[0.025] px-4 py-4 transition group-hover:border-indigo-400/20 group-hover:bg-indigo-500/[0.045]"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${statusClass(doc.embeddingStatus)}`}>{doc.embeddingStatus}</span></td>
                    <td className="border-y border-white/5 bg-white/[0.025] px-4 py-4 text-xs text-slate-500 transition group-hover:border-indigo-400/20 group-hover:bg-indigo-500/[0.045]">{formatDate(doc.uploadDate)}</td>
                    <td className="border-y border-white/5 bg-white/[0.025] px-4 py-4 text-xs text-slate-500 transition group-hover:border-indigo-400/20 group-hover:bg-indigo-500/[0.045]">{formatDate(doc.lastUpdated)}</td>
                    <td className="border-y border-white/5 bg-white/[0.025] px-4 py-4 font-mono text-xs text-slate-400 transition group-hover:border-indigo-400/20 group-hover:bg-indigo-500/[0.045]">{doc.usageCount}</td>
                    <td className="border-y border-white/5 bg-white/[0.025] px-4 py-4 transition group-hover:border-indigo-400/20 group-hover:bg-indigo-500/[0.045]"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${statusClass(doc.status)}`}>{doc.status}</span></td>
                    <td className="rounded-r-xl border-y border-r border-white/5 bg-white/[0.025] px-4 py-4 transition group-hover:border-indigo-400/20 group-hover:bg-indigo-500/[0.045]">
                      <div className="flex justify-end gap-1">
                        {[
                          ['preview', Eye],
                          ['rename', Pencil],
                          ['replace', RotateCcw],
                          ['download', Download],
                          ['rebuild', Zap],
                          ['analytics', BarChart3],
                          ['delete', Trash2]
                        ].map(([action, Icon]) => (
                          <button key={action} title={action} onClick={(event) => handleRowAction(event, action, doc)} className={`rounded-md p-1.5 transition hover:scale-105 hover:bg-white/10 ${action === 'delete' ? 'text-red-300' : 'text-slate-400 hover:text-white'}`}>
                            <Icon size={15} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="grid grid-cols-1 gap-4 xl:grid-cols-[0.7fr_1fr_0.8fr]">
        <div className="rounded-xl border border-white/10 bg-[#121620]/85 p-4">
          <h2 className="mb-4 font-bold text-white">Failed Processing</h2>
          <div className="space-y-3">
            {failedDocuments.length ? failedDocuments.map((doc) => (
              <div key={doc.id} className="rounded-lg border border-red-500/15 bg-red-500/5 p-3">
                <p className="text-sm font-semibold text-white">{doc.name}</p>
                <p className="mt-1 text-xs text-red-200/70">{doc.errorReason || 'Processing failed.'}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => rebuildDocument(doc).then(fetchDocuments)} className="rounded-md bg-red-500/15 px-2.5 py-1 text-[11px] font-bold text-red-100">Retry</button>
                  <button onClick={(event) => handleRowAction(event, 'delete', doc)} className="rounded-md bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300">Delete</button>
                </div>
              </div>
            )) : (
              <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-4 text-sm text-emerald-200">No failed documents right now.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#121620]/85 p-4">
          <h2 className="mb-4 font-bold text-white">Document Analytics</h2>
          <div className="h-64">
            {hasAnalytics ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsTrend} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="retrievalFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0A0C10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="retrievals" stroke="#818cf8" strokeWidth={2} fill="url(#retrievalFill)" />
                  <Line type="monotone" dataKey="usage" stroke="#2dd4bf" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-slate-500">No retrieval activity yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#121620]/85 p-4">
          <h2 className="mb-4 font-bold text-white">Recent Activity</h2>
          <div className="space-y-4">
            {[...documents.slice(0, 5), null].slice(0, 6).map((doc) => (
              doc ? (
                <div key={doc.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <FileText size={14} className="text-indigo-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">Document uploaded</p>
                    <p className="truncate text-xs text-slate-500">{doc.name}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">{formatDate(doc.uploadDate)}</p>
                  </div>
                </div>
              ) : (
                <div key="embeddings" className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Database size={14} className="text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">Embeddings available</p>
                    <p className="truncate text-xs text-slate-500">{compactNumber(totals.embeddings)} vectors stored</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">Live</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {selectedDoc && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDoc(null)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 230 }} className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col border-l border-white/10 bg-[#121620] shadow-2xl">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#0A0C10] p-5">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-white">{selectedDoc.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">{selectedDoc.category} / {selectedDoc.type} / {selectedDoc.size}</p>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="rounded-lg bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="border-b border-white/10 p-3">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    ['preview', Eye, 'Preview'],
                    ['general', FileText, 'General'],
                    ['stats', BarChart3, 'AI Stats'],
                    ['chunks', Layers, 'Chunks']
                  ].map(([view, Icon, label]) => (
                    <button key={view} onClick={() => setDrawerView(view)} className={`flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold transition ${drawerView === view ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {drawerView === 'preview' && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0A0C10] p-3 md:flex-row md:items-center md:justify-between">
                      <div className="relative min-w-0 flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          value={previewSearch}
                          onChange={(event) => runPreviewSearch(event.target.value)}
                          placeholder="Search inside preview"
                          className="h-10 w-full rounded-lg border border-white/10 bg-[#121620] pl-10 pr-28 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
                        />
                        {previewSearch && (
                          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase ${previewMatches.length ? 'text-emerald-300' : 'text-red-300'}`}>
                            {isPreviewSearching ? 'Searching' : previewMatches.length ? `${activeMatchIndex + 1}/${previewMatches.length}` : 'No match'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {previewSearch && previewMatches.length > 0 && (
                          <>
                            <button onClick={() => movePreviewMatch(-1)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10" title="Previous match"><ChevronLeft size={16} /></button>
                            <button onClick={() => movePreviewMatch(1)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10" title="Next match"><ChevronRight size={16} /></button>
                          </>
                        )}
                        {previewPages.length > 0 && (
                          <>
                            <button onClick={() => setPreviewPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"><ChevronLeft size={16} /></button>
                            <span className="min-w-20 text-center text-xs font-bold text-slate-400">Page {previewPage}/{previewPages.length}</span>
                            <button onClick={() => setPreviewPage((page) => Math.min(previewPages.length, page + 1))} className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"><ChevronRight size={16} /></button>
                            <button onClick={() => { setFitWidth(false); setPreviewZoom((zoom) => Math.max(60, zoom - 10)); }} className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"><ZoomOut size={16} /></button>
                            <button onClick={() => { setFitWidth(false); setPreviewZoom((zoom) => Math.min(180, zoom + 10)); }} className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"><ZoomIn size={16} /></button>
                            <button onClick={() => setFitWidth((value) => !value)} className={`rounded-lg border px-3 py-2 text-xs font-bold ${fitWidth ? 'border-indigo-400/40 bg-indigo-500/20 text-indigo-100' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}><Maximize2 size={14} className="mr-1 inline" /> Fit</button>
                          </>
                        )}
                        <button onClick={(event) => handleRowAction(event, 'download', selectedDoc)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10">Download</button>
                      </div>
                    </div>
                    <div className="h-[calc(100vh-245px)] min-h-[430px] overflow-auto rounded-xl border border-white/10 bg-[#0A0C10] p-4">
                      {isPreviewLoading ? (
                        <div className="space-y-3">
                          <SkeletonBlock className="h-5 w-3/4" />
                          <SkeletonBlock className="h-5 w-full" />
                          <SkeletonBlock className="h-5 w-5/6" />
                        </div>
                      ) : previewPages.length > 0 ? (
                        <div className="flex h-full justify-center">
                          <div
                            className="relative self-start"
                            style={fitWidth ? { height: '100%', maxWidth: '100%' } : { width: `${previewZoom}%`, maxWidth: 'none' }}
                          >
                            <img
                              src={activePreviewPage?.image}
                              alt={`Page ${previewPage} preview`}
                              className={fitWidth ? 'block h-full max-w-full rounded-lg bg-white shadow-2xl' : 'block h-auto w-full rounded-lg bg-white shadow-2xl'}
                            />
                            {pageMatches.map((match) => {
                              const isActive = activeMatch?.id === match.id;
                              return (
                                <span
                                  key={match.id}
                                  className={`pointer-events-none absolute rounded-sm ${isActive ? 'bg-amber-400/70 ring-2 ring-amber-500' : 'bg-yellow-300/45'}`}
                                  style={{
                                    left: `${match.left}%`,
                                    top: `${match.top}%`,
                                    width: `${match.width}%`,
                                    height: `${match.height}%`
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ) : visiblePreviewText ? (
                        <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{visiblePreviewText}</pre>
                      ) : (
                        <div className="flex min-h-[360px] items-center justify-center text-center text-sm text-slate-500">No preview text is available for this document.</div>
                      )}
                    </div>
                  </div>
                )}

                {drawerView === 'general' && (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Category</span>
                        <input value={metadataCategory} onChange={(event) => setMetadataCategory(event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-[#0A0C10] px-3 text-sm text-white outline-none focus:border-indigo-400" />
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tags</span>
                        <input value={metadataTags} onChange={(event) => setMetadataTags(event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-[#0A0C10] px-3 text-sm text-white outline-none focus:border-indigo-400" />
                      </label>
                    </div>
                    <button onClick={handleMetadataSave} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-500">Save Metadata</button>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['File Type', selectedDoc.type],
                        ['File Size', selectedDoc.size],
                        ['Pages', selectedDoc.pages || '--'],
                        ['Uploaded', formatDate(selectedDoc.uploadDate)],
                        ['Last Updated', formatDate(selectedDoc.lastUpdated)],
                        ['Status', selectedDoc.status]
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-white/10 bg-[#0A0C10] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                          <p className="mt-2 truncate text-lg font-bold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {drawerView === 'stats' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['Times Retrieved', selectedDoc.usageCount],
                        ['Avg Similarity', selectedDoc.averageScore],
                        ['Avg Confidence', `${selectedDoc.confidence}%`],
                        ['AI Responses', selectedDoc.aiResponses],
                        ['Last Retrieved', selectedDoc.lastRetrieved ? formatDate(selectedDoc.lastRetrieved) : 'Never'],
                        ['Embedding Model', selectedDoc.embeddingModel]
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-white/10 bg-[#0A0C10] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                          <p className="mt-2 truncate text-lg font-bold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="h-64 rounded-xl border border-white/10 bg-[#0A0C10] p-4">
                      {hasAnalytics ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analyticsTrend} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0A0C10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            <Line type="monotone" dataKey="retrievals" stroke="#818cf8" strokeWidth={2} />
                            <Line type="monotone" dataKey="usage" stroke="#2dd4bf" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">No retrieval activity yet.</div>
                      )}
                    </div>
                  </div>
                )}

                {drawerView === 'chunks' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/10 bg-[#0A0C10] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Chunks</p>
                        <p className="mt-2 text-lg font-bold text-white">{selectedDoc.chunks || 0}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-[#0A0C10] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Embeddings</p>
                        <p className="mt-2 text-lg font-bold text-white">{selectedDoc.embeddings || 0}</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#0A0C10] p-4 text-sm leading-6 text-slate-400">
                      Chunk text is used internally by the retrieval pipeline. Admins can monitor generated counts here without reviewing raw embedding fragments.
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
