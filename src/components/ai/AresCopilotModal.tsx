import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Cpu, 
  Settings, 
  Check,
  CornerDownLeft
} from 'lucide-react';
import { aresAI } from '../../services/aiService';
import type { ChatMessage, CopilotMode } from '../../services/aiService';

interface AresCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiMode: CopilotMode;
  onToggleMode: () => void;
}

const INITIAL_ARES_MESSAGE: ChatMessage = {
  id: 'init',
  sender: 'ares',
  content: `[ARES MISSION SUBSYSTEM // TELEMETRY DATABASE ACTIVE]
SYS_STATE: READY | OWLT: +14m 22s | REPOSITORIES: 5 TRAVERSES, 4 LANDERS, 7 EXCLUSION ZONES, THREE FORKS CACHE

Available Telemetry Inquiries:
- SAMPLE CACHE: 10 hermetic titanium core dossiers cached at Three Forks
- TRAVERSE DYNAMICS: Wheel slip, terrain wear & sand trap extraction history (Troy, Purgatory, Séítah)
- SURFACE CHEMISTRY: Calcium perchlorate distribution & suit wash decontamination
- IN-SITU RESOURCES: Subsurface glacial dielectric permittivity & water-equivalent hydrogen (Utopia / Arcadia)
- EVA NAVIGATION: Slope gradient thresholds, thermal diurnal cycling & comm shadow zones

Select a tactical directive below or enter a parameter query.`,
  timestamp: 'FLIGHT READY',
  engineUsed: 'ares-local-rag',
  citations: ['NASA Planetary Data System (PDS)', 'JPL Tactical Trajectory Archives']
};

function createUserMessage(queryText: string): ChatMessage {
  return {
    id: `usr-${Date.now()}`,
    sender: 'user',
    content: queryText,
    timestamp: new Date().toLocaleTimeString()
  };
}

function createErrorMessage(errText: string): ChatMessage {
  return {
    id: `err-${Date.now()}`,
    sender: 'system',
    content: `[SYS_FAULT] Telemetry processing fault: ${errText}`,
    timestamp: new Date().toLocaleTimeString()
  };
}

export const AresCopilotModal: React.FC<AresCopilotModalProps> = ({
  isOpen,
  onClose,
  aiMode,
  onToggleMode
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_ARES_MESSAGE]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Settings inputs
  const [geminiKeyInput, setGeminiKeyInput] = useState(aresAI.getGeminiKey());
  const [localUrlInput, setLocalUrlInput] = useState(aresAI.getLocalEndpoint());
  const [localModelInput, setLocalModelInput] = useState(aresAI.getLocalModel());
  const [savedSettingsNote, setSavedSettingsNote] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const userMsg = createUserMessage(queryText);
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await aresAI.query(queryText, messages);
      setMessages(prev => [...prev, response]);
    } catch (e) {
      setMessages(prev => [...prev, createErrorMessage(String(e))]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    aresAI.setGeminiKey(geminiKeyInput);
    aresAI.setLocalEndpoint(localUrlInput);
    aresAI.setLocalModel(localModelInput);
    setSavedSettingsNote(true);
    setTimeout(() => {
      setSavedSettingsNote(false);
      setShowSettings(false);
    }, 1200);
  };

  const quickPrompts = [
    { label: 'Three Forks Samples', prompt: 'List all 10 sample tubes cached at Three Forks and their rock formations.' },
    { label: 'Troy Sand Trap', prompt: 'What happened to Spirit at Troy and what are the terrain warning signs?' },
    { label: 'Perchlorate Protocol', prompt: 'What are the health hazards of Martian perchlorates and required suit decontamination?' },
    { label: 'Utopia Ice Sheet', prompt: 'Where is the subsurface water ice sheet in Utopia Planitia and how deep is it?' },
    { label: 'Curiosity Gediz Vallis', prompt: 'What recent discoveries did Curiosity make on Gediz Vallis Ridge?' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bezel-shell w-full max-w-3xl h-[88vh] flex flex-col">
        <div className="bezel-core w-full h-full flex flex-col overflow-hidden text-zinc-300">
          
          {/* Header */}
          <div className="p-4 border-b border-white/[0.08] bg-[#07090E] flex items-center justify-between font-mono">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300">
                <Bot className="w-3.5 h-3.5 text-zinc-300" />
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">
                  TACTICAL INTELLIGENCE // COPILOT
                </div>
                <h2 className="text-xs font-bold text-white flex flex-wrap items-center gap-2">
                  <span className="tracking-tight uppercase">ARES TELEMETRY CONSOLE</span>
                  <span className="text-[9px] px-2 py-0.2 rounded border bg-white/[0.03] text-zinc-300 border-white/10 tracking-wider">
                    {aiMode === 'online' ? 'LINK: DTE RELAY (8.4 GHz)' : 'LINK: LOCAL QWEN (OFFLINE)'}
                  </span>
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                title="Copilot Engine Settings"
                className={`p-1.5 rounded transition-all ${
                  showSettings
                    ? 'bg-white text-black'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onToggleMode}
                title={aiMode === 'online' ? 'Toggle to Local Qwen 2.5 7B' : 'Toggle to Online Gemini'}
                className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-300 rounded flex items-center space-x-1.5 transition-all"
              >
                <Cpu className="w-3 h-3 text-zinc-400" />
                <span className="hidden sm:inline text-[10px]">ENGINE:</span>
                <span className="font-bold text-[10px]">{aiMode.toUpperCase()}</span>
              </button>

              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white rounded transition-colors"
                title="Close (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Drawer (if toggled) */}
          {showSettings && (
            <form onSubmit={handleSaveSettings} className="p-4 bg-[#0A0D14] border-b border-white/[0.08] text-xs font-mono space-y-3">
              <div className="flex justify-between items-center text-zinc-300 font-bold uppercase text-[10px]">
                <span>COPILOT ENGINE CONFIGURATION</span>
                {savedSettingsNote && (
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>SETTINGS SAVED</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-1 uppercase tracking-wider">
                    Google Gemini API Key (Online Mode)
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiKeyInput}
                    onChange={e => setGeminiKeyInput(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-white placeholder-zinc-600 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-zinc-400 block mb-1 uppercase tracking-wider">
                    Local Ollama URL (Offline Mode)
                  </label>
                  <input
                    type="text"
                    value={localUrlInput}
                    onChange={e => setLocalUrlInput(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-white placeholder-zinc-600 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[9px] text-zinc-400 block mb-1 uppercase tracking-wider">
                    Local Model ID (e.g. qwen2.5:7b-instruct)
                  </label>
                  <input
                    type="text"
                    value={localModelInput}
                    onChange={e => setLocalModelInput(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-white placeholder-zinc-600 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-[9px] text-zinc-500">
                  Run setup_offline_qwen.bat to download and launch local Qwen.
                </span>
                <button
                  type="submit"
                  className="px-3 py-1 bg-white hover:bg-zinc-200 text-black font-bold text-[10px] rounded transition-all active:scale-95"
                >
                  SAVE CONFIG
                </button>
              </div>
            </form>
          )}

          {/* Chat Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#050608]">
            {messages.map(msg => {
              const isUser = msg.sender === 'user';
              const isSystem = msg.sender === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="p-3 bg-red-950/30 border border-red-500/30 rounded text-red-300 text-xs font-mono">
                    {msg.content}
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-1.5 text-[9px] font-mono text-zinc-500 mb-1">
                    <span className="font-bold uppercase text-zinc-400">
                      {isUser ? 'ASTRONAUT OPERATOR' : 'ARES COPILOT'}
                    </span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {msg.engineUsed && (
                      <>
                        <span>•</span>
                        <span className="text-zinc-400 font-mono">{msg.engineUsed}</span>
                      </>
                    )}
                  </div>

                  <div
                    className={`p-3.5 rounded text-xs leading-relaxed max-w-[90%] whitespace-pre-wrap ${
                      isUser
                        ? 'bg-white text-black font-medium rounded-tr-none shadow-md font-sans'
                        : 'bg-white/[0.03] text-zinc-200 border border-white/10 rounded-tl-none font-mono'
                    }`}
                  >
                    {msg.content}

                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1 text-[9px] text-zinc-400 font-mono">
                        <span className="text-zinc-500">CITATIONS:</span>
                        {msg.citations.map((cite, idx) => (
                          <span key={idx} className="bg-white/10 px-1.5 py-0.2 rounded text-zinc-300 border border-white/10">
                            {cite}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center space-x-2 text-zinc-400 text-xs py-2 font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Subsystem query executing: correlating tactical telemetry...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Chips */}
          <div className="px-3 py-2 bg-[#07090E] border-t border-white/[0.08] flex items-center space-x-1.5 overflow-x-auto">
            <span className="text-[9px] font-mono text-zinc-500 flex-shrink-0 uppercase font-semibold">
              PARAMETERS:
            </span>
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.prompt)}
                className="px-2 py-0.8 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 border border-white/[0.08] text-zinc-300 hover:text-white rounded text-[10px] font-mono flex-shrink-0 transition-all active:scale-95"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="p-3 bg-[#050608] border-t border-white/[0.08] flex items-center space-x-2 font-mono">
            <input
              type="text"
              placeholder="Enter telemetry query (e.g. Three Forks core #6, Troy sand trap extraction)..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-white/[0.03] border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-3.5 py-2 bg-white hover:bg-zinc-200 disabled:opacity-30 text-black font-bold text-xs rounded transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
            >
              <span>SEND</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
