
import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';

interface LatexOutputProps {
  content: string;
}

const LatexOutput: React.FC<LatexOutputProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!content) return null;

  return (
    <div className="mt-8 relative z-20 mx-auto max-w-4xl">
      <div className="bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col h-[600px] ring-1 ring-black/50">
        <div className="bg-[#2d2d2d] px-4 py-3 border-b border-black/40 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
            </div>
            <div className="ml-4 flex items-center gap-2 text-slate-400 font-medium text-xs font-mono">
              <FileCode size={14} className="text-brand-400" />
              <span>solution.tex</span>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200
              ${copied
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'}
            `}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'COPIED!' : 'COPY CODE'}
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-[#1e1e1e] custom-scrollbar">
          <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
            <code className="text-gray-300">
              {content}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default LatexOutput;
