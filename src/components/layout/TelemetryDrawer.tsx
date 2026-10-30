import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ShieldAlert, 
  Sparkles, 
  Radio, 
  Compass,
  ArrowUpRight
} from 'lucide-react';
import type { RoverTraverseData, RoverWaypoint, LanderSiteData } from '../../types/mission';

interface TelemetryDrawerProps {
  activeMission: string;
  roverData?: RoverTraverseData;
  landerData?: LanderSiteData;
  selectedSol: number;
  onSelectSol: (sol: number) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onFlyToWaypoint?: (wp: RoverWaypoint) => void;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  activeMission: _activeMission,
  roverData,
  landerData,
  selectedSol,
  onSelectSol,
  isOpen,
  onToggleOpen,
  onFlyToWaypoint
}) => {
  const isLander = !!landerData;
  const currentWaypoint = roverData?.waypoints.find(w => w.sol === selectedSol) || 
    (roverData?.waypoints && roverData.waypoints[roverData.waypoints.length - 1]);

  const currentIndex = roverData?.waypoints.findIndex(w => w.sol === selectedSol) ?? -1;

  // Auto-play timeline state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying && roverData && roverData.waypoints.length > 0) {
      timer = setInterval(() => {
        const nextIdx = (currentIndex + 1) % roverData.waypoints.length;
        onSelectSol(roverData.waypoints[nextIdx].sol);
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, roverData, onSelectSol]);

  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 z-[1050] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex ${
        isOpen ? 'w-84 md:w-96' : 'w-10'
      }`}
    >
      {/* 1. Main Drawer Surface */}
      <div
        className={`h-full w-full bg-[#050608]/95 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col transition-all duration-300 overflow-hidden shadow-2xl ${
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'
        }`}
      >
        {/* ==================== LANDER VIEW ==================== */}
        {isLander && landerData ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold flex items-center space-x-1 mb-0.5">
                    <Radio className="w-3 h-3 text-zinc-400 mr-1" />
                    <span>STATIONARY SCIENCE STATION</span>
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight font-mono uppercase">
                    {landerData.mission}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-mono text-zinc-500 uppercase">SURFACE DURATION</div>
                  <div className="text-sm font-mono font-bold text-white">
                    {landerData.operational_record.duration_sols} Sols
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
              {/* Landing Site */}
              <div className="p-3.5 rounded bg-[#0A0D14] border border-white/[0.08]">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1 flex items-center">
                  <MapPin className="w-3 h-3 text-zinc-400 mr-1.5" />
                  TOUCHDOWN SITE
                </div>
                <div className="text-sm font-semibold text-white mb-0.5">
                  {landerData.landing_site.name}
                </div>
                <div className="text-xs text-zinc-400 mb-2.5 font-mono">
                  Region: <span className="text-zinc-200">{landerData.landing_site.region}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-white/[0.06] text-zinc-300">
                  <div>
                    <span className="text-zinc-500 text-[9px] block">LATITUDE</span>
                    {landerData.landing_site.latitude}°N
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[9px] block">LONGITUDE</span>
                    {landerData.landing_site.longitude}°E
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[9px] block">ELEVATION</span>
                    {landerData.landing_site.elevation_m}m
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[9px] block">TOUCHDOWN DATE</span>
                    {landerData.landing_site.earth_date}
                  </div>
                </div>
              </div>

              {/* Discoveries */}
              <div className="p-3.5 rounded bg-[#0A0D14] border border-white/[0.08] space-y-2.5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center">
                    <Sparkles className="w-3 h-3 text-zinc-400 mr-1.5" />
                    HISTORIC DISCOVERIES
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {landerData.historic_discoveries.length} Records
                  </span>
                </div>

                <div className="space-y-2">
                  {landerData.historic_discoveries.map((disc, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-black/60 border border-white/[0.06]">
                      <div className="text-xs font-mono font-semibold text-white mb-1 uppercase">
                        {disc.experiment || disc.discovery || disc.phenomenon || `Discovery #${idx + 1}`}
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                        {disc.finding || disc.details || disc.significance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Astronaut Note */}
              <div className="p-3.5 rounded bg-white/[0.02] border border-white/[0.08]">
                <div className="text-[10px] font-mono text-zinc-300 font-semibold tracking-widest uppercase mb-1">
                  ASTRONAUT TACTICAL ADVISORY
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {landerData.astronaut_tactical_note}
                </p>
              </div>
            </div>
          </>
        ) : roverData ? (
          /* ==================== ROVER VIEW ==================== */
          <>
            {/* Rover Header */}
            <div className="p-4 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-medium mb-0.5">
                    ROVER TELEMETRY
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2 font-mono uppercase">
                    <span>{roverData.rover}</span>
                    <span
                      className="text-[9px] font-mono px-2 py-0.2 rounded border uppercase bg-white/[0.05] text-zinc-300 border-white/10"
                    >
                      {roverData.current_status.active ? 'OPERATIONAL' : 'ARCHIVE'}
                    </span>
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-mono text-zinc-500 uppercase">ODOMETER</div>
                  <div className="text-base font-mono font-bold text-white">
                    {roverData.current_status.total_odometer_km} <span className="text-xs text-zinc-400 font-normal">km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
              {/* Landing Site Card */}
              <div className="p-3.5 rounded bg-[#0A0D14] border border-white/[0.08]">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1 flex items-center">
                  <MapPin className="w-3 h-3 text-zinc-400 mr-1.5" />
                  LANDING SITE
                </div>
                <div className="text-sm font-semibold text-white mb-2">
                  {roverData.landing_site.name}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-white/[0.06] text-zinc-300">
                  <div>
                    <span className="text-zinc-500 text-[9px] block">LATITUDE</span>
                    {roverData.landing_site.latitude}°N
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[9px] block">LONGITUDE</span>
                    {roverData.landing_site.longitude}°E
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[9px] block">ELEVATION</span>
                    {roverData.landing_site.elevation_m}m
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[9px] block">TOUCHDOWN</span>
                    Sol {roverData.landing_site.landing_sol}
                  </div>
                </div>
              </div>

              {/* Precision Mission Scrubber */}
              <div className="p-3.5 rounded bg-[#0A0D14] border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center">
                    <Clock className="w-3 h-3 text-zinc-400 mr-1.5" />
                    TRAVERSE SCRUBBER
                  </div>
                  <div className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">
                    Sol {currentWaypoint ? currentWaypoint.sol : selectedSol}
                  </div>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min={0}
                  max={roverData.waypoints.length - 1}
                  value={currentIndex >= 0 ? currentIndex : 0}
                  onChange={e => {
                    const idx = parseInt(e.target.value);
                    if (roverData.waypoints[idx]) {
                      onSelectSol(roverData.waypoints[idx].sol);
                    }
                  }}
                  className="w-full h-1 bg-[#1F2430] rounded appearance-none cursor-pointer accent-white"
                />

                {/* Playback Controls */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-zinc-500">
                    Sol {roverData.waypoints[0]?.sol || 0}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        if (currentIndex > 0) {
                          onSelectSol(roverData.waypoints[currentIndex - 1].sol);
                        }
                      }}
                      className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                      title="Previous Waypoint"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-2.5 py-0.8 rounded bg-white hover:bg-zinc-200 text-black text-xs font-mono flex items-center space-x-1 transition-all active:scale-95 shadow-sm"
                    >
                      {isPlaying ? <Pause className="w-3 h-3 text-black" /> : <Play className="w-3 h-3 text-black" />}
                      <span className="text-[10px] font-bold">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (currentIndex < roverData.waypoints.length - 1) {
                          onSelectSol(roverData.waypoints[currentIndex + 1].sol);
                        }
                      }}
                      className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                      title="Next Waypoint"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500">
                    Sol {roverData.waypoints[roverData.waypoints.length - 1]?.sol || 0}
                  </span>
                </div>
              </div>

              {/* Waypoint Profile */}
              {currentWaypoint && (
                <div className="p-3.5 rounded bg-[#0A0D14] border border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest font-semibold flex items-center">
                      <Compass className="w-3 h-3 text-zinc-400 mr-1.5" />
                      WAYPOINT DATA
                    </div>
                    {onFlyToWaypoint && (
                      <button
                        onClick={() => onFlyToWaypoint(currentWaypoint)}
                        className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center space-x-1 transition-colors"
                      >
                        <span>Focus</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="text-xs font-bold text-white font-mono uppercase">
                    {currentWaypoint.target_name || `Site Traverse Sol ${currentWaypoint.sol}`}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-300">
                    <div>
                      <span className="text-zinc-500 text-[9px] block">COORDINATES</span>
                      {currentWaypoint.lat.toFixed(4)}°, {currentWaypoint.lon.toFixed(4)}°
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] block">ELEVATION</span>
                      {currentWaypoint.elev_m}m
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] block">DRIVE DISTANCE</span>
                      {currentWaypoint.dist_m}m
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] block">HEADING</span>
                      {currentWaypoint.heading_deg !== undefined ? `${currentWaypoint.heading_deg}°` : 'Nominal'}
                    </div>
                  </div>

                  {currentWaypoint.activity && (
                    <div className="pt-2 border-t border-white/[0.06]">
                      <div className="text-[9px] font-mono text-zinc-500 uppercase mb-0.5">SCIENCE ACTIVITY</div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        {currentWaypoint.activity}
                      </p>
                    </div>
                  )}

                  {/* Hazard Flag */}
                  {currentWaypoint.hazard_warning && (
                    <div className="p-2.5 rounded bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-start space-x-2">
                      <ShieldAlert className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] font-mono font-bold text-red-400 uppercase">
                          TERRAIN HAZARD DETECTED
                        </div>
                        <p className="text-[11px] text-red-200/90 leading-tight">
                          {currentWaypoint.hazard_warning}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* 2. Sleek Dock Toggle Tab */}
      <button
        onClick={onToggleOpen}
        className="h-10 w-6 self-center -ml-1 rounded-r bg-[#0F131D] hover:bg-[#1A2030] border-y border-r border-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition-all shadow-xl z-30"
        title={isOpen ? 'Collapse Telemetry' : 'Expand Telemetry'}
      >
        {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
};
