import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode } from 'lucide-react';
import { generateSingleFileHtml } from '../singleFileHtmlGenerator';

interface ExportHtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportHtmlModal: React.FC<ExportHtmlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const singleHtmlCode = generateSingleFileHtml();

  const handleCopy = () => {
    navigator.clipboard.writeText(singleHtmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([singleHtmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zombie_survival_shooter.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      id="modal-export-html"
      className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/40">
          <div className="flex items-center gap-2.5">
            <FileCode className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white leading-none">Standalone Single-File HTML Game</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Zero external dependencies. Runs directly by double-clicking in Chrome, Firefox, Edge, or Safari.
              </p>
            </div>
          </div>
          <button
            id="btn-close-export-modal"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Preview Area */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Contains Complete HTML5 Canvas + Web Audio API + 3 Weapons + Wave AI Engine</span>
            <span>Single file format: <code className="text-amber-300">.html</code></span>
          </div>

          <div className="flex-1 relative bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden font-mono text-xs">
            <pre className="p-4 text-neutral-300 overflow-y-auto h-full max-h-[380px] leading-relaxed select-all">
              {singleHtmlCode.slice(0, 1500)}
              {'\n\n... [Complete standalone single-file code contains all 800+ lines of HTML, CSS, JS, Audio Synthesizer, & Game Loop] ...'}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800 bg-neutral-950/50">
          <button
            id="btn-copy-html-code"
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'COPIED TO CLIPBOARD!' : 'COPY CODE'}
          </button>

          <button
            id="btn-download-html-file"
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD .HTML FILE
          </button>
        </div>
      </div>
    </div>
  );
};
