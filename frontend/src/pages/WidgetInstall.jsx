import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function WidgetInstall({ orgId }) {
  const [copied, setCopied] = useState(false);

  const scriptCode = `<!-- Beacon AI Support Agent -->\n<script>\n  window.BEACON_ORG_ID = "${orgId}";\n</script>\n<script src="http://localhost:5173/widget.js" async></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-slate-500">Copy this JavaScript snippet and insert it directly into the template header of your HTML site.</p>
      </div>

      <div className="bg-slate-900 rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <span className="text-xs font-mono font-bold text-slate-300">HTML Script Snippet</span>
          <button onClick={copyToClipboard} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-lg">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy Snippet'}
          </button>
        </div>
        <div className="p-6 overflow-x-auto text-sm font-mono text-slate-300 bg-[#0d1117]">
          <pre><code>{scriptCode}</code></pre>
        </div>
      </div>
    </div>
  );
}