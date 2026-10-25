import React, { useState } from 'react';
import { 
  Compass, 
  X, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  CheckCircle, 
  Download
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
  isMapPlacementActive,
  onFlyToRoute: _onFlyToRoute
}) => {
  const [manualName, setManualName] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');

  if (!isOpen) return null;

  const analysis: EVARouteAnalysis = evaluateEVARoute(waypoints);

  // Preset Mission Traverses
  const loadPresetRoute = (presetName: string) => {
    onClearRoute();
    if (presetName === 'THREE_FORKS') {
      const pts: EVAPlannedWaypoint[] = [
        { id: 'TF-1', name: 'Delta Base Camp', lat: 18.4520, lon: 77.4095, notes: 'Staging area' },
        { id: 'TF-2', name: 'Sample Depot Tube Cluster #1-5', lat: 18.4545, lon: 77.4077, notes: 'Retrieve tubes 1-5' },
        { id: 'TF-3', name: 'Sample Depot Tube Cluster #6-10', lat: 18.4552, lon: 77.4070, notes: 'Retrieve tubes 6-10' },
        { id: 'TF-4', name: 'Skinner Ridge Outcrop', lat: 18.4568, lon: 77.4012, notes: 'Mudstone inspection' }
      ];
      pts.forEach(p => onAddWaypoint(p));
    } else if (presetName === 'HUSBAND_HILL') {
      const pts: EVAPlannedWaypoint[] = [
        { id: 'HH-1', name: 'West Spur Base', lat: -14.5820, lon: 175.5050 },
        { id: 'HH-2', name: 'Husband Hill Summit Peak', lat: -14.5950, lon: 175.5250, notes: 'Panoramic survey' },
        { id: 'HH-3', name: 'Home Plate Silica Outcrop', lat: -14.6040, lon: 175.5280, notes: 'Fumarole sampling' }
      ];
      pts.forEach(p => onAddWaypoint(p));
    } else if (presetName === 'GALE_SHARP') {
      const pts: EVAPlannedWaypoint[] = [
        { id: 'GS-1', name: 'Glen Torridon Camp', lat: -4.7700, lon: 137.4020 },
        { id: 'GS-2', name: 'Mont Mercou Cliff Base', lat: -4.7890, lon: 137.3910 },
        { id: 'GS-3', name: 'Gediz Vallis Debris Ridge', lat: -4.8380, lon: 137.3680 }
      ];
      pts.forEach(p => onAddWaypoint(p));
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (isNaN(lat) || isNaN(lon)) return;

    onAddWaypoint({
      id: `EVA-WP-${Date.now()}`,
      name: manualName || `Waypoint #${waypoints.length + 1}`,
      lat,
      lon
    });
    setManualName('');
    setManualLat('');
    setManualLon('');
  };

  const exportRouteJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ARES_EVA_ROUTE_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-4xl h-[88vh] bg-[#080B12] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-300">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] bg-[#0C101A] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-amber-950/60 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                TACTICAL TRAVERSAL ENGINE
              </div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>ASTRONAUT EVA ROUTE WAYPOINT PLANNER</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/50">
                  GEODESIC R = 3389.5 KM
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportRouteJSON}
              disabled={waypoints.length === 0}
              className="px-2.5 py-1.5 bg-[#161B22] hover:bg-[#242E40] disabled:opacity-40 text-xs rounded border border-[#242E40] text-zinc-300 flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT FLIGHT PLAN</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#242E40] text-zinc-400 hover:text-white rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Waypoint Manager */}
          <div className="w-1/2 border-r border-[#242E40] flex flex-col p-4 space-y-4 overflow-y-auto">
            {/* Preset Traverses */}
            <div>
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                LOAD PRESET EXPEDITION CORRIDORS
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => loadPresetRoute('THREE_FORKS')}
                  className="p-2 text-[11px] rounded bg-[#161B22] hover:bg-[#1F2937] border border-[#242E40] text-left hover:border-amber-500/50"
                >
                  <div className="font-bold text-amber-400">Three Forks</div>
                  <div className="text-[9px] text-zinc-500">Sample Retrieval</div>
                </button>
                <button
                  onClick={() => loadPresetRoute('HUSBAND_HILL')}
                  className="p-2 text-[11px] rounded bg-[#161B22] hover:bg-[#1F2937] border border-[#242E40] text-left hover:border-amber-500/50"
                >
                  <div className="font-bold text-amber-400">Husband Hill</div>
                  <div className="text-[9px] text-zinc-500">Summit & Silica</div>
                </button>
                <button
                  onClick={() => loadPresetRoute('GALE_SHARP')}
                  className="p-2 text-[11px] rounded bg-[#161B22] hover:bg-[#1F2937] border border-[#242E40] text-left hover:border-amber-500/50"
                >
                  <div className="font-bold text-amber-400">Mount Sharp</div>
                  <div className="text-[9px] text-zinc-500">Gediz Vallis</div>
                </button>
              </div>
            </div>

            {/* Map Placement Trigger */}
            <div className="p-3 bg-[#161B22] rounded border border-[#242E40] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Interactive Map Drawing Mode</div>
                <div className="text-[10px] text-zinc-400">Click anywhere on the 2D Tactical GIS to plot waypoints</div>
              </div>
              <button
                onClick={onStartMapPlacement}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  isMapPlacementActive
                    ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    : 'bg-[#242E40] hover:bg-[#32405A] text-white'
                }`}
              >
                {isMapPlacementActive ? 'DRAWING ON MAP...' : 'ENABLE CLICK PLOT'}
              </button>
            </div>

            {/* Manual Coordinate Form */}
            <form onSubmit={handleManualAdd} className="space-y-2 pt-2 border-t border-[#242E40]">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                OR ENTER COORDINATES MANUALLY
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Waypoint label"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  className="bg-[#161B22] border border-[#242E40] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude (°N)"
                  value={manualLat}
                  onChange={e => setManualLat(e.target.value)}
                  className="bg-[#161B22] border border-[#242E40] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude (°E)"
                  value={manualLon}
                  onChange={e => setManualLon(e.target.value)}
                  className="bg-[#161B22] border border-[#242E40] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-[#242E40] hover:bg-amber-600 hover:text-black text-xs font-bold rounded transition-all flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD WAYPOINT</span>
              </button>
            </form>

            {/* Waypoint List */}
            <div className="flex-1 space-y-2 pt-2 border-t border-[#242E40]">
              <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase font-bold">
                <span>PLANNED SEQUENCE ({waypoints.length} POINTS)</span>
                {waypoints.length > 0 && (
                  <button
                    onClick={onClearRoute}
                    className="text-red-400 hover:underline flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {waypoints.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No waypoints added yet. Click on the 2D map or load a preset corridor.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {waypoints.map((wp, idx) => (
                    <div
                      key={wp.id}
                      className="p-2 rounded bg-[#161B22] border border-[#242E40] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-white">{wp.name}</div>
                          <div className="text-[10px] text-zinc-400">
                            {wp.lat.toFixed(4)}°N, {wp.lon.toFixed(4)}°E
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveWaypoint(wp.id)}
                        className="text-zinc-500 hover:text-red-400 p-1"
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
          <div className="w-1/2 p-4 bg-[#131720] flex flex-col justify-between overflow-y-auto space-y-4">
            <div className="space-y-4">
              {/* Distance & Time Metrics Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#161B22] p-3 rounded border border-[#242E40]">
                  <div className="text-[10px] text-zinc-500 uppercase">MARS DISTANCE</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">
                    {analysis.totalDistanceKm} km
                  </div>
                  <div className="text-[9px] text-zinc-500">Haversine (R=3389.5km)</div>
                </div>

                <div className="bg-[#161B22] p-3 rounded border border-[#242E40]">
                  <div className="text-[10px] text-zinc-500 uppercase">SUIT WALK TIME</div>
                  <div className="text-lg font-bold text-cyan-400 mt-1">
                    {analysis.estimatedWalkingHours} hrs
                  </div>
                  <div className="text-[9px] text-zinc-500">@ 1.2 km/h in spacesuit</div>
                </div>

                <div className="bg-[#161B22] p-3 rounded border border-[#242E40]">
                  <div className="text-[10px] text-zinc-500 uppercase">ROVER DRIVE TIME</div>
                  <div className="text-lg font-bold text-purple-400 mt-1">
                    {analysis.estimatedRoverHours} hrs
                  </div>
                  <div className="text-[9px] text-zinc-500">@ 6.0 km/h in rover</div>
                </div>
              </div>

              {/* Real-time Safety Score Indicator */}
              <div className="bg-[#161B22] p-4 rounded border border-[#242E40] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    SAFETY & TERRAIN HAZARD INDEX
                  </div>
                  <div
                    className={`text-sm font-bold px-2 py-0.5 rounded ${
                      analysis.safetyScore >= 80
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500'
                        : analysis.safetyScore >= 50
                        ? 'bg-amber-950 text-amber-400 border border-amber-500'
                        : 'bg-red-950 text-red-400 border border-red-500'
                    }`}
                  >
                    {analysis.safetyScore} / 100
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#242E40] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      analysis.safetyScore >= 80
                        ? 'bg-emerald-500'
                        : analysis.safetyScore >= 50
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${analysis.safetyScore}%` }}
                  />
                </div>

                <div className="text-xs text-zinc-300 mt-2">
                  {analysis.riskSummary}
                </div>
              </div>

              {/* Hazards Near Route */}
              <div className="space-y-2">
                <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-red-400" />
                  PROXIMITY WARNINGS ({analysis.hazardsEncountered.length})
                </div>

                {analysis.hazardsEncountered.length === 0 ? (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded text-emerald-300 text-xs flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>No classified sand traps or toxic perchlorate zones detected along path.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analysis.hazardsEncountered.map(({ hazard, distanceKm }) => (
                      <div
                        key={hazard.id}
                        className="p-3 bg-red-950/30 border border-red-500/40 rounded text-xs space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-red-400">{hazard.name}</span>
                          <span className="text-zinc-400 font-bold">{distanceKm} km away</span>
                        </div>
                        <div className="text-zinc-300 text-[11px]">
                          Threat: {hazard.threat_class} (Buffer: {hazard.caution_radius_m}m)
                        </div>
                        <div className="text-amber-300/90 text-[10px]">
                          Protocol: {hazard.astronaut_protocol}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Flight Readiness Certification */}
            <div className="pt-3 border-t border-[#242E40] flex justify-between items-center">
              <div className="text-[10px] text-zinc-500">
                ARES COMMAND // EVA PROTOCOL REV 4.2
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)]"
              >
                APPLY & CLOSE PLANNER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
