import React, { useState } from 'react';
import { 
  ShieldAlert, 
  X, 
  Crosshair, 
  AlertOctagon, 
  Activity,
  Flame,
  Radio,
  Compass,
  AlertTriangle,
  Layers
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
      <div className="w-full max-w-5xl h-[88vh] bg-[#080B12] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-300">
        
        {/* Panel Header */}
        <div className="p-5 border-b border-white/[0.08] bg-[#0C101A] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-red-400 uppercase tracking-[0.2em] font-bold">
                ASTRONAUT FLIGHT SAFETY DIRECTIVE
              </div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center space-x-2 tracking-tight">
                <span>Hazard Radar & Surface Caution Buffer Zones</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-600/50">
                  DEFCON 2 MONITOR
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Filter buttons */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/[0.08] text-xs font-mono">
              {['ALL', 'CRITICAL', 'HIGH'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterSeverity === sev
                      ? 'bg-red-950/80 text-red-300 font-semibold border border-red-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Master-Detail Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Hazard List */}
          <div className="w-full md:w-96 border-b md:border-b-0 md:border-r border-white/[0.08] overflow-y-auto p-4 space-y-3 bg-[#06080D]">
            {filteredHazards.map(hazard => {
              const isSelected = activeHazard?.id === hazard.id;
              const isCrit = hazard.severity === 'CRITICAL';

              return (
                <div
                  key={hazard.id}
                  onClick={() => onSelectHazard(hazard)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-950/30 border-red-500/60 shadow-lg ring-1 ring-red-500/40'
                      : 'bg-[#0B0E17] border-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                    <span className="font-bold text-zinc-300">{hazard.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCrit
                          ? 'bg-red-900/60 text-red-300 border border-red-600/40 animate-pulse'
                          : 'bg-amber-900/60 text-amber-300 border border-amber-600/40'
                      }`}
                    >
                      {hazard.severity}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight mb-1">
                    {hazard.name}
                  </h3>

                  <div className="text-[11px] text-zinc-400 flex items-center justify-between font-mono">
                    <span>{hazard.region}</span>
                    <span className="text-[#E25B38] font-semibold">{hazard.threat_class.replace('CLASS_1_', '')}</span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>Caution Radius:</span>
                    <span className="text-white font-bold">{hazard.caution_radius_m}m</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Hazard Dossier */}
          {activeHazard && (
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#080B12]">
              {/* Header Card */}
              <div className="p-1 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.08]">
                <div className="p-6 rounded-[calc(1rem-0.125rem)] bg-[#0C101A] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 font-mono text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-red-950/60 text-red-400 border border-red-500/40 font-bold">
                        {activeHazard.severity} SEVERITY
                      </span>
                      <span className="text-zinc-400">{activeHazard.id}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-300">{activeHazard.threat_class}</span>
                    </div>

                    <div className="text-xs font-mono text-zinc-400">
                      Coordinates: <span className="text-white font-bold">{activeHazard.coordinates.lat}°N, {activeHazard.coordinates.lon}°E</span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    {activeHazard.name}
                  </h2>
                  <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-normal">
                    {activeHazard.incident_history}
                  </p>
                </div>
              </div>

              {/* Physical Terrain Mechanism */}
              <div className="p-5 rounded-2xl bg-[#0B0E17] border border-white/[0.06] space-y-2">
                <div className="text-[11px] font-mono text-[#E25B38] font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#E25B38]" />
                  <span>PHYSICAL TERRAIN MECHANISM & HAZARD DYNAMICS</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeHazard.terrain_mechanism}
                </p>
              </div>

              {/* Tactical EVA Avoidance Protocol */}
              <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                <div className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                  <span>ASTRONAUT EVA AVOIDANCE & COUNTERMEASURE PROTOCOL</span>
                </div>
                <p className="text-xs text-red-200/90 leading-relaxed">
                  {activeHazard.astronaut_protocol}
                </p>
              </div>

              {/* Detection Signature */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2">
                <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>REMOTE SENSING & ORBITAL DETECTION SIGNATURE</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeHazard.detection_signature}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between text-xs font-mono">
                <div className="text-zinc-500">
                  Defcon Radius: <span className="text-[#E25B38] font-bold">{activeHazard.caution_radius_m}m</span> buffer zone enforced
                </div>
                <button
                  onClick={() => {
                    onSelectHazard(activeHazard);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#E25B38] hover:bg-[#C85332] text-white font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-[#E25B38]/20"
                >
                  <Crosshair className="w-4 h-4" />
                  <span>Focus Hazard on Tactical Map</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
