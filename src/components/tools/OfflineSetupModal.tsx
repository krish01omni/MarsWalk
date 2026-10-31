import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check
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

  const copyToClipboard = (text: string, stepIdx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIdx);
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
      <div className="bezel-shell w-full max-w-2xl max-h-[88vh] flex flex-col">
        <div className="bezel-core w-full h-full flex flex-col overflow-hidden text-zinc-300">
          
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-white/[0.08] bg-[#07090E] flex items-center justify-between font-mono">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-white/[0.04] border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                KIT
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                  EXPEDITION FIELD KIT // OFFLINE
                </div>
                <h2 className="text-xs md:text-sm font-bold text-white flex items-center space-x-2 tracking-wide uppercase">
                  <span>Deploy Locally with Quantized Qwen 2.5 7B</span>
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white rounded transition-colors"
              title="Close (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 md:p-6 space-y-5 overflow-y-auto font-mono">
            
            {/* Brief Overview */}
            <div className="p-4 rounded bg-[#0A0D14] border border-white/[0.08] text-xs text-zinc-300 leading-relaxed space-y-1.5 font-sans">
              <p>
                The <strong className="text-white font-mono">MarsWalk</strong> telemetry console operates 100% air-gapped on planetary hardware, pressurized rovers, or local field laptops.
              </p>
              <p className="text-zinc-400 text-[11px]">
                A local quantized model (<code className="text-zinc-200 font-mono">qwen2.5:7b-instruct</code>) gives astronauts instant query access to the NASA traverse ledger, hazard avoidance index, and Three Forks sample registry without an active Deep Space Network link.
              </p>
            </div>

            {/* Quick Action Download & GitHub Banner */}
            <div className="p-4 rounded bg-[#0A0D14] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white uppercase">Direct Repository Access</div>
                  <div className="text-[10px] text-zinc-500 font-mono">krish01omni / MarsWalk</div>
                </div>
                <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-white/10 text-zinc-300 border border-white/10">
                  OPEN SOURCE // MIT
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded bg-white hover:bg-zinc-200 text-black text-xs font-bold font-mono flex items-center space-x-2 transition-all shadow-sm active:scale-95"
                >
                  <span>VIEW GITHUB REPO</span>
                  <ExternalLink className="w-3.5 h-3.5 text-black" />
                </a>

                <a
                  href={downloadZipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold flex items-center space-x-1.5 transition-all border border-white/10 font-mono"
                >
                  <span>DOWNLOAD .ZIP</span>
                </a>

                <a
                  href="/setup_offline_qwen.bat"
                  download="setup_offline_qwen.bat"
                  className="px-3.5 py-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold flex items-center space-x-1.5 transition-all border border-white/10 font-mono"
                >
                  <span>1-CLICK .BAT LAUNCHER</span>
                </a>
              </div>
            </div>

            {/* Setup Steps */}
            <div className="space-y-3">
              <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                STEP-BY-STEP OFFLINE DEPLOYMENT
              </div>

              {steps.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded bg-[#0A0D14] border border-white/[0.06] space-y-2">
                  <div className="text-xs font-semibold text-white flex items-center justify-between">
                    <span className="uppercase">{step.title}</span>
                    <button
                      onClick={() => copyToClipboard(step.command, idx)}
                      className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center space-x-1 px-2 py-0.8 rounded hover:bg-white/[0.08] transition-colors"
                    >
                      {copiedStep === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>COPY</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{step.desc}</p>
                  <pre className="p-2.5 rounded bg-black/80 border border-white/10 font-mono text-xs text-zinc-200 overflow-x-auto">
                    <code>{step.command}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#07090E] flex items-center justify-between text-xs font-mono">
            <div className="text-[11px] text-zinc-400 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>AIR-GAPPED & FIELD VERIFIED</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded transition-all active:scale-95 shadow-sm font-mono tracking-wider"
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
