import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Disc3, 
  FlaskConical, 
  Snowflake, 
  Gem, 
  MapPin, 
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { 
  threeForksDepot, 
  organicsCatalog, 
  waterIceCatalog, 
  hydrothermalCatalog 
} from '../../services/dataService';
import type { SampleTube } from '../../types/mission';

interface DiscoveryCatalogProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToLocation?: (lat: number, lon: number) => void;
}

export const DiscoveryCatalog: React.FC<DiscoveryCatalogProps> = ({
  isOpen,
  onClose,
  onFlyToLocation
}) => {
  const [activeTab, setActiveTab] = useState<'three_forks' | 'organics' | 'water_ice' | 'minerals'>('three_forks');
  const [selectedTube, setSelectedTube] = useState<SampleTube>(threeForksDepot.tubes[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bezel-shell w-full max-w-5xl h-[88vh] flex flex-col">
        <div className="bezel-core w-full h-full flex flex-col overflow-hidden text-zinc-300">
          
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-white/[0.08] bg-[#07090E] flex items-center justify-between font-mono">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300">
                <Sparkles className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                  ASTROBIOLOGY & GEOLOGICAL REPOSITORY
                </div>
                <h2 className="text-xs md:text-sm font-bold text-white flex items-center space-x-2 tracking-wide uppercase">
                  <span>SAMPLE DEPOT & MARS DISCOVERIES CATALOG</span>
                  <span className="text-[9px] px-2 py-0.2 rounded bg-white/[0.03] text-zinc-400 border border-white/10">
                    10 CACHED CORES
                  </span>
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

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/[0.08] bg-[#050608] px-4 space-x-1.5 text-xs font-mono overflow-x-auto">
            <button
              onClick={() => setActiveTab('three_forks')}
              className={`py-2 px-3 flex items-center space-x-1.5 transition-all ${
                activeTab === 'three_forks'
                  ? 'border-b-2 border-white text-white font-bold bg-white/[0.04]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5" />
              <span>THREE FORKS DEPOT (10)</span>
            </button>

            <button
              onClick={() => setActiveTab('organics')}
              className={`py-2 px-3 flex items-center space-x-1.5 transition-all ${
                activeTab === 'organics'
                  ? 'border-b-2 border-white text-white font-bold bg-white/[0.04]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>ORGANICS & BIOSIGNATURES</span>
            </button>

            <button
              onClick={() => setActiveTab('water_ice')}
              className={`py-2 px-3 flex items-center space-x-1.5 transition-all ${
                activeTab === 'water_ice'
                  ? 'border-b-2 border-white text-white font-bold bg-white/[0.04]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" />
              <span>WATER ICE RESERVES</span>
            </button>

            <button
              onClick={() => setActiveTab('minerals')}
              className={`py-2 px-3 flex items-center space-x-1.5 transition-all ${
                activeTab === 'minerals'
                  ? 'border-b-2 border-white text-white font-bold bg-white/[0.04]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Gem className="w-3.5 h-3.5" />
              <span>HYDROTHERMAL SILICA</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {/* TAB 1: THREE FORKS SAMPLE DEPOT */}
            {activeTab === 'three_forks' && (
              <div className="h-full flex flex-col md:flex-row overflow-hidden font-mono">
                {/* Left Tube Selector Grid */}
                <div className="w-full md:w-88 border-b md:border-b-0 md:border-r border-white/[0.08] overflow-y-auto p-3 space-y-2 bg-[#050608]">
                  <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                    TITANIUM CORE TUBE LEDGER
                  </div>
                  {threeForksDepot.tubes.map(tube => {
                    const isSel = selectedTube.tube_serial === tube.tube_serial;
                    return (
                      <div
                        key={tube.tube_serial}
                        onClick={() => setSelectedTube(tube)}
                        className={`p-3 rounded border cursor-pointer transition-all ${
                          isSel
                            ? 'bg-white/[0.08] border-white/40 shadow-sm'
                            : 'bg-[#0A0D14] border-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white flex items-center space-x-1.5">
                            <span className="w-5 h-5 rounded bg-white/10 text-white border border-white/10 flex items-center justify-center text-[9px]">
                              #{tube.tube_index}
                            </span>
                            <span className="uppercase">{tube.sample_name}</span>
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            SOL {tube.sol_dropped}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-1 font-sans">
                          {tube.rock_type}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Tube Detailed Dossier */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#07090E] space-y-5">
                  <div className="border-b border-white/[0.08] pb-4 flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                        TUBE SERIAL: {selectedTube.tube_serial}
                      </div>
                      <h1 className="text-xl md:text-2xl font-bold text-white mt-1 uppercase">
                        {selectedTube.sample_name} Core Sample
                      </h1>
                      <div className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-2">
                        <span>Formation: {selectedTube.formation}</span>
                        <span className="text-zinc-600">|</span>
                        <span>Length: {selectedTube.core_length_mm} mm</span>
                        <span className="text-zinc-600">|</span>
                        <span>Sol {selectedTube.sol_dropped} ({selectedTube.drop_date})</span>
                      </div>
                    </div>

                    {onFlyToLocation && (
                      <button
                        onClick={() => onFlyToLocation(selectedTube.coordinates.lat, selectedTube.coordinates.lon)}
                        className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black rounded text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>LOCATE ON GIS</span>
                      </button>
                    )}
                  </div>

                  {/* Coordinates & Geology */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-[#0A0D14] rounded border border-white/[0.08] text-xs space-y-1">
                      <div className="text-zinc-500 uppercase text-[9px]">SURFACE COORDINATES</div>
                      <div className="text-white font-bold">
                        {selectedTube.coordinates.lat.toFixed(5)}°N, {selectedTube.coordinates.lon.toFixed(5)}°E
                      </div>
                      <div className="text-zinc-400 text-[10px]">Elevation: {selectedTube.coordinates.elev_m} m</div>
                    </div>

                    <div className="p-3.5 bg-[#0A0D14] rounded border border-white/[0.08] text-xs space-y-1">
                      <div className="text-zinc-500 uppercase text-[9px]">LITHOLOGY CLASSIFICATION</div>
                      <div className="text-white font-bold">{selectedTube.rock_type}</div>
                      <div className="text-zinc-400 text-[10px]">Hermetic Titanium Enclosure</div>
                    </div>
                  </div>

                  {/* Astrobiology and Science Value */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      SCIENTIFIC VALUE & ASTROBIOLOGICAL OBJECTIVE
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed bg-[#0A0D14] p-4 rounded border border-white/[0.08] font-sans">
                      {selectedTube.scientific_value}
                    </p>
                  </div>

                  {/* NASA MSR Retrieval Specification */}
                  <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded text-xs text-zinc-300 space-y-1.5 font-sans">
                    <div className="font-bold flex items-center space-x-1.5 text-white font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>MARS SAMPLE RETURN (MSR) RECOVERY CONTEXT</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Deposited horizontally on flat Jezero regolith with 5-10m clearance. Designed for acquisition by Sample Recovery Helicopters or direct astronaut glove stowage into the Mars Ascent Vehicle (MAV).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ORGANICS & BIOSIGNATURES */}
            {activeTab === 'organics' && (
              <div className="h-full overflow-y-auto p-6 space-y-4 font-mono">
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                  CONFIRMED EXTRATERRESTRIAL ORGANIC MOLECULES & BIOSIGNATURE CANDIDATES
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {organicsCatalog.map(item => (
                    <div key={item.id} className="p-4 bg-[#0A0D14] rounded border border-white/[0.08] space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] text-zinc-400 font-bold">{item.instrument}</span>
                          <h3 className="text-sm font-bold text-white uppercase">{item.discovery_name}</h3>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/10">
                          SOL {item.sol_detected}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-400 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.location} ({item.coordinates.lat}°N, {item.coordinates.lon}°E)</span>
                      </div>

                      <div>
                        <div className="text-[9px] text-zinc-500 uppercase">IDENTIFIED MOLECULES:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.molecules_detected.map((m, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white border border-white/10">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-zinc-300 leading-relaxed pt-2 border-t border-white/[0.06] font-sans">
                        <span className="text-zinc-500 font-bold font-mono">Context: </span>
                        {item.geological_context}
                      </div>

                      <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.08] text-[11px] text-zinc-300 font-sans">
                        <span className="font-bold text-white font-mono">Implication: </span>
                        {item.biosignature_significance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: WATER ICE DEPOSITS */}
            {activeTab === 'water_ice' && (
              <div className="h-full overflow-y-auto p-6 space-y-4 font-mono">
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                  SUB-SURFACE WATER ICE & GLACIAL MANTLES FOR IN-SITU RESOURCE UTILIZATION (ISRU)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {waterIceCatalog.map(item => (
                    <div key={item.id} className="p-4 bg-[#0A0D14] rounded border border-white/[0.08] space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] text-zinc-400 font-bold">{item.mission}</span>
                          <h3 className="text-sm font-bold text-white uppercase">{item.name}</h3>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white border border-white/15">
                          {item.purity_pct}% PURE ICE
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-zinc-500">REGION:</span> {item.region}
                        </div>
                        <div>
                          <span className="text-zinc-500">DEPTH:</span> {item.depth_cm} cm
                        </div>
                      </div>

                      <div className="text-xs text-zinc-300 leading-relaxed font-sans">
                        {item.discovery_summary}
                      </div>

                      <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.08] text-[11px] text-zinc-300 font-sans">
                        <span className="font-bold text-white font-mono">Human ISRU Value: </span>
                        {item.astronaut_in_situ_resource_utilization}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: HYDROTHERMAL MINERALS */}
            {activeTab === 'minerals' && (
              <div className="h-full overflow-y-auto p-6 space-y-4 font-mono">
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                  HYDROTHERMAL SILICA, COMBO CARBONATES & PREBIOTIC BORON SALTS
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hydrothermalCatalog.map(item => (
                    <div key={item.id} className="p-4 bg-[#0A0D14] rounded border border-white/[0.08] space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] text-zinc-400 font-bold">{item.mission}</span>
                          <h3 className="text-sm font-bold text-white uppercase">{item.mineral_system}</h3>
                        </div>
                      </div>

                      <div className="text-xs text-zinc-400 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.site}</span>
                      </div>

                      <div className="text-xs text-zinc-300 leading-relaxed font-sans">
                        <span className="text-zinc-500 font-bold font-mono">Discovery History: </span>
                        {item.discovery_story}
                      </div>

                      <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.08] text-[11px] text-zinc-300 font-sans">
                        <span className="font-bold text-white font-mono">Planetary Evolution: </span>
                        {item.geological_significance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
