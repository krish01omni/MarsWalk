import React from 'react';

interface TacticalHeaderProps {
  currentTab: 'missions' | 'map';
  onSelectTab: (tab: 'missions' | 'map') => void;
  viewMode: '3d' | '2d';
  onToggleView: (mode: '3d' | '2d') => void;
  onOpenCopilot: () => void;
  onOpenEVA: () => void;
  onOpenDiscoveries: () => void;
  onOpenHazards: () => void;
  onOpenRefs?: () => void;
  onOpenOfflineSetup: () => void;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({
  currentTab,
  onSelectTab,
  viewMode,
  onToggleView,
  onOpenCopilot,
  onOpenEVA,
  onOpenDiscoveries,
  onOpenHazards,
  onOpenRefs,
  onOpenOfflineSetup
}) => {
  return (
    <header className="h-14 bg-[#050608]/95 border-b border-white/[0.08] px-4 md:px-6 flex items-center justify-between z-[1100] select-none backdrop-blur-xl font-sans">
      {/* 1. Left: Architectural Brand Typography (SpaceX / Aerospace Standard) */}
      <div className="flex items-center space-x-6">
        <div 
          onClick={() => onSelectTab('missions')}
          className="flex items-center space-x-3 cursor-pointer group"
          title="Return to Planetary Missions Directory"
        >
          {/* Machined Planetary Glyphic Emblem */}
          <div className="w-7 h-7 rounded border border-white/20 bg-white/[0.04] flex items-center justify-center font-mono font-bold text-xs text-white shadow-sm group-hover:border-white transition-colors">
            ♂
          </div>

          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold tracking-[0.2em] text-white uppercase font-mono">
                MARSWALK
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
                // v1.0
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-[9px] font-mono text-zinc-400 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
              <span className="text-zinc-400 uppercase hidden sm:inline">DTE CARRIER: LOCKED</span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="text-zinc-500">OWLT: +14m 22s</span>
            </div>
          </div>
        </div>

        {/* 2. Main Flight Navigation (Clean Segmented Aerospace Tabs, Pure Typography) */}
        <nav className="flex items-center bg-white/[0.03] p-1 rounded-md border border-white/[0.07] font-mono text-xs">
          <button
            onClick={() => onSelectTab('missions')}
            className={`px-3 py-1 rounded transition-all tracking-wider font-medium flex items-center space-x-1.5 ${
              currentTab === 'missions'
                ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span>MISSIONS</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-black/40 text-zinc-400 border border-white/5 font-mono">
              14
            </span>
          </button>

          <button
            onClick={() => {
              onSelectTab('map');
              onToggleView('3d');
            }}
            className={`px-3 py-1 rounded transition-all tracking-wider font-medium ${
              currentTab === 'map' && viewMode === '3d'
                ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span>3D GLOBE</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('map');
              onToggleView('2d');
            }}
            className={`px-3 py-1 rounded transition-all tracking-wider font-medium ${
              currentTab === 'map' && viewMode === '2d'
                ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span>TACTICAL GIS</span>
          </button>
        </nav>
      </div>

      {/* 3. Right: Tactical Systems & Copilot (Austere Aerospace Actions) */}
      <div className="flex items-center space-x-2 font-mono text-xs">
        <button
          onClick={onOpenHazards}
          title="Classified Terrain Hazards & Sand Trap Exclusion Zones"
          className="px-2.5 py-1.2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white rounded transition-all active:scale-[0.98]"
        >
          <span className="text-[11px] tracking-wider uppercase">HAZARDS</span>
        </button>

        <button
          onClick={onOpenDiscoveries}
          title="Three Forks Sample Depot & Core Tube Inventory"
          className="px-2.5 py-1.2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white rounded transition-all active:scale-[0.98]"
        >
          <span className="text-[11px] tracking-wider uppercase">SAMPLE CACHE</span>
        </button>

        <button
          onClick={onOpenEVA}
          title="Astronaut Extravehicular Traversal Route Planner"
          className="px-2.5 py-1.2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white rounded transition-all active:scale-[0.98]"
        >
          <span className="text-[11px] tracking-wider uppercase">EVA PLANNER</span>
        </button>

        {onOpenRefs && (
          <button
            onClick={onOpenRefs}
            title="NASA PDS & ESA Published Research Papers"
            className="px-2.5 py-1.2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white rounded transition-all active:scale-[0.98]"
          >
            <span className="hidden xl:inline text-[11px] tracking-wider uppercase">RESEARCH</span>
          </button>
        )}

        <button
          onClick={onOpenOfflineSetup}
          title="Offline Local Deployment & GitHub Field Kit"
          className="px-2.5 py-1.2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white rounded transition-all active:scale-[0.98]"
        >
          <span className="hidden xl:inline text-[11px] tracking-wider uppercase">LOCAL SETUP</span>
        </button>

        {/* High-End Raycast-Grade White Phosphor Copilot Button with Keycap */}
        <button
          onClick={onOpenCopilot}
          title="Mars Telemetry Copilot (Press Cmd+K / Ctrl+K)"
          className="group ml-1 pl-3 pr-2 py-1 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded flex items-center space-x-2 transition-all shadow-md active:scale-[0.98] tracking-wider font-mono"
        >
          <span>COPILOT</span>
          <span className="px-1.5 py-0.5 rounded bg-black/10 text-[10px] font-mono font-semibold tracking-wider">
            ⌘K
          </span>
        </button>
      </div>
    </header>
  );
};
