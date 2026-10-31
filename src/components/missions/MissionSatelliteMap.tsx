import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { satelliteLayers } from '../../services/dataService';
import type { RoverWaypoint } from '../../types/mission';
import { 
  Maximize2, 
  Layers, 
  Crosshair, 
  ZoomIn, 
  ZoomOut,
  Check,
  X,
  ArrowUpRight
} from 'lucide-react';

interface MissionSatelliteMapProps {
  missionType: 'rover' | 'lander' | 'satellite';
  missionId: string;
  missionName: string;
  center: [number, number]; // [lat, lon]
  zoom?: number;
  waypoints?: RoverWaypoint[];
  activeWaypoint?: RoverWaypoint | null;
  onSelectWaypoint?: (wp: RoverWaypoint) => void;
  landingSiteName: string;
  onExpandToTactical: () => void;
}

const OFFLINE_TILE_FALLBACK_SVG = 
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="%2305070B"/><path d="M0,0 L256,256 M256,0 L0,256" stroke="%231E293B" stroke-width="0.5"/><text x="128" y="128" fill="%23475569" font-family="monospace" font-size="10" text-anchor="middle">OFFLINE MARS TILE</text></svg>';

export const SPECTRAL_LAYERS = [
  {
    id: 'VIKING_MDIM21',
    name: 'Visible Color',
    instrument: 'Viking MDIM 2.1 (232m/px)',
    badge: 'TRUE ALBEDO',
    desc: 'Calibrated martian surface albedo and oxidized iron oxide natural reflectance.',
    researchUrl: 'https://astrogeology.usgs.gov/search/map/Mars/Viking/MDIM21',
    paperTitle: 'USGS Astrogeology Viking Global MDIM 2.1 Mosaic Archive'
  },
  {
    id: 'ODYSSEY_THEMIS_NIGHTIR',
    name: 'Thermal Infrared',
    instrument: 'Odyssey THEMIS (100m/px)',
    badge: 'THERMAL INERTIA',
    desc: 'Measures nighttime surface heat: bedrock stays warm (bright), loose sand cools rapidly (dark).',
    researchUrl: 'https://themis.asu.edu/',
    paperTitle: 'Christensen et al., 2001 Mars Odyssey THEMIS Investigation'
  },
  {
    id: 'MGS_MOLA',
    name: 'Laser Elevation',
    instrument: 'MGS MOLA (463m/px)',
    badge: 'TOPOGRAPHY',
    desc: 'Color-coded laser altimetry contours spanning -8000m to +21000m.',
    researchUrl: 'https://pds-geosciences.wustl.edu/missions/mgs/mola.html',
    paperTitle: 'Smith et al., Mars Global Surveyor MOLA Topography Model'
  },
  {
    id: 'MRO_JEZERO_CTX',
    name: 'CTX Recon (6m)',
    instrument: 'MRO Context Camera',
    badge: 'HIGH-RES',
    desc: 'High-resolution panchromatic mosaic resolving meter-scale boulders and landing ellipse terrain.',
    researchUrl: 'https://mars.nasa.gov/mro/mission/instruments/ctx/',
    paperTitle: 'Malin et al., Mars Reconnaissance Orbiter Context Camera (CTX)'
  }
];

export const MissionSatelliteMap: React.FC<MissionSatelliteMapProps> = ({
  missionType,
  missionId: _missionId,
  missionName,
  center,
  zoom = 11,
  waypoints = [],
  activeWaypoint,
  onSelectWaypoint,
  landingSiteName,
  onExpandToTactical
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const vectorGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayerId, setActiveLayerId] = useState<string>('VIKING_MDIM21');
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lon: number }>({
    lat: center[0],
    lon: center[1]
  });
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);

  // Normalize longitude for Leaflet (-180 to +180)
  const normalizeLon = (lon: number) => (lon > 180 ? lon - 360 : lon);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const initialLat = center[0];
      const initialLon = normalizeLon(center[1]);

      const map = L.map(containerRef.current, {
        center: [initialLat, initialLon],
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
        minZoom: 4,
        maxZoom: 16
      });

      mapRef.current = map;

      // Track movement
      map.on('move', () => {
        const c = map.getCenter();
        let displayLon = c.lng;
        if (displayLon < 0) displayLon += 360;
        setMapCoords({ lat: c.lat, lon: displayLon });
        setCurrentZoom(map.getZoom());
      });

      // Layer group for vectors
      const vectorGroup = L.layerGroup().addTo(map);
      vectorGroupRef.current = vectorGroup;

      // Initial Tile Layer
      const layerConfig = satelliteLayers.find(l => l.id === activeLayerId) || satelliteLayers.find(l => l.id === 'VIKING_MDIM21') || satelliteLayers[0];
      const tile = L.tileLayer(layerConfig.nasa_trek_wmts, {
        maxZoom: 18,
        maxNativeZoom: layerConfig.max_native_zoom || 7,
        errorTileUrl: OFFLINE_TILE_FALLBACK_SVG
      }).addTo(map);
      tileLayerRef.current = tile;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Switch Layer
  const handleSwitchLayer = (layerId: string) => {
    setActiveLayerId(layerId);
    setShowLayerMenu(false);

    if (mapRef.current && tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
      const layerConfig = satelliteLayers.find(l => l.id === layerId) || satelliteLayers.find(l => l.id === 'VIKING_MDIM21') || satelliteLayers[0];
      const newTile = L.tileLayer(layerConfig.nasa_trek_wmts, {
        maxZoom: 18,
        maxNativeZoom: layerConfig.max_native_zoom || 7,
        errorTileUrl: OFFLINE_TILE_FALLBACK_SVG
      }).addTo(mapRef.current);
      tileLayerRef.current = newTile;
    }
  };

  // Render Traverse or Landing Site Vectors
  useEffect(() => {
    if (!mapRef.current || !vectorGroupRef.current) return;
    const group = vectorGroupRef.current;
    group.clearLayers();

    if (missionType === 'rover' && waypoints.length > 0) {
      const latLngs: [number, number][] = waypoints.map(wp => [wp.lat, normalizeLon(wp.lon)]);

      // Outer halo line
      const haloLine = L.polyline(latLngs, {
        color: '#000000',
        weight: 5,
        opacity: 0.8
      });
      group.addLayer(haloLine);

      // High-contrast tactical route line
      const routeLine = L.polyline(latLngs, {
        color: '#FFFFFF',
        weight: 2.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      });
      group.addLayer(routeLine);

      // Waypoint markers
      waypoints.forEach((wp, idx) => {
        const isSelected = activeWaypoint?.sol === wp.sol;
        const isStart = idx === 0;
        const isCurrent = idx === waypoints.length - 1;
        const normWpLon = normalizeLon(wp.lon);

        const markerHtml = `
          <div style="
            display: flex; 
            align-items: center; 
            justify-content: center; 
            width: ${isSelected ? '22px' : '16px'}; 
            height: ${isSelected ? '22px' : '16px'}; 
            border-radius: 4px; 
            background: ${isSelected ? '#FFFFFF' : isCurrent ? '#EAEAEA' : isStart ? '#38BDF8' : '#0F131D'}; 
            border: 1.5px solid ${isSelected ? '#000000' : '#FFFFFF'}; 
            box-shadow: 0 0 8px rgba(0,0,0,0.8);
            color: ${isSelected ? '#000000' : '#FFFFFF'};
            font-size: 8px;
            font-family: monospace;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            ${isStart ? 'L' : isCurrent ? '★' : wp.sol}
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'rover-wp-pin',
          iconSize: [isSelected ? 22 : 16, isSelected ? 22 : 16],
          iconAnchor: [isSelected ? 11 : 8, isSelected ? 11 : 8]
        });

        const marker = L.marker([wp.lat, normWpLon], { icon });
        marker.on('click', () => {
          if (onSelectWaypoint) onSelectWaypoint(wp);
        });

        marker.bindTooltip(`
          <div style="padding: 4px 6px; font-family: monospace;">
            <div style="font-size: 11px; font-weight: bold; color: #FFFFFF;">${wp.target_name}</div>
            <div style="font-size: 10px; color: #94A3B8;">Sol ${wp.sol} • ${wp.dist_m}m</div>
            <div style="font-size: 9px; color: #64748B; margin-top: 2px;">${wp.activity}</div>
          </div>
        `, {
          direction: 'top',
          offset: [0, -8],
          className: 'tactical-mini-tooltip'
        });

        group.addLayer(marker);
      });

      try {
        const bounds = L.latLngBounds(latLngs);
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch {
        // ignore bounds calculation error
      }
    } else if (missionType === 'lander') {
      const normLon = normalizeLon(center[1]);

      const ellipse = L.circle([center[0], normLon], {
        radius: 3500,
        color: '#FFFFFF',
        weight: 1.5,
        dashArray: '4, 6',
        fillColor: '#FFFFFF',
        fillOpacity: 0.05
      });
      group.addLayer(ellipse);

      const landerIconHtml = `
        <div style="
          width: 22px; 
          height: 22px; 
          border-radius: 4px; 
          background: #FFFFFF; 
          border: 2px solid #000000; 
          box-shadow: 0 0 10px rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000000;
          font-weight: 900;
          font-size: 10px;
        ">
          ◎
        </div>
      `;
      const landerIcon = L.divIcon({
        html: landerIconHtml,
        className: 'lander-pin',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const landerMarker = L.marker([center[0], normLon], { icon: landerIcon });
      landerMarker.bindTooltip(`
        <div style="padding: 4px 6px; font-family: monospace;">
          <div style="font-weight: bold; color: #FFFFFF;">${missionName} Touchdown</div>
          <div style="font-size: 10px; color: #94A3B8;">${landingSiteName}</div>
        </div>
      `, { direction: 'top', offset: [0, -10] });

      group.addLayer(landerMarker);
    }
  }, [missionType, waypoints, activeWaypoint, center, missionName, landingSiteName]);

  const activeLayer = SPECTRAL_LAYERS.find(l => l.id === activeLayerId) || SPECTRAL_LAYERS[0];

  return (
    <div className="bezel-shell">
      <div className="bezel-core overflow-hidden flex flex-col">
        {/* Top Bar: Clean, Authoritative, Aerospace HUD */}
        <div className="p-3.5 bg-[#080B10] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 z-10 font-mono">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded bg-white/[0.04] border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-white">
              GIS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-semibold">
                  ORBITAL SATELLITE RECONNAISSANCE
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-zinc-300 border border-white/10">
                  {activeLayer.instrument}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white tracking-wider uppercase flex items-center space-x-2">
                <span>{missionName} GROUND TRACK</span>
                <span className="text-zinc-600">•</span>
                <span className="text-[11px] text-zinc-400 font-normal">{landingSiteName}</span>
              </h4>
            </div>
          </div>

          {/* Right Action: Expand Fullscreen */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onExpandToTactical}
              className="px-3 py-1 rounded bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white text-xs flex items-center space-x-1.5 transition-all active:scale-[0.98]"
            >
              <span>EXPAND GIS</span>
              <Maximize2 className="w-3 h-3 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Map Viewport */}
        <div className="relative w-full h-[420px] bg-[#050608]">
          <div ref={containerRef} className="w-full h-full z-0" />

          {/* GOOGLE MAPS STYLE FLOATING LAYER SWITCHER BUTTON & POPOVER */}
          <div className="absolute top-3 left-3 z-30">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className={`px-3 py-1.5 rounded backdrop-blur-xl border text-xs font-mono flex items-center space-x-2 transition-all shadow-xl ${
                showLayerMenu
                  ? 'bg-white text-black border-white'
                  : 'bg-black/85 hover:bg-black text-white border-white/20'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${showLayerMenu ? 'text-black' : 'text-zinc-400'}`} />
              <span className="font-semibold tracking-wider text-[11px]">LAYER:</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded uppercase font-bold ${
                showLayerMenu ? 'bg-black/10 text-black' : 'bg-white/10 text-zinc-200'
              }`}>
                {activeLayer.name}
              </span>
            </button>

            {/* Popover Drawer */}
            {showLayerMenu && (
              <div className="mt-2 w-80 md:w-96 rounded-lg bg-[#090C12]/95 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl space-y-3 font-sans animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Choose Planetary Layer</span>
                  </span>
                  <button
                    onClick={() => setShowLayerMenu(false)}
                    className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {SPECTRAL_LAYERS.map(layer => {
                    const isSelected = activeLayerId === layer.id;
                    return (
                      <div
                        key={layer.id}
                        onClick={() => handleSwitchLayer(layer.id)}
                        className={`p-3 rounded border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white/[0.08] border-white/40 shadow-lg'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-white font-mono">{layer.name}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 border border-white/10">
                                {layer.badge}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                              {layer.instrument}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-zinc-300 leading-relaxed mt-1.5 font-sans font-normal">
                          {layer.desc}
                        </p>

                        <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between font-mono">
                          <a
                            href={layer.researchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-[10px] text-zinc-400 hover:text-white hover:underline flex items-center space-x-1"
                          >
                            <span>Read Research Dataset</span>
                            <ArrowUpRight className="w-3 h-3 ml-0.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick HUD Telemetry Overlay */}
          <div className="absolute top-3 right-3 z-20 flex flex-col items-end space-y-1.5">
            <div className="px-2.5 py-1 rounded bg-black/85 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300 shadow-md">
              <span className="text-zinc-500 mr-1.5">COORD:</span>
              <span className="text-white font-bold">{mapCoords.lat.toFixed(4)}°N, {mapCoords.lon.toFixed(4)}°E</span>
            </div>

            <div className="px-2.5 py-1 rounded bg-black/85 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300 shadow-md">
              <span className="text-zinc-500 mr-1.5">BAND:</span>
              <span className="text-zinc-200">{activeLayer.badge}</span>
              <span className="text-zinc-500 mx-1">•</span>
              <span className="text-zinc-400">{currentZoom}x</span>
            </div>
          </div>

          {/* Zoom In/Out Buttons */}
          <div className="absolute bottom-3 right-3 z-20 flex flex-col space-y-1 font-mono">
            <button
              onClick={() => mapRef.current?.zoomIn()}
              className="w-8 h-8 rounded bg-black/85 hover:bg-white hover:text-black text-white border border-white/20 flex items-center justify-center transition-all shadow-md active:scale-95"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut()}
              className="w-8 h-8 rounded bg-black/85 hover:bg-white hover:text-black text-white border border-white/20 flex items-center justify-center transition-all shadow-md active:scale-95"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.setView([center[0], normalizeLon(center[1])], zoom);
                }
              }}
              className="w-8 h-8 rounded bg-black/85 hover:bg-white hover:text-black text-white border border-white/20 flex items-center justify-center transition-all shadow-md active:scale-95"
              title="Recenter Map"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Waypoint Selector Horizontal Scroll Pill Strip */}
          {missionType === 'rover' && waypoints.length > 0 && (
            <div className="absolute bottom-3 left-3 right-16 z-20 overflow-x-auto">
              <div className="flex items-center space-x-1 p-1 bg-black/85 backdrop-blur-md border border-white/15 rounded shadow-xl w-max font-mono">
                {waypoints.map((wp, i) => {
                  const isSelected = activeWaypoint?.sol === wp.sol;
                  return (
                    <button
                      key={i}
                      onClick={() => onSelectWaypoint && onSelectWaypoint(wp)}
                      className={`px-2 py-0.5 rounded text-[10px] transition-all whitespace-nowrap ${
                        isSelected
                          ? 'bg-white text-black font-bold shadow'
                          : 'text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {i === 0 ? 'L' : i === waypoints.length - 1 ? '★' : wp.sol}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer: Remote Sensing Context Card */}
        <div className="p-3 bg-[#080B10] border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="space-y-0.5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
              SPECTRAL REMOTE SENSING // {activeLayer.name.toUpperCase()}
            </div>
            <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
              {activeLayer.desc}
            </p>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <div>
              <span className="text-zinc-500 mr-1">WAYPOINTS:</span>
              <span className="text-white font-bold">{waypoints.length}</span>
            </div>
            {waypoints.length > 0 && (
              <div>
                <span className="text-zinc-500 mr-1">DISTANCE:</span>
                <span className="text-white font-bold">{(waypoints[waypoints.length - 1].dist_m / 1000).toFixed(2)} km</span>
              </div>
            )}
            <a
              href={activeLayer.researchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white underline flex items-center space-x-1"
            >
              <span>Archive</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
