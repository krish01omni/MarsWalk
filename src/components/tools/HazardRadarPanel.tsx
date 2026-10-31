import React, { useState } from 'react';
import { 
  ShieldAlert, 
  X, 
  Crosshair, 
  ArrowRight
} from 'lucide-react';
import { classifiedHazards } from '../../services/dataService';
import type { ClassifiedHazard } from '../../types/mission';

interface HazardRadarPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHazard: (h: ClassifiedHazard) => void;
  selectedHazard?: ClassifiedHazard | null;
}

export const HazardRadarPanel: React.FC<HazardRadarPanelProps> = ({
  isOpen,
  onClose,
  onSelectHazard,
  selectedHazard
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredHazards = classifiedHazards.filter(h => {
    if (filterSeverity === 'ALL') return true;
    return h.severity === filterSeverity;
  });

  const activeHazard = selectedHazard || classifiedHazards[0];

  return (
    <div className="fixed inset-0 z-[2000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none">
      <div className="bezel-shell w-full max-w-5xl h-[88vh] flex flex-col">
        <div className="bezel-core w-full h-full flex flex-col overflow-hidden text-zinc-300">
          
          {/* Panel Header */}
          <div className="p-4 md:p-5 border-b border-white/[0.08] bg-[#07090E] flex items-center justify-between font-mono">
            <div className="flex items-center space-x-3.5">
              <div className="w-8 h-8 rounded bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
                <span className="text-[10px] font-mono font-bold text-red-400">DEF2</span>
              </div>
              <div>
                <div className="text-[9px] text-red-400 uppercase tracking-[0.2em] font-bold">
                  ASTRONAUT SAFETY DIRECTIVE // DEFCON 2
                </div>
                <h2 className="text-xs md:text-sm font-bold text-white flex items-center space-x-2 tracking-wide uppercase">
                  <span>Hazard Radar & Surface Caution Buffer Zones</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              {/* Filter buttons */}
              <div className="flex bg-black/60 p-0.5 rounded border border-white/[0.08] text-xs">
                {['ALL', 'CRITICAL', 'HIGH'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-2.5 py-0.8 rounded text-[10px] font-mono transition-all ${
                      filterSeverity === sev
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white rounded transition-colors"
                title="Close (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Body: Master-Detail Layout */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: Hazard List */}
            <div className="w-full md:w-88 border-b md:border-b-0 md:border-r border-white/[0.08] overflow-y-auto p-3 space-y-2.5 bg-[#050608]">
              {filteredHazards.map(hazard => {
                const isSelected = activeHazard?.id === hazard.id;
                const isCrit = hazard.severity === 'CRITICAL';

                return (
                  <div
                    key={hazard.id}
                    onClick={() => onSelectHazard(hazard)}
                    className={`p-3.5 rounded border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-red-950/30 border-red-500/60 shadow-lg'
                        : 'bg-[#0A0D14] border-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1 font-mono">
                      <span className="font-bold text-zinc-300">{hazard.id}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          isCrit
                            ? 'bg-red-900/60 text-red-300 border border-red-600/40'
                            : 'bg-amber-900/60 text-amber-300 border border-amber-600/40'
                        }`}
                      >
                        {hazard.severity}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono mb-1">
                      {hazard.name}
                    </h3>

                    <div className="text-[10px] text-zinc-400 flex items-center justify-between font-mono">
                      <span>{hazard.region}</span>
                      <span className="text-zinc-300">{hazard.threat_class.replace('CLASS_1_', '')}</span>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[9px] font-mono text-zinc-500">
                      <span>BUFFER RADIUS:</span>
                      <span className="text-white font-bold">{hazard.caution_radius_m}m</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Detailed Hazard Dossier */}
            {activeHazard && (
              <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 bg-[#07090E]">
                {/* Header Card */}
                <div className="p-5 rounded bg-[#0A0D14] border border-white/[0.08] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-500/40 font-bold text-[10px]">
                        {activeHazard.severity} SEVERITY
                      </span>
                      <span className="text-zinc-400 text-[11px]">{activeHazard.id}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-300 text-[11px]">{activeHazard.threat_class}</span>
                    </div>

                    <div className="text-[11px] text-zinc-400">
                      COORDINATES: <span className="text-white font-bold">{activeHazard.coordinates.lat}°N, {activeHazard.coordinates.lon}°E</span>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-white uppercase font-mono tracking-tight">
                    {activeHazard.name}
                  </h2>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {activeHazard.incident_history}
                  </p>
                </div>

                {/* Physical Terrain Mechanism */}
                <div className="p-4 rounded bg-[#0A0D14] border border-white/[0.06] space-y-1.5">
                  <div className="text-[10px] font-mono text-zinc-300 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                    <span>PHYSICAL TERRAIN MECHANISM & HAZARD DYNAMICS</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {activeHazard.terrain_mechanism}
                  </p>
                </div>

                {/* Tactical EVA Avoidance Protocol */}
                <div className="p-4 rounded bg-red-950/20 border border-red-500/30 space-y-1.5">
                  <div className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                    <span>ASTRONAUT EVA AVOIDANCE & COUNTERMEASURE PROTOCOL</span>
                  </div>
                  <p className="text-xs text-red-200/90 leading-relaxed font-sans">
                    {activeHazard.astronaut_protocol}
                  </p>
                </div>

                {/* Detection Signature */}
                <div className="p-4 rounded bg-[#0A0D14] border border-white/[0.06] space-y-1.5">
                  <div className="text-[10px] font-mono text-zinc-300 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                    <span>REMOTE SENSING & ORBITAL DETECTION SIGNATURE</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {activeHazard.detection_signature}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between text-xs font-mono">
                  <div className="text-zinc-500 text-[11px]">
                    DEFCON EXCLUSION: <span className="text-red-400 font-bold">{activeHazard.caution_radius_m}m</span> BUFFER ZONE
                  </div>
                  <button
                    onClick={() => {
                      onSelectHazard(activeHazard);
                      onClose();
                    }}
                    className="group pl-3 pr-2 py-1.5 rounded bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center space-x-2 transition-all active:scale-95 shadow-md"
                  >
                    <span>FOCUS ON GIS MAP</span>
                    <div className="w-5 h-5 rounded bg-black/10 flex items-center justify-center">
                      <Crosshair className="w-3 h-3 text-black group-hover:rotate-45 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
