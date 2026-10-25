import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  allRoverTraverses, 
  allLanders, 
  classifiedHazards, 
  threeForksDepot,
  satelliteLayers,
  ingenuityData,
  cautionZonesGeoJSON
} from '../../services/dataService';
import type { 
  RoverWaypoint, 
  ClassifiedHazard,
  EVAPlannedWaypoint 
} from '../../types/mission';
import { Layers, Compass, Eye, Plane } from 'lucide-react';

interface TacticalMap2DProps {
  activeMission: string;
  selectedSol: number;
  onSelectWaypoint: (wp: RoverWaypoint) => void;
  onSelectHazard: (h: ClassifiedHazard) => void;
  onSelectMission?: (missionId: string) => void;
  isEVAPlanning: boolean;
  evaWaypoints: EVAPlannedWaypoint[];
  onAddEVAWaypoint: (wp: EVAPlannedWaypoint) => void;
  flyToTarget?: { lat: number; lon: number; zoom?: number } | null;
}

const OFFLINE_TILE_FALLBACK_SVG = 
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="%230F131A"/><path d="M0,0 L256,256 M256,0 L0,256" stroke="%231E293B" stroke-width="0.5"/><text x="128" y="128" fill="%23334155" font-family="monospace" font-size="10" text-anchor="middle">OFFLINE MARS TILE</text></svg>';

export const TacticalMap2D: React.FC<TacticalMap2DProps> = ({
  activeMission,
  selectedSol,
  onSelectWaypoint,
  onSelectHazard,
  onSelectMission,
  isEVAPlanning,
  evaWaypoints,
  onAddEVAWaypoint,
  flyToTarget
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);
  const vectorLayersGroupRef = useRef<L.LayerGroup | null>(null);
  const evaLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayerId, setActiveLayerId] = useState<string>('VIKING_MDIM21');
  const [showAllRovers, setShowAllRovers] = useState<boolean>(true);
  const [showIngenuity, setShowIngenuity] = useState<boolean>(true);
  const [showHazards, setShowHazards] = useState<boolean>(true);
  const [showCautionPolygons, setShowCautionPolygons] = useState<boolean>(true);
  const [showDepot, setShowDepot] = useState<boolean>(true);
  const [isLayersOpen, setIsLayersOpen] = useState<boolean>(false);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Initialize Map with Mars Equirectangular CRS (EPSG:4326)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Standard Plate Carree CRS matching NASA Mars Trek WMTS
    const map = L.map(mapContainerRef.current, {
      center: [18.45, 77.42], // Default on Jezero Crater
      zoom: 6,
      minZoom: 1,
      maxZoom: 18,
      crs: L.CRS.EPSG4326,
      zoomControl: false,
      attributionControl: false
    });

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial Tile Layer: NASA Mars Trek Viking MDIM 2.1 Color Mosaic
    const initialMeta = satelliteLayers.find(l => l.id === 'VIKING_MDIM21') || satelliteLayers[0];
    const vikingLayer = L.tileLayer(initialMeta.nasa_trek_wmts, {
      maxZoom: 18,
      maxNativeZoom: initialMeta.max_native_zoom || 7,
      tms: false,
      noWrap: false,
      errorTileUrl: OFFLINE_TILE_FALLBACK_SVG
    });
    vikingLayer.addTo(map);
    activeTileLayerRef.current = vikingLayer;

    // Layer Groups
    const vectorGroup = L.layerGroup().addTo(map);
    vectorLayersGroupRef.current = vectorGroup;

    const evaGroup = L.layerGroup().addTo(map);
    evaLayerGroupRef.current = evaGroup;

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Switch Tile Layer
  const switchSatelliteLayer = (layerId: string) => {
    if (!mapRef.current) return;
    const layerMeta = satelliteLayers.find(l => l.id === layerId);
    if (!layerMeta) return;

    if (activeTileLayerRef.current) {
      mapRef.current.removeLayer(activeTileLayerRef.current);
    }

    const newLayer = L.tileLayer(layerMeta.nasa_trek_wmts, {
      maxZoom: 18,
      maxNativeZoom: layerMeta.max_native_zoom || 7,
      tms: false,
      noWrap: false,
      errorTileUrl: OFFLINE_TILE_FALLBACK_SVG
    });

    newLayer.addTo(mapRef.current);
    activeTileLayerRef.current = newLayer;
    setActiveLayerId(layerId);
  };

  // Fly to target
  useEffect(() => {
    if (!mapRef.current || !flyToTarget) return;
    const lon = flyToTarget.lon > 180 ? flyToTarget.lon - 360 : flyToTarget.lon;
    mapRef.current.flyTo([flyToTarget.lat, lon], flyToTarget.zoom || 8, {
      duration: 1.5
    });
  }, [flyToTarget]);

  // Click Handler for EVA Planning
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (!isEVAPlanning) return;
      const normalizedLon = e.latlng.lng < 0 ? e.latlng.lng + 360 : e.latlng.lng;
      const newWp: EVAPlannedWaypoint = {
        id: `EVA-WP-${evaWaypoints.length + 1}`,
        name: `EVA Point #${evaWaypoints.length + 1}`,
        lat: parseFloat(e.latlng.lat.toFixed(4)),
        lon: parseFloat(normalizedLon.toFixed(4))
      };
      onAddEVAWaypoint(newWp);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [isEVAPlanning, evaWaypoints, onAddEVAWaypoint]);

  // Render Vector Layers (Rovers, Ingenuity, Landers, Hazards, Caution Polygons, Discoveries)
  useEffect(() => {
    if (!mapRef.current || !vectorLayersGroupRef.current) return;
    const group = vectorLayersGroupRef.current;
    group.clearLayers();

    // Helper: Normalize Longitude to [-180, 180] for Leaflet
    const normLon = (lon: number) => (lon > 180 ? lon - 360 : lon);

    // 1. Draw Rover Traverses
    const roversToRender = showAllRovers
      ? Object.entries(allRoverTraverses)
      : Object.entries(allRoverTraverses).filter(([key]) => key === activeMission);

    roversToRender.forEach(([key, rover]) => {
      const isCurrentActive = key === activeMission;
      const color = isCurrentActive ? '#E25B38' : '#6B7280';
      const weight = isCurrentActive ? 4 : 2;

      const latlngs: [number, number][] = rover.waypoints.map(wp => [
        wp.lat,
        normLon(wp.lon)
      ]);

      // Rover Path Polyline
      const polyline = L.polyline(latlngs, {
        color,
        weight,
        opacity: isCurrentActive ? 0.95 : 0.5,
        dashArray: isCurrentActive ? undefined : '4, 4'
      });
      polyline.addTo(group);

      // Rover Landing Site Marker
      const landingIcon = L.divIcon({
        className: 'custom-landing-marker',
        html: `
          <div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px ${color};"></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const landingMarker = L.marker(
        [rover.landing_site.latitude, normLon(rover.landing_site.longitude)],
        { icon: landingIcon }
      );
      landingMarker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px;">
          <b style="color: #E25B38;">${rover.rover} Landing Site</b><br/>
          ${rover.landing_site.name}<br/>
          Sol 0 | ${rover.landing_site.latitude.toFixed(2)}°N, ${rover.landing_site.longitude.toFixed(2)}°E<br/>
          Elev: ${rover.landing_site.elevation_m}m
        </div>
      `);
      landingMarker.on('click', () => {
        if (onSelectMission) onSelectMission(key);
      });
      landingMarker.addTo(group);

      // If active rover, add interactive pins on milestones
      if (isCurrentActive) {
        rover.waypoints.forEach(wp => {
          const isSelected = wp.sol === selectedSol;
          const pinColor = isSelected ? '#38BDF8' : '#F97316';
          const pinSize = isSelected ? 12 : 8;

          const wpMarker = L.circleMarker([wp.lat, normLon(wp.lon)], {
            radius: pinSize,
            color: '#FFFFFF',
            weight: 1.5,
            fillColor: pinColor,
            fillOpacity: 0.9
          });

          wpMarker.bindPopup(`
            <div style="font-family: monospace; font-size: 11px;">
              <b style="color: #38BDF8;">Sol ${wp.sol}: ${wp.target_name}</b><br/>
              <b>Distance:</b> ${(wp.dist_m / 1000).toFixed(2)} km<br/>
              <b>Elev:</b> ${wp.elev_m.toFixed(1)}m<br/>
              <p style="margin-top: 4px; color: #D1D5DB;">${wp.activity}</p>
              ${wp.hazard_warning ? `<div style="color: #EF4444; margin-top: 4px;">⚠️ ${wp.hazard_warning}</div>` : ''}
            </div>
          `);

          wpMarker.on('click', () => {
            onSelectWaypoint(wp);
          });

          wpMarker.addTo(group);
        });
      }
    });

    // 2. Draw Ingenuity Mars Helicopter Flight Path & Airfields
    if (showIngenuity) {
      const airfieldCoords: [number, number][] = ingenuityData.key_airfields.map(af => [
        af.lat,
        normLon(af.lon)
      ]);

      // Flight track polyline
      const heliFlightLine = L.polyline(airfieldCoords, {
        color: '#38BDF8',
        weight: 2.5,
        dashArray: '3, 5',
        opacity: 0.85
      });
      heliFlightLine.bindPopup(`
        <div style="font-family: monospace; font-size: 11px;">
          <b style="color: #38BDF8;">${ingenuityData.craft}</b><br/>
          <b>Flights Completed:</b> ${ingenuityData.total_flights} flights (${ingenuityData.total_distance_km} km)<br/>
          <b>Max Altitude:</b> ${ingenuityData.max_altitude_m}m | <b>Airtime:</b> ${ingenuityData.total_air_time_minutes} min<br/>
          <span style="color: #9CA3AF;">${ingenuityData.mission_status}</span>
        </div>
      `);
      heliFlightLine.addTo(group);

      // Airfield pins
      ingenuityData.key_airfields.forEach(af => {
        const heliIcon = L.divIcon({
          className: 'custom-heli-marker',
          html: `
            <div style="background-color: #0284C7; width: 13px; height: 13px; border-radius: 2px; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 6px #38BDF8;">
              <span style="font-size: 8px; color: white; font-weight: bold;">H</span>
            </div>
          `,
          iconSize: [13, 13],
          iconAnchor: [6, 6]
        });

        const afMarker = L.marker([af.lat, normLon(af.lon)], { icon: heliIcon });
        afMarker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px;">
            <b style="color: #38BDF8;">${af.name}</b><br/>
            <b>Hosted Flights:</b> Flights ${af.flights_hosted.join(', ')}<br/>
            <b>Coords:</b> ${af.lat.toFixed(4)}°N, ${af.lon.toFixed(4)}°E<br/>
            <b>Elevation:</b> ${af.elev_m}m
          </div>
        `);
        afMarker.addTo(group);
      });
    }

    // 3. Draw Stationary Landers (Viking 1 & 2, Phoenix, InSight)
    Object.entries(allLanders).forEach(([key, lander]) => {
      const isLanderActive = activeMission === key;
      const markerColor = isLanderActive ? '#38BDF8' : '#06B6D4';

      const icon = L.divIcon({
        className: 'custom-lander-marker',
        html: `
          <div style="background-color: ${markerColor}; width: 14px; height: 14px; transform: rotate(45deg); border: 2px solid white; box-shadow: 0 0 ${isLanderActive ? '12px #38BDF8' : '6px #06B6D4'};"></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker(
        [lander.landing_site.latitude, normLon(lander.landing_site.longitude)],
        { icon }
      );
      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px;">
          <b style="color: #06B6D4;">${lander.mission}</b><br/>
          <b>Site:</b> ${lander.landing_site.name} (${lander.landing_site.region})<br/>
          <b>Coords:</b> ${lander.landing_site.latitude.toFixed(2)}°N, ${lander.landing_site.longitude.toFixed(2)}°E | <b>Elev:</b> ${lander.landing_site.elevation_m}m<br/>
          <b>Operational Duration:</b> ${lander.operational_record.duration_sols} sols<br/>
          <p style="margin-top: 4px; color: #D1D5DB;"><b>Feat:</b> ${lander.operational_record.historic_feat}</p>
          <div style="margin-top: 4px; color: #38BDF8; font-size: 10px;">
            <b>Instruments:</b> ${lander.science_instruments.slice(0, 3).join(', ')}...
          </div>
        </div>
      `);
      marker.on('click', () => {
        if (onSelectMission) onSelectMission(key);
      });
      marker.addTo(group);
    });

    // 4. Draw GeoJSON Caution Buffer Polygons (Precise terrain boundaries)
    if (showCautionPolygons && cautionZonesGeoJSON) {
      try {
        const geoJsonLayer = L.geoJSON(cautionZonesGeoJSON as any, {
          coordsToLatLng: (coords: [number, number]) => {
            return L.latLng(coords[1], normLon(coords[0]));
          },
          style: (feature: any) => {
            const props = feature?.properties || {};
            return {
              color: props.stroke_color || '#EF4444',
              fillColor: props.color || '#EF4444',
              fillOpacity: props.fill_opacity || 0.35,
              weight: 2,
              dashArray: '4, 4'
            };
          },
          onEachFeature: (feature: any, layer: L.Layer) => {
            const props = feature?.properties || {};
            layer.bindPopup(`
              <div style="font-family: monospace; font-size: 11px;">
                <b style="color: #EF4444;">CAUTION ZONE: ${props.name}</b><br/>
                <b>Threat Level:</b> ${props.threat_level}<br/>
                <b>Mechanism:</b> ${props.threat_type}<br/>
                <b>Buffer Radius:</b> ${props.buffer_radius_m}m<br/>
                <b>Clearance:</b> ${props.recommended_clearance_km} km clearance
              </div>
            `);
            layer.on('click', () => {
              const matched = classifiedHazards.find(h => h.id === props.hazard_id);
              if (matched) onSelectHazard(matched);
            });
          }
        });
        geoJsonLayer.addTo(group);
      } catch (err) {
        console.warn('GeoJSON caution zones render error:', err);
      }
    }

    // 5. Draw Hazard Circular Buffer Radars
    if (showHazards) {
      classifiedHazards.forEach(hazard => {
        const center: [number, number] = [
          hazard.coordinates.lat,
          normLon(hazard.coordinates.lon)
        ];

        // Danger buffer circle
        const circle = L.circle(center, {
          radius: hazard.caution_radius_m,
          color: hazard.severity === 'CRITICAL' ? '#EF4444' : hazard.severity === 'HIGH' ? '#F59E0B' : '#F97316',
          fillColor: hazard.severity === 'CRITICAL' ? '#EF4444' : hazard.severity === 'HIGH' ? '#F59E0B' : '#F97316',
          fillOpacity: 0.25,
          weight: 2,
          dashArray: '6, 6'
        });

        circle.bindPopup(`
          <div style="font-family: monospace; font-size: 11px;">
            <b style="color: #EF4444;">HAZARD: ${hazard.name}</b><br/>
            <b>Threat:</b> ${hazard.threat_class} (${hazard.severity})<br/>
            <b>Caution Radius:</b> ${hazard.caution_radius_m}m<br/>
            <p style="margin-top: 4px; color: #D1D5DB;">${hazard.incident_history}</p>
            <div style="color: #F87171; font-weight: bold; margin-top: 4px;">Protocol: ${hazard.astronaut_protocol}</div>
          </div>
        `);

        circle.on('click', () => {
          onSelectHazard(hazard);
        });

        circle.addTo(group);

        // Center Danger Pin
        const hazardIcon = L.divIcon({
          className: 'hazard-icon',
          html: `
            <div style="background-color: #EF4444; color: white; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 1.5px solid white;">!</div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        const hazardMarker = L.marker(center, { icon: hazardIcon });
        hazardMarker.addTo(group);
      });
    }

    // 6. Draw Three Forks Sample Cache Depot Marker
    if (showDepot) {
      const depotCenter: [number, number] = [
        threeForksDepot.center_coordinates.lat,
        normLon(threeForksDepot.center_coordinates.lon)
      ];

      const depotIcon = L.divIcon({
        className: 'depot-marker',
        html: `
          <div style="background-color: #10B981; width: 16px; height: 16px; border-radius: 3px; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px #10B981;">
            <span style="font-size: 9px; color: black; font-weight: bold;">10</span>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const depotMarker = L.marker(depotCenter, { icon: depotIcon });
      depotMarker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px;">
          <b style="color: #10B981;">${threeForksDepot.depot_name}</b><br/>
          <b>Total Samples:</b> 10 Sealed Titanium Core Tubes<br/>
          <b>Location:</b> ${threeForksDepot.center_coordinates.lat.toFixed(4)}°N, ${threeForksDepot.center_coordinates.lon.toFixed(4)}°E<br/>
          <p style="margin-top: 4px; color: #D1D5DB;">First off-world sample cache for NASA/ESA Mars Sample Return & Human Retrieval.</p>
        </div>
      `);
      depotMarker.addTo(group);
    }
  }, [
    activeMission,
    selectedSol,
    showAllRovers,
    showIngenuity,
    showHazards,
    showCautionPolygons,
    showDepot,
    onSelectWaypoint,
    onSelectHazard,
    onSelectMission
  ]);

  // Render EVA Waypoints Layer
  useEffect(() => {
    if (!mapRef.current || !evaLayerGroupRef.current) return;
    const group = evaLayerGroupRef.current;
    group.clearLayers();

    if (evaWaypoints.length === 0) return;

    const normLon = (lon: number) => (lon > 180 ? lon - 360 : lon);
    const coords: [number, number][] = evaWaypoints.map(w => [w.lat, normLon(w.lon)]);

    // Draw planned route polyline
    if (coords.length > 1) {
      const line = L.polyline(coords, {
        color: '#F59E0B',
        weight: 3,
        dashArray: '8, 6',
        opacity: 0.95
      });
      line.addTo(group);
    }

    // Draw EVA waypoint pins
    evaWaypoints.forEach((wp, idx) => {
      const icon = L.divIcon({
        className: 'eva-pin',
        html: `
          <div style="background-color: #F59E0B; color: #000; width: 18px; height: 18px; border-radius: 50%; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; border: 2px solid #FFF; box-shadow: 0 0 8px #F59E0B;">
            ${idx + 1}
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      const marker = L.marker([wp.lat, normLon(wp.lon)], { icon });
      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px;">
          <b style="color: #F59E0B;">${wp.name}</b><br/>
          Coords: ${wp.lat.toFixed(4)}°N, ${wp.lon.toFixed(4)}°E<br/>
          ${wp.notes || ''}
        </div>
      `);
      marker.addTo(group);
    });
  }, [evaWaypoints]);

  return (
    <div className="relative w-full h-full bg-[#0A0C10] overflow-hidden select-none">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top-Right: Sleek Collapsible Layer Controls Panel */}
      <div className="absolute top-4 right-4 z-10 font-mono text-xs">
        {!isLayersOpen ? (
          <button
            onClick={() => setIsLayersOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#090C12]/90 hover:bg-[#121622] border border-white/15 text-zinc-200 backdrop-blur-xl shadow-2xl transition-all group"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="font-semibold text-[11px] tracking-wide">LAYERS & OVERLAYS</span>
          </button>
        ) : (
          <div className="w-72 bg-[#090C12]/95 backdrop-blur-2xl p-3.5 rounded-2xl border border-white/15 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                NASA SATELLITE BASEMAPS
              </div>
              <button
                onClick={() => setIsLayersOpen(false)}
                className="text-zinc-400 hover:text-white text-[10px] px-1.5 py-0.5 rounded hover:bg-white/[0.08]"
              >
                ✕
              </button>
            </div>

            {/* WMTS Satellite Basemap Switcher */}
            <div className="space-y-1.5">
              {satelliteLayers.map(layer => {
                const isSelected = activeLayerId === layer.id;
                return (
                  <div
                    key={layer.id}
                    onClick={() => switchSatelliteLayer(layer.id)}
                    className={`p-2 rounded-xl text-[11px] transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-white/[0.08] text-white border-cyan-400/80 shadow-md'
                        : 'bg-white/[0.02] text-zinc-300 border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{layer.layer_name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono">
                        {layer.resolution}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                      {layer.description}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature Toggles */}
            <div className="pt-2.5 border-t border-white/[0.08] space-y-2 text-[11px]">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center">
                <Eye className="w-3 h-3 mr-1.5 text-purple-400" />
                VECTOR OVERLAYS
              </div>

              <label className="flex items-center space-x-2 text-zinc-300 hover:text-white cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={showAllRovers}
                  onChange={e => setShowAllRovers(e.target.checked)}
                  className="accent-[#E25B38] rounded"
                />
                <span>All 5 Rover Traverses</span>
              </label>

              <label className="flex items-center space-x-2 text-zinc-300 hover:text-cyan-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={showIngenuity}
                  onChange={e => setShowIngenuity(e.target.checked)}
                  className="accent-cyan-400 rounded"
                />
                <span className="flex items-center space-x-1">
                  <Plane className="w-3 h-3 text-cyan-400" />
                  <span>Ingenuity (72 Flights)</span>
                </span>
              </label>

              <label className="flex items-center space-x-2 text-zinc-300 hover:text-red-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={showHazards}
                  onChange={e => setShowHazards(e.target.checked)}
                  className="accent-red-500 rounded"
                />
                <span className="text-red-400 font-medium">Hazard Exclusion Rings</span>
              </label>

              <label className="flex items-center space-x-2 text-zinc-300 hover:text-red-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={showCautionPolygons}
                  onChange={e => setShowCautionPolygons(e.target.checked)}
                  className="accent-red-400 rounded"
                />
                <span className="text-red-300">Caution Zones Polygons</span>
              </label>

              <label className="flex items-center space-x-2 text-zinc-300 hover:text-emerald-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={showDepot}
                  onChange={e => setShowDepot(e.target.checked)}
                  className="accent-emerald-500 rounded"
                />
                <span className="text-emerald-400 font-medium">Three Forks Sample Depot</span>
              </label>
            </div>
          </div>
        )}

        {/* EVA Active Drawing Indicator */}
        {isEVAPlanning && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/60 text-amber-200 text-[11px] flex items-center space-x-2 shadow-xl animate-pulse backdrop-blur-md">
            <Compass className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>EVA PLACEMENT ACTIVE: Click terrain to drop route pins</span>
          </div>
        )}
      </div>

      {/* Bottom Floating Tactical Status & Coordinate Bar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-3 px-4 py-2 rounded-full bg-[#080B10]/90 border border-white/10 backdrop-blur-xl shadow-2xl text-[11px] font-mono text-zinc-400 pointer-events-none">
        {cursorCoords && (
          <>
            <span className="text-zinc-200 font-semibold">
              LAT: {cursorCoords.lat.toFixed(4)}°N
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-200 font-semibold">
              LON: {cursorCoords.lon.toFixed(4)}°E
            </span>
            <span className="text-zinc-600">•</span>
          </>
        )}
        <span className="flex items-center space-x-1.5 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>ROVER</span>
        </span>
        <span className="flex items-center space-x-1.5 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span>LANDER</span>
        </span>
        <span className="flex items-center space-x-1.5 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span>HAZARD</span>
        </span>
        <span className="flex items-center space-x-1.5 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>DEPOT</span>
        </span>
      </div>
    </div>
  );
};
