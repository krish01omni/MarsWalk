import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  FolderDown,
  Download,
  Terminal,
  FileCode2
} from 'lucide-react';

interface OfflineSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineSetupModal: React.FC<OfflineSetupModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const githubUrl = 'https://github.com/krish01omni/MarsWalk';
  const downloadZipUrl = 'https://github.com/krish01omni/MarsWalk/archive/refs/heads/main.zip';

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      title: '1. Clone or Download Repository',
      desc: 'Obtain the full MarsWalk codebase bundled with all NASA rover traverse datasets, orbital multispectral catalog, and hazard zones.',
      command: 'git clone https://github.com/krish01omni/MarsWalk.git\ncd MarsWalk'
    },
    {
      title: '2. Deploy Local AI Engine (Qwen 2.5 7B)',
      desc: 'Run the 1-click batch script. It automatically pulls and serves the high-speed quantized model locally via Ollama without internet.',
      command: 'setup_offline_qwen.bat'
    },
    {
      title: '3. Launch Air-Gapped Web Server',
      desc: 'Install dependencies and launch the local application. The web app automatically switches to your local Qwen model on http://localhost:11434/v1.',
      command: 'npm install\nnpm run dev'
    }
  ];

  return (
    <div className="fixed inset-0 z-[2000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-2xl bg-[#080B12] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-300">
        
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] bg-[#0C101A] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E25B38]/15 border border-[#E25B38]/30 flex items-center justify-center text-[#E25B38]">
              <FolderDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#E25B38] uppercase tracking-[0.2em] font-bold">
                OFFLINE EXPEDITION FIELD KIT
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <span>Deploy Locally with Quantized Qwen 2.5 7B</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[72vh]">
          
          {/* Brief Overview */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300 leading-relaxed space-y-2">
            <p>
              The <strong>Ares Route Explorer</strong> web console is designed to operate 100% air-gapped on Mars surface tablets, pressurized rovers, or local developer workstations.
            </p>
            <p className="text-zinc-400">
              Running a local quantized model (<code className="text-[#E25B38] font-mono">qwen2.5:7b-instruct</code>) gives human crews instant AI query access to the NASA traverse database, hazard avoidance index, and Three Forks sample registry without an active Deep Space Network link.
            </p>
          </div>

          {/* Quick Action Download & GitHub Banner */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Direct Repository Access</div>
                <div className="text-xs text-zinc-400 font-mono">krish01omni / MarsWalk</div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                OPEN SOURCE
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold font-mono flex items-center space-x-2 transition-all shadow-lg active:scale-95"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 text-black" />
              </a>

              <a
                href={downloadZipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white text-xs font-semibold flex items-center space-x-2 transition-all border border-white/10"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Download Repo (.ZIP)</span>
              </a>

              <a
                href="/setup_offline_qwen.bat"
                download="setup_offline_qwen.bat"
                className="px-4 py-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-semibold flex items-center space-x-2 transition-all border border-cyan-500/30"
              >
                <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download 1-Click .BAT</span>
              </a>
            </div>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4">
            <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-[#E25B38]" />
              <span>Step-by-Step Offline Deployment</span>
            </div>

            {steps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#05070B] border border-white/[0.06] space-y-2">
                <div className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>{step.title}</span>
                  <button
                    onClick={() => copyToClipboard(step.command, idx)}
                    className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-white/[0.08] transition-colors"
                  >
                    {copiedStep === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{step.desc}</p>
                <pre className="p-3 rounded-xl bg-black/60 border border-white/5 font-mono text-xs text-[#E25B38] overflow-x-auto">
                  <code>{step.command}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.08] bg-[#0C101A] flex items-center justify-between text-xs">
          <div className="text-[11px] text-zinc-400 font-mono flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Air-Gapped & 100% Offline Capable</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/[0.08] hover:bg-white/15 text-white font-semibold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
