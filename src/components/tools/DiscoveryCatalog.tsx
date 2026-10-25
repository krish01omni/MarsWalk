import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Disc3, 
  FlaskConical, 
  Snowflake, 
  Gem, 
  MapPin, 
  Info,
  CheckCircle2
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
      <div className="w-full max-w-5xl h-[88vh] bg-[#080B12] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-300">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] bg-[#0C101A] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                ASTROBIOLOGY & GEOLOGICAL REPOSITORY
              </div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>SAMPLE DEPOT & MARS DISCOVERIES CATALOG</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/50">
                  10 CACHED TUBES
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#242E40] text-zinc-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#242E40] bg-[#161B22] px-4 space-x-2 text-xs">
          <button
            onClick={() => setActiveTab('three_forks')}
            className={`py-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition-all ${
              activeTab === 'three_forks'
                ? 'border-cyan-400 text-cyan-400 font-bold bg-[#1F2937]/50'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>Three Forks Sample Depot (10 Tubes)</span>
          </button>

          <button
            onClick={() => setActiveTab('organics')}
            className={`py-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition-all ${
              activeTab === 'organics'
                ? 'border-purple-400 text-purple-400 font-bold bg-[#1F2937]/50'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Organics & Biosignatures</span>
          </button>

          <button
            onClick={() => setActiveTab('water_ice')}
            className={`py-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition-all ${
              activeTab === 'water_ice'
                ? 'border-blue-400 text-blue-400 font-bold bg-[#1F2937]/50'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>Water Ice Reserves</span>
          </button>

          <button
            onClick={() => setActiveTab('minerals')}
            className={`py-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition-all ${
              activeTab === 'minerals'
                ? 'border-emerald-400 text-emerald-400 font-bold bg-[#1F2937]/50'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Gem className="w-3.5 h-3.5" />
            <span>Hydrothermal Silica & Carbonates</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {/* TAB 1: THREE FORKS SAMPLE DEPOT */}
          {activeTab === 'three_forks' && (
            <div className="h-full flex overflow-hidden">
              {/* Left Tube Selector Grid */}
              <div className="w-96 border-r border-[#242E40] overflow-y-auto p-3 space-y-2 bg-[#0D1117]/80">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                  TITANIUM SAMPLE CORE CACHE
                </div>
                {threeForksDepot.tubes.map(tube => {
                  const isSel = selectedTube.tube_serial === tube.tube_serial;
                  return (
                    <div
                      key={tube.tube_serial}
                      onClick={() => setSelectedTube(tube)}
                      className={`p-3 rounded border cursor-pointer transition-all ${
                        isSel
                          ? 'bg-[#1F2937] border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'bg-[#161B22] border-[#242E40] hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <span className="w-5 h-5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-[10px]">
                            #{tube.tube_index}
                          </span>
                          <span>{tube.sample_name}</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Sol {tube.sol_dropped}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        {tube.rock_type}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Tube Detailed Dossier */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#131720] space-y-5">
                <div className="border-b border-[#242E40] pb-4 flex justify-between items-start">
                  <div>
                    <div className="text-xs text-cyan-400 uppercase tracking-widest font-bold">
                      TUBE SERIAL NUMBER: {selectedTube.tube_serial}
                    </div>
                    <h1 className="text-2xl font-bold text-white mt-1">
                      {selectedTube.sample_name} Core Sample
                    </h1>
                    <div className="text-sm text-zinc-400 mt-1 flex items-center space-x-3">
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
                      className="px-3 py-1.5 bg-[#242E40] hover:bg-cyan-600 hover:text-black rounded text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>FLY TO DEPOT</span>
                    </button>
                  )}
                </div>

                {/* Coordinates & Geology */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#161B22] rounded border border-[#242E40] text-xs space-y-1">
                    <div className="text-zinc-500 uppercase text-[10px]">SURFACE COORDINATES</div>
                    <div className="text-white font-bold">
                      {selectedTube.coordinates.lat.toFixed(5)}°N, {selectedTube.coordinates.lon.toFixed(5)}°E
                    </div>
                    <div className="text-zinc-400 text-[11px]">Elevation: {selectedTube.coordinates.elev_m} m</div>
                  </div>

                  <div className="p-3 bg-[#161B22] rounded border border-[#242E40] text-xs space-y-1">
                    <div className="text-zinc-500 uppercase text-[10px]">LITHOLOGY CLASSIFICATION</div>
                    <div className="text-cyan-400 font-bold">{selectedTube.rock_type}</div>
                    <div className="text-zinc-400 text-[11px]">Sealed Hermetic Titanium Tube</div>
                  </div>
                </div>

                {/* Astrobiology and Science Value */}
                <div className="space-y-1.5">
                  <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center">
                    <Info className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                    SCIENTIFIC VALUE & ASTROBIOLOGY OBJECTIVE
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed bg-[#161B22] p-4 rounded border border-[#242E40]">
                    {selectedTube.scientific_value}
                  </p>
                </div>

                {/* NASA MSR & Human Mission Recovery Context */}
                <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded text-xs text-cyan-200 space-y-2">
                  <div className="font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>MARS SAMPLE RETURN (MSR) RETRIEVAL SPECIFICATION</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    This tube is laid horizontally on the flat regolith at Three Forks with a 5 to 10-meter separation from adjacent tubes. Designed for grappling by Sample Recovery Helicopters or direct astronaut glove stowage into the Mars Ascent Vehicle (MAV) sample container.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORGANICS & BIOSIGNATURES */}
          {activeTab === 'organics' && (
            <div className="h-full overflow-y-auto p-6 space-y-4">
              <div className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
                CONFIRMED EXTRATERRESTRIAL ORGANIC MOLECULES & BIOSIGNATURE CANDIDATES
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organicsCatalog.map(item => (
                  <div key={item.id} className="p-4 bg-[#161B22] rounded border border-[#242E40] space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-purple-400 font-bold">{item.instrument}</span>
                        <h3 className="text-base font-bold text-white">{item.discovery_name}</h3>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#1F2937] text-zinc-300">
                        Sol {item.sol_detected}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-400 flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-[#E25B38]" />
                      <span>{item.location} ({item.coordinates.lat}°N, {item.coordinates.lon}°E)</span>
                    </div>

                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase">MOLECULES IDENTIFIED:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.molecules_detected.map((m, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/40">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-zinc-300 leading-relaxed pt-2 border-t border-[#242E40]">
                      <span className="text-zinc-500 font-bold">Context: </span>
                      {item.geological_context}
                    </div>

                    <div className="p-2.5 rounded bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-200">
                      <span className="font-bold">Biosignature Implication: </span>
                      {item.biosignature_significance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WATER ICE DEPOSITS */}
          {activeTab === 'water_ice' && (
            <div className="h-full overflow-y-auto p-6 space-y-4">
              <div className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
                SUB-SURFACE WATER ICE & GLACIAL MANTLES FOR IN-SITU RESOURCE UTILIZATION (ISRU)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {waterIceCatalog.map(item => (
                  <div key={item.id} className="p-4 bg-[#161B22] rounded border border-[#242E40] space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-blue-400 font-bold">{item.mission}</span>
                        <h3 className="text-base font-bold text-white">{item.name}</h3>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/40">
                        {item.purity_pct}% Pure Ice
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

                    <div className="text-xs text-zinc-300 leading-relaxed">
                      {item.discovery_summary}
                    </div>

                    <div className="p-2.5 rounded bg-blue-950/30 border border-blue-500/30 text-[11px] text-blue-200">
                      <span className="font-bold">Human ISRU Value: </span>
                      {item.astronaut_in_situ_resource_utilization}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HYDROTHERMAL MINERALS */}
          {activeTab === 'minerals' && (
            <div className="h-full overflow-y-auto p-6 space-y-4">
              <div className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
                HYDROTHERMAL SILICA, COMBO CARBONATES & PREBIOTIC BORON SALTS
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hydrothermalCatalog.map(item => (
                  <div key={item.id} className="p-4 bg-[#161B22] rounded border border-[#242E40] space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold">{item.mission}</span>
                        <h3 className="text-base font-bold text-white">{item.mineral_system}</h3>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{item.site}</span>
                    </div>

                    <div className="text-xs text-zinc-300 leading-relaxed">
                      <span className="text-zinc-500 font-bold">Discovery History: </span>
                      {item.discovery_story}
                    </div>

                    <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-200">
                      <span className="font-bold">Planetary Evolution: </span>
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
  );
};
