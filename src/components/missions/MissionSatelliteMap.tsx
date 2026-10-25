import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { satelliteLayers } from '../../services/dataService';
import type { RoverWaypoint } from '../../types/mission';
import { 
  Maximize2, 
  Layers, 
  Crosshair, 
  Compass, 
  MapPin, 
  ZoomIn, 
  ZoomOut,
  ExternalLink,
  Check,
  X,
  Radio
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
  missionId,
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

  // Initialize mini-map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const normLon = normalizeLon(center[1]);
    const map = L.map(containerRef.current, {
      center: [center[0], normLon],
      zoom: zoom,
      minZoom: 2,
      maxZoom: 17,
      crs: L.CRS.EPSG4326,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true
    });

    // Base Tile Layer
    const layerMeta = satelliteLayers.find(l => l.id === activeLayerId) || satelliteLayers[0];
    const tileLayer = L.tileLayer(layerMeta.nasa_trek_wmts, {
      maxZoom: 18,
      maxNativeZoom: layerMeta.max_native_zoom || 7,
      tms: false,
      noWrap: false,
      errorTileUrl: OFFLINE_TILE_FALLBACK_SVG
    });
    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Vector Group
    const vectorGroup = L.layerGroup().addTo(map);
    vectorGroupRef.current = vectorGroup;

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const rawLon = e.latlng.lng < 0 ? e.latlng.lng + 360 : e.latlng.lng;
      setMapCoords({
        lat: parseFloat(e.latlng.lat.toFixed(4)),
        lon: parseFloat(rawLon.toFixed(4))
      });
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center when props change
  useEffect(() => {
    if (!mapRef.current) return;
    const normLon = normalizeLon(center[1]);
    mapRef.current.setView([center[0], normLon], zoom);
  }, [center, zoom]);

  // Switch Tile Layer
  const handleSwitchLayer = (layerId: string) => {
    if (!mapRef.current) return;
    const layerMeta = satelliteLayers.find(l => l.id === layerId);
    if (!layerMeta) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(layerMeta.nasa_trek_wmts, {
      maxZoom: 18,
      maxNativeZoom: layerMeta.max_native_zoom || 7,
      tms: false,
      noWrap: false,
      errorTileUrl: OFFLINE_TILE_FALLBACK_SVG
    });
    newLayer.addTo(mapRef.current);
    tileLayerRef.current = newLayer;
    setActiveLayerId(layerId);
  };

  // Render Route and Waypoints on the Satellite Map
  useEffect(() => {
    if (!mapRef.current || !vectorGroupRef.current) return;
    const group = vectorGroupRef.current;
    group.clearLayers();

    if (missionType === 'rover' && waypoints.length > 0) {
      const latLngs: [number, number][] = waypoints.map(wp => [wp.lat, normalizeLon(wp.lon)]);
      
      // Black halo for crisp contrast against any background
      const haloLine = L.polyline(latLngs, {
        color: '#000000',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      });
      group.addLayer(haloLine);

      // High-contrast cyan tactical route line
      const routeLine = L.polyline(latLngs, {
        color: '#38BDF8',
        weight: 3,
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
            width: ${isSelected ? '24px' : '18px'}; 
            height: ${isSelected ? '24px' : '18px'}; 
            border-radius: 50%; 
            background: ${isSelected ? '#FFFFFF' : isCurrent ? '#38BDF8' : isStart ? '#A855F7' : '#0F172A'}; 
            border: 2px solid ${isSelected ? '#38BDF8' : '#FFFFFF'}; 
            box-shadow: 0 0 10px rgba(0,0,0,0.8);
            color: ${isSelected ? '#000000' : '#FFFFFF'};
            font-size: 9px;
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
          iconSize: [isSelected ? 24 : 18, isSelected ? 24 : 18],
          iconAnchor: [isSelected ? 12 : 9, isSelected ? 12 : 9]
        });

        const marker = L.marker([wp.lat, normWpLon], { icon });
        marker.on('click', () => {
          if (onSelectWaypoint) onSelectWaypoint(wp);
        });

        marker.bindTooltip(`
          <div style="padding: 4px 6px; font-family: monospace;">
            <div style="font-size: 11px; font-weight: bold; color: #FFFFFF;">${wp.target_name}</div>
            <div style="font-size: 10px; color: #38BDF8;">Sol ${wp.sol} • ${wp.dist_m}m</div>
            <div style="font-size: 9px; color: #94A3B8; margin-top: 2px;">${wp.activity}</div>
          </div>
        `, {
          direction: 'top',
          offset: [0, -10],
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
        color: '#38BDF8',
        weight: 1.5,
        dashArray: '4, 6',
        fillColor: '#38BDF8',
        fillOpacity: 0.08
      });
      group.addLayer(ellipse);

      const landerIconHtml = `
        <div style="
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          background: #38BDF8; 
          border: 2px solid #FFFFFF; 
          box-shadow: 0 0 14px rgba(56,189,248,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000000;
          font-weight: 900;
          font-size: 11px;
        ">
          ◎
        </div>
      `;
      const landerIcon = L.divIcon({
        html: landerIconHtml,
        className: 'lander-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const landerMarker = L.marker([center[0], normLon], { icon: landerIcon });
      landerMarker.bindTooltip(`
        <div style="padding: 4px 6px;">
          <div style="font-weight: bold; color: #38BDF8;">${missionName} Touchdown Site</div>
          <div style="font-size: 10px; color: #E2E8F0;">${landingSiteName}</div>
        </div>
      `, { direction: 'top', offset: [0, -12] });

      group.addLayer(landerMarker);
    }
  }, [missionType, waypoints, activeWaypoint, center, missionName, landingSiteName]);

  const activeLayer = SPECTRAL_LAYERS.find(l => l.id === activeLayerId) || SPECTRAL_LAYERS[0];

  return (
    <div className="rounded-2xl overflow-hidden bg-[#05070B] border border-white/[0.08] shadow-2xl flex flex-col">
      {/* Top Bar: Clean, Authoritative, Zero Slop */}
      <div className="p-4 bg-[#080B10] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-white">
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold">
                ORBITAL SATELLITE RECONNAISSANCE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/10">
                {activeLayer.instrument}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
              <span>{missionName} Ground Track</span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs font-mono text-zinc-400 font-normal">{landingSiteName}</span>
            </h4>
          </div>
        </div>

        {/* Right Action: Expand Fullscreen */}
        <div className="flex items-center space-x-2 font-mono">
          <button
            onClick={onExpandToTactical}
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-200 hover:text-white text-xs flex items-center space-x-2 transition-all active:scale-95"
          >
            <span>FULLSCREEN GIS</span>
            <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="relative w-full h-[420px] bg-[#05070B]">
        <div ref={containerRef} className="w-full h-full z-0" />

        {/* ================================================================= */}
        {/* GOOGLE MAPS STYLE FLOATING LAYER SWITCHER BUTTON & POPOVER       */}
        {/* ================================================================= */}
        <div className="absolute top-3 left-3 z-30">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={`px-3 py-2 rounded-xl backdrop-blur-xl border text-xs font-mono flex items-center space-x-2.5 transition-all shadow-2xl ${
              showLayerMenu
                ? 'bg-white text-black border-white'
                : 'bg-black/85 hover:bg-black text-white border-white/20'
            }`}
          >
            <Layers className={`w-4 h-4 ${showLayerMenu ? 'text-black' : 'text-cyan-400'}`} />
            <span className="font-semibold tracking-wider">MAP VIEW</span>
            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
              showLayerMenu ? 'bg-black/10 text-black' : 'bg-white/10 text-cyan-300'
            }`}>
              {activeLayer.name}
            </span>
          </button>

          {/* Popover Drawer */}
          {showLayerMenu && (
            <div className="mt-2 w-80 md:w-96 rounded-2xl bg-[#090C12]/95 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl space-y-3 font-sans animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Choose Planetary Layer</span>
                </span>
                <button
                  onClick={() => setShowLayerMenu(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {SPECTRAL_LAYERS.map(layer => {
                  const isSelected = activeLayerId === layer.id;
                  return (
                    <div
                      key={layer.id}
                      onClick={() => handleSwitchLayer(layer.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white/[0.08] border-cyan-400/80 shadow-lg'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white">{layer.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 border border-white/10">
                              {layer.badge}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                            {layer.instrument}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-300 leading-relaxed mt-1.5 font-normal">
                        {layer.desc}
                      </p>

                      <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between">
                        <a
                          href={layer.researchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center space-x-1"
                        >
                          <span>Read Research Dataset</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                        <span className="text-[9px] font-mono text-zinc-500">NASA PDS</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Crosshair Overlay In Center */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-20">
          <div className="w-8 h-8 border border-white/40 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        </div>

        {/* Bottom Left Telemetry Overlay */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 font-mono text-[10px] text-zinc-300 space-y-1">
          <div className="flex items-center space-x-2 text-zinc-400">
            <span className="text-white font-bold">COORDINATES:</span>
            <span>{mapCoords.lat >= 0 ? `${mapCoords.lat}°N` : `${Math.abs(mapCoords.lat)}°S`}, {mapCoords.lon}°E</span>
          </div>
          <div className="flex items-center space-x-2 text-zinc-400">
            <span>ACTIVE BAND:</span>
            <span className="text-cyan-400 font-semibold">{activeLayer.badge} • Zoom {currentZoom}x</span>
          </div>
        </div>

        {/* Bottom Right Map Zoom Controls */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col space-y-1">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="w-8 h-8 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="w-8 h-8 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Context Banner: Clean, Informative, With Research Citation */}
      <div className="p-4 bg-[#080B10] border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
        <div className="flex items-start space-x-3 max-w-2xl">
          <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <div className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
              SCIENTIFIC REMOTE SENSING INSIGHT ({activeLayer.name.toUpperCase()})
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed font-normal">
              {activeLayer.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 font-mono text-[11px] text-zinc-400">
          <div>
            <span className="text-zinc-500 uppercase text-[9px] block">WAYPOINTS</span>
            <span className="text-white font-bold">{waypoints.length > 0 ? waypoints.length : '1 Site'}</span>
          </div>
          {waypoints.length > 0 && (
            <div>
              <span className="text-zinc-500 uppercase text-[9px] block">TRAVERSED DISTANCE</span>
              <span className="text-white font-bold">
                {(waypoints[waypoints.length - 1].dist_m / 1000).toFixed(2)} km
              </span>
            </div>
          )}
          <a
            href={activeLayer.researchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-[11px] flex items-center space-x-1.5 transition-colors"
          >
            <span>Research Paper</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
