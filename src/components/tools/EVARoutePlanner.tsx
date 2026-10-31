import React, { useState } from 'react';
import { 
  X, 
  Crosshair,
  Trash2
} from 'lucide-react';
import { evaluateEVARoute } from '../../services/dataService';
import type { EVAPlannedWaypoint, EVARouteAnalysis } from '../../types/mission';

interface EVARoutePlannerProps {
  isOpen: boolean;
  onClose: () => void;
  waypoints: EVAPlannedWaypoint[];
  onAddWaypoint: (wp: EVAPlannedWaypoint) => void;
  onRemoveWaypoint: (id: string) => void;
  onClearRoute: () => void;
  onStartMapPlacement: () => void;
  isMapPlacementActive: boolean;
  onFlyToRoute?: () => void;
}

export const EVARoutePlanner: React.FC<EVARoutePlannerProps> = ({
  isOpen,
  onClose,
  waypoints,
  onAddWaypoint,
  onRemoveWaypoint,
  onClearRoute,
  onStartMapPlacement,
  isMapPlacementActive
}) => {
  const [manualName, setManualName] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');

  if (!isOpen) return null;

  const analysis: EVARouteAnalysis = evaluateEVARoute(waypoints);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (!isNaN(lat) && !isNaN(lon) && manualName.trim()) {
      onAddWaypoint({
        id: `custom_${Date.now()}`,
        name: manualName.trim(),
        lat,
        lon
      });
      setManualName('');
      setManualLat('');
      setManualLon('');
    }
  };

  const loadPresetRoute = (presetName: string) => {
    onClearRoute();
    if (presetName === 'THREE_FORKS') {
      onAddWaypoint({ id: 'wp_tf_1', name: 'Delta Base Camp', lat: 18.4520, lon: 77.4095 });
      onAddWaypoint({ id: 'wp_tf_2', name: 'Sample Depot Tube Cluster #1-5', lat: 18.4545, lon: 77.4077 });
      onAddWaypoint({ id: 'wp_tf_3', name: 'Sample Depot Tube Cluster #6-10', lat: 18.4552, lon: 77.4070 });
      onAddWaypoint({ id: 'wp_tf_4', name: 'Neretva Breach Overlook', lat: 18.4580, lon: 77.4045 });
    } else if (presetName === 'HUSBAND_HILL') {
      onAddWaypoint({ id: 'wp_hh_1', name: 'West Valley Landing Base', lat: -14.5680, lon: 175.4720 });
      onAddWaypoint({ id: 'wp_hh_2', name: 'Cumberland Ridge Ascent', lat: -14.5950, lon: 175.5120 });
      onAddWaypoint({ id: 'wp_hh_3', name: 'Husband Hill Summit Peak', lat: -14.6042, lon: 175.5310 });
      onAddWaypoint({ id: 'wp_hh_4', name: 'Home Plate Silica Apron', lat: -14.6075, lon: 175.5280 });
    } else if (presetName === 'GALE_SHARP') {
      onAddWaypoint({ id: 'wp_msl_1', name: 'Bradbury Base Station', lat: -4.5895, lon: 137.4417 });
      onAddWaypoint({ id: 'wp_msl_2', name: 'Dingo Gap Sand Ridge', lat: -4.6220, lon: 137.4330 });
      onAddWaypoint({ id: 'wp_msl_3', name: 'Vera Rubin Ridge Crest', lat: -4.7120, lon: 137.3820 });
      onAddWaypoint({ id: 'wp_msl_4', name: 'Gediz Vallis Debris Flow', lat: -4.7450, lon: 137.3650 });
    }
  };

  const exportRouteJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `marswalk_eva_corridor_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bezel-shell w-full max-w-4xl h-[88vh] flex flex-col">
        <div className="bezel-core w-full h-full flex flex-col overflow-hidden text-zinc-300">
          
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-white/[0.08] bg-[#07090E] flex items-center justify-between font-mono">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-white/[0.04] border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                EVA
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                  TACTICAL TRAVERSAL ENGINE
                </div>
                <h2 className="text-xs md:text-sm font-bold text-white flex items-center space-x-2 tracking-wide uppercase">
                  <span>ASTRONAUT EVA ROUTE PLANNER</span>
                  <span className="text-[9px] px-2 py-0.2 rounded bg-white/[0.03] text-zinc-400 border border-white/10">
                    GEODESIC R = 3389.5 KM
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

          {/* Main Content: Split Master-Detail */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left: Corridor Setup & Waypoint List */}
            <div className="w-full md:w-1/2 p-4 border-b md:border-b-0 md:border-r border-white/[0.08] overflow-y-auto space-y-4 bg-[#050608] font-mono">
              
              {/* Presets Strip */}
              <div className="space-y-1.5">
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">
                  EXPEDITION PRESET CORRIDORS:
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => loadPresetRoute('THREE_FORKS')}
                    className="p-2 rounded bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-left transition-all active:scale-95"
                  >
                    <div className="text-[10px] font-bold text-white">THREE FORKS</div>
                    <div className="text-[9px] text-zinc-500">Sample Depot</div>
                  </button>
                  <button
                    onClick={() => loadPresetRoute('HUSBAND_HILL')}
                    className="p-2 rounded bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-left transition-all active:scale-95"
                  >
                    <div className="text-[10px] font-bold text-white">HUSBAND HILL</div>
                    <div className="text-[9px] text-zinc-500">Summit Peak</div>
                  </button>
                  <button
                    onClick={() => loadPresetRoute('GALE_SHARP')}
                    className="p-2 rounded bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-left transition-all active:scale-95"
                  >
                    <div className="text-[10px] font-bold text-white">GEDIZ VALLIS</div>
                    <div className="text-[9px] text-zinc-500">Debris Ridge</div>
                  </button>
                </div>
              </div>

              {/* Map Placement Trigger */}
              <div className="p-3 rounded bg-[#0A0D14] border border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">INTERACTIVE PLACEMENT</div>
                  <div className="text-[10px] text-zinc-400">Click coordinates on 2D tactical map</div>
                </div>
                <button
                  onClick={onStartMapPlacement}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    isMapPlacementActive
                      ? 'bg-red-500 text-white'
                      : 'bg-white hover:bg-zinc-200 text-black shadow-sm'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>{isMapPlacementActive ? 'CANCEL' : 'ACTIVATE'}</span>
                </button>
              </div>

              {/* Manual Input Form */}
              <form onSubmit={handleManualAdd} className="space-y-2 p-3 rounded bg-[#0A0D14] border border-white/[0.08]">
                <div className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">
                  MANUAL WAYPOINT ENTRY
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Label"
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    className="px-2.5 py-1.5 bg-[#050608] border border-white/10 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Lat (°N)"
                    value={manualLat}
                    onChange={e => setManualLat(e.target.value)}
                    className="px-2.5 py-1.5 bg-[#050608] border border-white/10 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Lon (°E)"
                    value={manualLon}
                    onChange={e => setManualLon(e.target.value)}
                    className="px-2.5 py-1.5 bg-[#050608] border border-white/10 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-bold rounded transition-all tracking-wider"
                >
                  <span>+ INSERT WAYPOINT</span>
                </button>
              </form>

              {/* Waypoint List */}
              <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase font-bold">
                  <span>PLANNED SEQUENCE ({waypoints.length} POINTS)</span>
                  {waypoints.length > 0 && (
                    <button
                      onClick={onClearRoute}
                      className="text-red-400 hover:underline tracking-wider"
                    >
                      <span>CLEAR ALL</span>
                    </button>
                  )}
                </div>

                {waypoints.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-xs font-sans">
                    No waypoints in corridor. Click on map or choose a preset above.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {waypoints.map((wp, idx) => (
                      <div
                        key={wp.id}
                        className="p-2.5 rounded bg-[#0A0D14] border border-white/[0.06] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded bg-white/10 text-white border border-white/15 flex items-center justify-center text-[9px] font-bold">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white uppercase">{wp.name}</div>
                            <div className="text-[10px] text-zinc-500">
                              {wp.lat.toFixed(4)}°N, {wp.lon.toFixed(4)}°E
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveWaypoint(wp.id)}
                          className="text-zinc-500 hover:text-red-400 p-1"
                          title="Remove point"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Route Telemetry & Hazard Proximity Safety Score */}
            <div className="w-full md:w-1/2 p-5 bg-[#07090E] flex flex-col justify-between overflow-y-auto space-y-4 font-mono">
              <div className="space-y-4">
                {/* Distance & Time Metrics Cards */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#0A0D14] p-3 rounded border border-white/[0.08]">
                    <div className="text-[9px] text-zinc-500 uppercase">MARS DISTANCE</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {analysis.totalDistanceKm} km
                    </div>
                    <div className="text-[8px] text-zinc-600">Haversine (R=3389.5km)</div>
                  </div>

                  <div className="bg-[#0A0D14] p-3 rounded border border-white/[0.08]">
                    <div className="text-[9px] text-zinc-500 uppercase">SUIT WALK TIME</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {analysis.estimatedWalkingHours} hrs
                    </div>
                    <div className="text-[8px] text-zinc-600">@ 1.2 km/h in suit</div>
                  </div>

                  <div className="bg-[#0A0D14] p-3 rounded border border-white/[0.08]">
                    <div className="text-[9px] text-zinc-500 uppercase">ROVER DRIVE</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {analysis.estimatedRoverHours} hrs
                    </div>
                    <div className="text-[8px] text-zinc-600">@ 6.0 km/h in rover</div>
                  </div>
                </div>

                {/* Safety Score Indicator */}
                <div className="bg-[#0A0D14] p-4 rounded border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      TERRAIN SAFETY RATING
                    </div>
                    <div
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        analysis.safetyScore >= 80
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                          : analysis.safetyScore >= 50
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-500/40'
                          : 'bg-red-950/60 text-red-400 border border-red-500/40'
                      }`}
                    >
                      {analysis.safetyScore} / 100
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#1F2430] rounded overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        analysis.safetyScore >= 80
                          ? 'bg-emerald-400'
                          : analysis.safetyScore >= 50
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                      style={{ width: `${analysis.safetyScore}%` }}
                    />
                  </div>

                  <div className="text-xs text-zinc-300 font-sans mt-2">
                    {analysis.riskSummary}
                  </div>
                </div>

                {/* Hazards Near Route */}
                <div className="space-y-2">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    EXCLUSION BUFFER WARNINGS ({analysis.hazardsEncountered.length})
                  </div>

                  {analysis.hazardsEncountered.length === 0 ? (
                    <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded text-zinc-300 text-xs font-sans">
                      <span className="text-emerald-400 font-bold font-mono mr-2">NOMINAL:</span>
                      <span>Zero classified terrain hazards or toxic perchlorates along corridor.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {analysis.hazardsEncountered.map(({ hazard, distanceKm }) => (
                        <div
                          key={hazard.id}
                          className="p-3 bg-red-950/20 border border-red-500/30 rounded text-xs space-y-1 font-sans"
                        >
                          <div className="flex justify-between items-center font-mono">
                            <span className="font-bold text-red-400">{hazard.name}</span>
                            <span className="text-zinc-400">{distanceKm} km away</span>
                          </div>
                          <div className="text-zinc-300 text-[11px] font-mono">
                            BUFFER: {hazard.caution_radius_m}m • CLASS: {hazard.threat_class}
                          </div>
                          <div className="text-zinc-300 text-[11px]">
                            Protocol: {hazard.astronaut_protocol}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Flight Readiness & Export */}
              <div className="pt-3 border-t border-white/[0.08] flex justify-between items-center">
                <button
                  onClick={exportRouteJSON}
                  disabled={waypoints.length === 0}
                  className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 border border-white/10 text-zinc-300 hover:text-white rounded text-xs transition-all tracking-wider font-mono"
                >
                  <span>EXPORT JSON</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded transition-all shadow-sm active:scale-95 tracking-wider font-mono"
                >
                  APPLY & EXIT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
