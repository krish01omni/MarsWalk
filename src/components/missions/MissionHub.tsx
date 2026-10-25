import React, { useState } from 'react';
import { 
  allRoverTraverses, 
  allLanders, 
  allSatelliteMissions,
  threeForksDepot
} from '../../services/dataService';
import type { 
  RoverTraverseData, 
  LanderSiteData, 
  OrbiterMissionData,
  RoverWaypoint 
} from '../../types/mission';
import { MissionSatelliteMap } from './MissionSatelliteMap';
import { 
  Compass, 
  Sparkles, 
  ShieldAlert, 
  Radio, 
  ArrowRight, 
  ChevronLeft, 
  Orbit, 
  CheckCircle2,
  Crosshair,
  ExternalLink,
  FolderDown,
  Layers,
  Activity,
  Cpu,
  Database,
  BookOpen
} from 'lucide-react';

interface MissionHubProps {
  onSelectMissionOnMap: (missionId: string, viewMode?: '3d' | '2d') => void;
  initialMissionId?: string;
  onOpenOfflineSetup?: () => void;
}

type MissionCategory = 'rovers' | 'satellites' | 'landers';
type RoverSubTab = 'map' | 'discoveries' | 'waypoints' | 'samples';
type SatelliteSubTab = 'instruments' | 'discoveries';
type LanderSubTab = 'map' | 'discoveries' | 'instruments';

export const MissionHub: React.FC<MissionHubProps> = ({
  onSelectMissionOnMap,
  initialMissionId,
  onOpenOfflineSetup
}) => {
  const [activeCategory, setActiveCategory] = useState<MissionCategory>('rovers');
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(initialMissionId || null);
  const [roverSubTab, setRoverSubTab] = useState<RoverSubTab>('map');
  const [satelliteSubTab, setSatelliteSubTab] = useState<SatelliteSubTab>('instruments');
  const [landerSubTab, setLanderSubTab] = useState<LanderSubTab>('map');
  const [selectedWaypoint, setSelectedWaypoint] = useState<RoverWaypoint | null>(null);

  // Selected mission objects
  const selectedRover: RoverTraverseData | undefined = selectedMissionId ? allRoverTraverses[selectedMissionId] : undefined;
  const selectedLander: LanderSiteData | undefined = selectedMissionId ? allLanders[selectedMissionId] : undefined;
  const selectedSatellite: OrbiterMissionData | undefined = selectedMissionId ? allSatelliteMissions[selectedMissionId] : undefined;

  // External Research Links mapping for ground-truth science
  const getResearchLinksForMission = (missionId: string) => {
    switch (missionId) {
      case 'perseverance':
        return [
          { title: 'NASA Mars 2020 Mission Science Portal', url: 'https://mars.nasa.gov/mars2020/mission/science/' },
          { title: 'Nature: Diverse organic molecules detected in Jezero (Farley et al.)', url: 'https://www.nature.com/articles/s41586-022-04984-7' },
          { title: 'NASA PDS Geosciences Archive for Perseverance', url: 'https://pds-geosciences.wustl.edu/missions/mars2020/' },
          { title: 'Three Forks 10-Tube Sample Depot Registry', url: 'https://mars.nasa.gov/mars2020/multimedia/images/?search=three+forks' }
        ];
      case 'curiosity':
        return [
          { title: 'NASA Mars Science Laboratory Primary Science', url: 'https://mars.nasa.gov/msl/mission/science/' },
          { title: 'Science: Ancient lacustrine strata in Gale Crater (Grotzinger et al.)', url: 'https://www.science.org/doi/10.1126/science.aac7575' },
          { title: 'NASA PDS MSL Node: ChemCam & CheMin Datasets', url: 'https://pds-geosciences.wustl.edu/missions/msl/' }
        ];
      case 'opportunity':
        return [
          { title: 'Science: Sedimentary rocks and ancient acidic waters at Meridiani (Squyres et al.)', url: 'https://www.science.org/doi/10.1126/science.1109034' },
          { title: 'NASA PDS Geosciences MER Archive', url: 'https://pds-geosciences.wustl.edu/missions/mer/' }
        ];
      case 'spirit':
        return [
          { title: 'Nature Geoscience: Silica sinter deposits in Columbia Hills (Ruff et al.)', url: 'https://www.nature.com/articles/ngeo370' },
          { title: 'NASA PDS Mars Exploration Rover Spirit Archive', url: 'https://pds-geosciences.wustl.edu/missions/mer/' }
        ];
      case 'sojourner':
        return [
          { title: 'Science: Mars Pathfinder Mission Evaluation (Golombek et al.)', url: 'https://www.science.org/doi/10.1126/science.278.5344.1743' },
          { title: 'NASA PDS Pathfinder Imaging & Alpha Proton X-Ray Archive', url: 'https://pds-geosciences.wustl.edu/missions/pathfinder/' }
        ];
      case 'insight':
        return [
          { title: 'Science: Seismic detection of the Martian core and crust (Khan et al.)', url: 'https://www.science.org/doi/10.1126/science.abf8966' },
          { title: 'NASA InSight PDS Geosciences SEIS Archive', url: 'https://pds-geosciences.wustl.edu/missions/insight/' }
        ];
      case 'phoenix':
        return [
          { title: 'Science: Perchlorate and Water Ice at the Phoenix Landing Site (Hecht et al.)', url: 'https://www.science.org/doi/10.1126/science.1172466' },
          { title: 'NASA Phoenix Mars Lander PDS Archive', url: 'https://pds-geosciences.wustl.edu/missions/phoenix/' }
        ];
      case 'viking1':
      case 'viking2':
        return [
          { title: 'Science: Biology and Soil Chemistry of Viking Landers (Klein et al.)', url: 'https://www.science.org/doi/10.1126/science.194.4260.99' },
          { title: 'NASA NSSDC Viking Lander 1 & 2 Complete Archives', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C' }
        ];
      default:
        return [
          { title: 'NASA Planetary Data System (PDS) Central Portal', url: 'https://pds.nasa.gov/' }
        ];
    }
  };

  // =========================================================================
  // VIEW A: INDIVIDUAL MISSION DOSSIER (Non-Crowded, Clean, Multi-Tab)
  // =========================================================================
  if (selectedMissionId && (selectedRover || selectedLander || selectedSatellite)) {
    return (
      <div className="w-full h-full overflow-y-auto bg-[#000000] text-zinc-200 p-4 md:p-8 font-sans selection:bg-white selection:text-black">
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
          
          {/* Top Bar with Back Navigation & Fullscreen Map Action */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => {
                setSelectedMissionId(null);
                setSelectedWaypoint(null);
              }}
              className="group flex items-center space-x-3 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <ChevronLeft className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">DIRECTORY</span>
                <span className="font-semibold text-zinc-300 group-hover:text-white tracking-wide">
                  RETURN TO MISSIONS
                </span>
              </div>
            </button>

            <button
              onClick={() => onSelectMissionOnMap(selectedMissionId, '2d')}
              className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold font-mono flex items-center space-x-2 transition-all shadow-md active:scale-95"
            >
              <span>FULL 2D TACTICAL GIS</span>
              <Crosshair className="w-3.5 h-3.5 text-black" />
            </button>
          </div>

          {/* ===================== ROVER DOSSIER VIEW ===================== */}
          {selectedRover && (
            <div className="space-y-6">
              {/* Mission Hero Banner */}
              <div className="p-6 md:p-8 rounded-2xl bg-[#080B10] border border-white/[0.08] shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="px-2.5 py-0.5 rounded text-[10px] tracking-widest font-semibold uppercase bg-white/[0.06] text-white border border-white/10">
                        NASA SURFACE ROVER
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded bg-white/[0.03] text-zinc-300 border border-white/10">
                        {selectedRover.current_status.active ? 'STATUS: OPERATIONAL' : 'STATUS: MISSION ARCHIVE'}
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
                      {selectedRover.rover}
                    </h1>
                    <p className="text-sm text-zinc-400 font-normal">
                      Landing Site: <span className="text-white font-medium">{selectedRover.landing_site.name}</span> ({selectedRover.landing_site.crater || selectedRover.landing_site.region}) • {selectedRover.landing_site.latitude}°N, {selectedRover.landing_site.longitude}°E
                    </p>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-right">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">ODOMETER</div>
                      <div className="text-xl md:text-2xl font-bold text-white">
                        {selectedRover.current_status.total_odometer_km} <span className="text-xs font-normal text-zinc-400">km</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-right">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">SURFACE SOLS</div>
                      <div className="text-xl md:text-2xl font-bold text-white">
                        Sol {selectedRover.current_status.sol}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Summary */}
                <p className="text-xs md:text-sm text-zinc-300 leading-relaxed pt-2 border-t border-white/[0.06]">
                  {selectedRover.traverse_summary.target_destination}
                </p>
              </div>

              {/* Sub-Navigation Tabs: Keeps page clean & separated */}
              <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-3 text-xs font-mono overflow-x-auto">
                <button
                  onClick={() => setRoverSubTab('map')}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                    roverSubTab === 'map'
                      ? 'bg-white text-black font-bold shadow-lg'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>SATELLITE TRAVERSE MAP</span>
                </button>

                <button
                  onClick={() => setRoverSubTab('discoveries')}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                    roverSubTab === 'discoveries'
                      ? 'bg-white text-black font-bold shadow-lg'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>RESEARCH & DISCOVERIES</span>
                </button>

                <button
                  onClick={() => setRoverSubTab('waypoints')}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                    roverSubTab === 'waypoints'
                      ? 'bg-white text-black font-bold shadow-lg'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>WAYPOINT LOGS ({selectedRover.waypoints.length})</span>
                </button>

                {selectedMissionId === 'perseverance' && (
                  <button
                    onClick={() => setRoverSubTab('samples')}
                    className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                      roverSubTab === 'samples'
                        ? 'bg-white text-black font-bold shadow-lg'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>THREE FORKS CACHE (10 TUBES)</span>
                  </button>
                )}
              </div>

              {/* TAB 1: SATELLITE MAP WITH GOOGLE MAPS LAYER SWITCHER */}
              {roverSubTab === 'map' && (
                <div className="space-y-4">
                  <MissionSatelliteMap
                    missionType="rover"
                    missionId={selectedMissionId}
                    missionName={selectedRover.rover}
                    center={[selectedRover.landing_site.latitude, selectedRover.landing_site.longitude]}
                    waypoints={selectedRover.waypoints}
                    activeWaypoint={selectedWaypoint}
                    onSelectWaypoint={wp => setSelectedWaypoint(wp)}
                    landingSiteName={selectedRover.landing_site.name}
                    onExpandToTactical={() => onSelectMissionOnMap(selectedMissionId, '2d')}
                  />
                </div>
              )}

              {/* TAB 2: RESEARCH DISCOVERIES & EXTERNAL SCIENTIFIC PAPERS */}
              {roverSubTab === 'discoveries' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-[#080B10] border border-white/[0.08] space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight">
                          Key Scientific Milestones & Geological Discoveries
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Empirical research findings confirmed by {selectedRover.rover} instrument telemetry.
                        </p>
                      </div>
                      <span className="text-xs font-mono text-zinc-500">
                        {selectedRover.traverse_summary.key_milestones.length} Findings
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRover.traverse_summary.key_milestones.map((m, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-black/60 border border-white/[0.06] text-xs text-zinc-300 space-y-2">
                          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-[10px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>INVESTIGATION #{idx + 1}</span>
                          </div>
                          <p className="leading-relaxed">{m}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Direct Verified Research Papers Card */}
                  <div className="p-6 rounded-2xl bg-[#080B10] border border-white/[0.08] space-y-4">
                    <div className="flex items-center space-x-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span>Published Scientific Papers & Primary PDS Datasets</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getResearchLinksForMission(selectedMissionId).map((paper, idx) => (
                        <a
                          key={idx}
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group"
                        >
                          <span className="text-xs text-zinc-300 group-hover:text-white font-medium pr-3">
                            {paper.title}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: WAYPOINTS & OBSERVATION LOGS */}
              {roverSubTab === 'waypoints' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2">
                    <span>CHRONOLOGICAL TRAVERSAL STOPS</span>
                    <span>{selectedRover.waypoints.length} Recorded Waypoints</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRover.waypoints.map((wp, idx) => {
                      const isSelected = selectedWaypoint?.sol === wp.sol;
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedWaypoint(wp)}
                          className={`p-4 rounded-xl bg-[#080B10] border transition-all space-y-2.5 cursor-pointer ${
                            isSelected 
                              ? 'border-cyan-400 bg-white/[0.06] shadow-lg' 
                              : 'border-white/[0.06] hover:border-white/15'
                          }`}
                        >
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-white/10 text-white">
                              SOL {wp.sol}
                            </span>
                            <span className="text-xs text-zinc-400">
                              {wp.lat.toFixed(4)}°N, {wp.lon.toFixed(4)}°E
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {wp.target_name}
                            </h4>
                            <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                              {wp.activity}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                            <span>Elevation: {wp.elev_m}m</span>
                            <span>Odometer: {(wp.dist_m / 1000).toFixed(2)} km</span>
                          </div>

                          {wp.hazard_warning && (
                            <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2 font-mono">
                              <ShieldAlert className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                              <span className="text-[11px] leading-tight">{wp.hazard_warning}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: THREE FORKS 10-TUBE SAMPLE CACHE */}
              {roverSubTab === 'samples' && (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-[#080B10] border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight">
                          Three Forks Sample Depot Registry
                        </h3>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">
                          10 hermetically sealed titanium core tubes cached between Sol 653 and Sol 710 in Jezero Crater.
                        </p>
                      </div>
                      <a
                        href="https://mars.nasa.gov/mars2020/multimedia/images/?search=three+forks"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-cyan-400 hover:underline flex items-center space-x-1"
                      >
                        <span>NASA Depot Ledger</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {threeForksDepot.tubes.map((tube, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#080B10] border border-white/[0.08] space-y-2">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-white/10">
                            TUBE #{tube.tube_index}: {tube.tube_serial}
                          </span>
                          <span className="text-[10px] text-cyan-400 font-semibold uppercase">
                            Sol {tube.sol_dropped}
                          </span>
                        </div>

                        <div className="text-sm font-semibold text-zinc-200">
                          {tube.sample_name} ({tube.rock_type})
                        </div>

                        <div className="text-xs text-zinc-400 font-mono">
                          Formation: <span className="text-zinc-200">{tube.formation}</span> • Length: {tube.core_length_mm} mm
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed pt-1.5 border-t border-white/[0.06]">
                          {tube.scientific_value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== ORBITER / SATELLITE DOSSIER VIEW ===================== */}
          {selectedSatellite && (
            <div className="space-y-6">
              <div className="p-6 md:p-8 rounded-2xl bg-[#080B10] border border-white/[0.08] shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="px-2.5 py-0.5 rounded text-[10px] tracking-widest font-semibold uppercase bg-purple-950/60 text-purple-300 border border-purple-500/30">
                        ORBITAL SATELLITE
                      </span>
                      <span className="text-xs font-mono text-cyan-400">
                        {selectedSatellite.status}
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
                      {selectedSatellite.name}
                    </h1>
                    <p className="text-sm text-zinc-400">
                      Operating Agency: <span className="text-white font-medium">{selectedSatellite.agency}</span> • Orbit: <span className="text-zinc-300 font-mono text-xs">{selectedSatellite.orbital_altitude_km}</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-right font-mono">
                    <div className="text-[10px] text-zinc-500 uppercase">LAUNCH / TIMELINE</div>
                    <div className="text-sm font-bold text-white">
                      {selectedSatellite.launch_date.split(',')[1] || selectedSatellite.launch_date} → Operational
                    </div>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-zinc-300 leading-relaxed pt-2 border-t border-white/[0.06]">
                  {selectedSatellite.purpose_and_objectives}
                </p>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-3 text-xs font-mono">
                <button
                  onClick={() => setSatelliteSubTab('instruments')}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                    satelliteSubTab === 'instruments'
                      ? 'bg-white text-black font-bold shadow-lg'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>PAYLOAD SENSORS & INSTRUMENTS</span>
                </button>

                <button
                  onClick={() => setSatelliteSubTab('discoveries')}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                    satelliteSubTab === 'discoveries'
                      ? 'bg-white text-black font-bold shadow-lg'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ORBITAL DISCOVERIES & PAPERS</span>
                </button>
              </div>

              {satelliteSubTab === 'instruments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSatellite.key_instruments.map((inst, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-[#080B10] border border-white/[0.08] space-y-2">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-xs font-bold text-cyan-300 px-2 py-0.5 rounded bg-white/10">
                          {inst.acronym}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase">SCIENCE PAYLOAD</span>
                      </div>
                      <div className="text-sm font-semibold text-white">{inst.name}</div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{inst.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {satelliteSubTab === 'discoveries' && (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-[#080B10] border border-white/[0.08] space-y-3">
                    <div className="text-xs font-mono text-white font-bold tracking-wider uppercase flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Major Orbital Discoveries</span>
                    </div>
                    <ul className="space-y-2 text-xs text-zinc-300 leading-relaxed">
                      {selectedSatellite.major_discoveries.map((disc, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{disc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#080B10] border border-white/[0.08] space-y-3">
                    <div className="text-xs font-mono text-zinc-300 font-bold tracking-wider uppercase flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span>Primary PDS Remote Sensing Archives</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <a
                        href="https://hirise.lpl.arizona.edu/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-xs text-zinc-300 hover:text-white flex items-center justify-between"
                      >
                        <span>University of Arizona HiRISE High-Res Archive</span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                      </a>
                      <a
                        href="https://themis.asu.edu/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-xs text-zinc-300 hover:text-white flex items-center justify-between"
                      >
                        <span>Arizona State University THEMIS Infrared Archive</span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== LANDER DOSSIER VIEW ===================== */}
          {selectedLander && (
            <div className="space-y-6">
              <div className="p-6 md:p-8 rounded-2xl bg-[#080B10] border border-white/[0.08] shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="px-2.5 py-0.5 rounded text-[10px] tracking-widest font-semibold uppercase bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                        STATIONARY SCIENCE STATION
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        HISTORIC TOUCHDOWN
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
                      {selectedLander.mission}
                    </h1>
                    <p className="text-sm text-zinc-400">
                      Landing Location: <span className="text-white font-medium">{selectedLander.landing_site.name}</span> ({selectedLander.landing_site.region}) • {selectedLander.landing_site.latitude}°N, {selectedLander.landing_site.longitude}°E
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-right font-mono">
                    <div className="text-[10px] text-zinc-500 uppercase">SURFACE DURATION</div>
                    <div className="text-xl md:text-2xl font-bold text-white">
                      {selectedLander.operational_record.duration_sols} <span className="text-xs font-normal text-zinc-400">Sols</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-zinc-300 leading-relaxed pt-2 border-t border-white/[0.06]">
                  {selectedLander.operational_record.historic_feat}
                </p>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-3 text-xs font-mono">
                <button
                  onClick={() => setLanderSubTab('map')}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                    landerSubTab === 'map'
                      ? 'bg-white text-black font-bold shadow-lg'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>TOUCHDOWN SATELLITE MAP</span>
                </button>

                <button
                  onClick={() => setLanderSubTab('discoveries')}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                    landerSubTab === 'discoveries'
                      ? 'bg-white text-black font-bold shadow-lg'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>DISCOVERIES & RESEARCH PAPERS</span>
                </button>

                <button
                  onClick={() => setLanderSubTab('instruments')}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                    landerSubTab === 'instruments'
                      ? 'bg-white text-black font-bold shadow-lg'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>SCIENCE INSTRUMENTS & ADVISORY</span>
                </button>
              </div>

              {landerSubTab === 'map' && (
                <MissionSatelliteMap
                  missionType="lander"
                  missionId={selectedMissionId}
                  missionName={selectedLander.mission}
                  center={[selectedLander.landing_site.latitude, selectedLander.landing_site.longitude]}
                  landingSiteName={selectedLander.landing_site.name}
                  onExpandToTactical={() => onSelectMissionOnMap(selectedMissionId, '2d')}
                />
              )}

              {landerSubTab === 'discoveries' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLander.historic_discoveries.map((disc, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#080B10] border border-white/[0.08] space-y-2">
                        <div className="text-xs font-mono font-bold text-cyan-400 uppercase">
                          {disc.experiment || disc.discovery || disc.phenomenon || `Discovery #${idx + 1}`}
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                          {disc.finding || disc.details || disc.significance}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 rounded-xl bg-[#080B10] border border-white/[0.08] space-y-3">
                    <div className="text-xs font-mono text-white font-bold uppercase tracking-wider flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span>Published Scientific Research</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getResearchLinksForMission(selectedMissionId).map((paper, idx) => (
                        <a
                          key={idx}
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-xs text-zinc-300 hover:text-white flex items-center justify-between"
                        >
                          <span>{paper.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {landerSubTab === 'instruments' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLander.science_instruments.map((inst, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#080B10] border border-white/[0.08] space-y-1.5">
                        <div className="text-xs font-mono font-bold text-white">
                          {inst}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                          Active payload sensor deployed on Martian substrate for meteorological, seismic, and chemical sampling.
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="text-xs font-mono text-cyan-400 font-bold tracking-wider uppercase flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 text-cyan-400" />
                      <span>Astronaut Tactical Advisory</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      {selectedLander.astronaut_tactical_note}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: MISSION DIRECTORY HUB (Categorized, Clean, Zero Slop)
  // =========================================================================
  return (
    <div className="w-full h-full overflow-y-auto bg-[#000000] text-zinc-200 p-6 md:p-10 font-sans selection:bg-white selection:text-black">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* Hub Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono tracking-[0.25em] text-zinc-300 uppercase font-bold">
            <span>NASA & ESA MARS EXPLORATION ATLAS</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            Planetary Mission Directory
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-2xl font-normal leading-relaxed">
            Select an active rover traverse, orbital remote sensing satellite, or stationary surface laboratory to analyze routes, multispectral layers, and published scientific discoveries.
          </p>
        </div>

        {/* Category Tabs: Rovers / Satellites / Landers */}
        <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-4 text-xs font-mono">
          <button
            onClick={() => setActiveCategory('rovers')}
            className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
              activeCategory === 'rovers'
                ? 'bg-white text-black font-bold shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>ROVER EXPEDITIONS (5)</span>
          </button>

          <button
            onClick={() => setActiveCategory('satellites')}
            className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
              activeCategory === 'satellites'
                ? 'bg-white text-black font-bold shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Orbit className="w-4 h-4" />
            <span>ORBITER SATELLITES (5)</span>
          </button>

          <button
            onClick={() => setActiveCategory('landers')}
            className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
              activeCategory === 'landers'
                ? 'bg-white text-black font-bold shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>LANDER STATIONS (4)</span>
          </button>
        </div>

        {/* ==================== CATEGORY 1: ROVERS ==================== */}
        {activeCategory === 'rovers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(allRoverTraverses).map(([id, rover]) => (
              <div
                key={id}
                onClick={() => setSelectedMissionId(id)}
                className="group p-6 rounded-2xl bg-[#080B10] border border-white/[0.08] hover:border-white/25 transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-2xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/10 uppercase">
                      {rover.current_status.active ? 'STATUS: OPERATIONAL' : 'STATUS: MISSION ARCHIVE'}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {rover.current_status.total_odometer_km} km
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tight uppercase">
                    {rover.rover}
                  </h3>

                  <div className="text-xs text-zinc-400 font-medium">
                    Landing Site: <span className="text-zinc-200">{rover.landing_site.name}</span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {rover.traverse_summary.target_destination}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
                  <span>Inspect Route & Discoveries</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-white" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== CATEGORY 2: SATELLITES ==================== */}
        {activeCategory === 'satellites' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(allSatelliteMissions).map(([id, sat]) => (
              <div
                key={id}
                onClick={() => setSelectedMissionId(id)}
                className="group p-6 rounded-2xl bg-[#080B10] border border-white/[0.08] hover:border-white/25 transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-2xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/10 uppercase">
                      {sat.agency}
                    </span>
                    <span className="text-xs text-cyan-400 font-bold">
                      {sat.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-purple-400 transition-colors tracking-tight uppercase">
                    {sat.name}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {sat.purpose_and_objectives}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sat.key_instruments.map((inst, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/5">
                        {inst.acronym}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
                  <span>Inspect Orbital Sensors & Papers</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-white" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== CATEGORY 3: LANDERS ==================== */}
        {activeCategory === 'landers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(allLanders).map(([id, lander]) => (
              <div
                key={id}
                onClick={() => setSelectedMissionId(id)}
                className="group p-6 rounded-2xl bg-[#080B10] border border-white/[0.08] hover:border-white/25 transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-2xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/10 uppercase">
                      STATIONARY STATION
                    </span>
                    <span className="text-xs text-white font-bold">
                      {lander.operational_record.duration_sols} Sols
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tight uppercase">
                    {lander.mission}
                  </h3>

                  <div className="text-xs text-zinc-400 font-medium">
                    Site: <span className="text-zinc-200">{lander.landing_site.name}</span> ({lander.landing_site.region})
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {lander.astronaut_tactical_note}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
                  <span>Inspect Touchdown Site & Discoveries</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
