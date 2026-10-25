import React from 'react';
import { 
  Globe2, 
  Map as MapIcon, 
  ShieldAlert, 
  Compass, 
  Database, 
  Bot,
  ExternalLink,
  BookOpen
} from 'lucide-react';

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
  onOpenRefs
}) => {
  return (
    <header className="h-14 bg-[#000000] border-b border-white/[0.08] px-4 md:px-8 flex items-center justify-between z-[1100] select-none backdrop-blur-2xl font-sans">
      {/* 1. Left: Architectural Brand Typography (SpaceX / Aerospace standard) */}
      <div className="flex items-center space-x-8">
        <div 
          onClick={() => onSelectTab('missions')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-md bg-white text-black flex items-center justify-center font-mono font-black text-xs tracking-tighter shadow-md">
            ♂
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="text-sm font-black tracking-[0.25em] text-white uppercase">
              ARES
            </span>
            <span className="h-3.5 w-px bg-white/20 hidden sm:block" />
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase hidden sm:block">
              MARS ATLAS
            </span>
          </div>
        </div>

        {/* 2. Main Navigation Modes (Clean, Connected, Uncluttered) */}
        <nav className="flex items-center space-x-1 font-mono text-xs">
          <button
            onClick={() => onSelectTab('missions')}
            className={`px-3 py-1.5 rounded-lg transition-all tracking-wide ${
              currentTab === 'missions'
                ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            MISSIONS
          </button>

          <button
            onClick={() => {
              onSelectTab('map');
              onToggleView('3d');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all tracking-wide ${
              currentTab === 'map' && viewMode === '3d'
                ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>3D GLOBE</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('map');
              onToggleView('2d');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all tracking-wide ${
              currentTab === 'map' && viewMode === '2d'
                ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>TACTICAL GIS</span>
          </button>
        </nav>
      </div>

      {/* 3. Right: Specialized Exploration Tools & Research Citations */}
      <div className="flex items-center space-x-2 font-mono text-xs">
        <button
          onClick={onOpenHazards}
          title="Classified Terrain Hazards & Sand Trap Exclusion Zones"
          className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white rounded-lg flex items-center space-x-1.5 transition-all"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden lg:inline text-[11px] tracking-wide">HAZARDS</span>
        </button>

        <button
          onClick={onOpenDiscoveries}
          title="Three Forks Sample Depot & Core Tube Inventory"
          className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white rounded-lg flex items-center space-x-1.5 transition-all"
        >
          <Database className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden lg:inline text-[11px] tracking-wide">SAMPLE CACHE</span>
        </button>

        <button
          onClick={onOpenEVA}
          title="Astronaut Extravehicular Traversal Route Planner"
          className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white rounded-lg flex items-center space-x-1.5 transition-all"
        >
          <Compass className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden lg:inline text-[11px] tracking-wide">EVA PLANNER</span>
        </button>

        {onOpenRefs && (
          <button
            onClick={onOpenRefs}
            title="NASA PDS & ESA Published Research Papers"
            className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white rounded-lg flex items-center space-x-1.5 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline text-[11px] tracking-wide">RESEARCH REFS</span>
          </button>
        )}

        {/* High-End Monochromatic Copilot Pill (Zero AI-slop orange) */}
        <button
          onClick={onOpenCopilot}
          title="Ares Planetary Telemetry Assistant"
          className="ml-2 px-4 py-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-full shadow-lg flex items-center space-x-1.5 transition-all active:scale-95 tracking-wide"
        >
          <Bot className="w-3.5 h-3.5 text-black" />
          <span>COPILOT</span>
        </button>
      </div>
    </header>
  );
};
