import perseveranceRaw from '../../data/rovers/perseverance_traverse.json';
import ingenuityRaw from '../../data/rovers/ingenuity_flights.json';
import curiosityRaw from '../../data/rovers/curiosity_traverse.json';
import opportunityRaw from '../../data/rovers/opportunity_traverse.json';
import spiritRaw from '../../data/rovers/spirit_traverse.json';
import sojournerRaw from '../../data/rovers/sojourner_traverse.json';

import viking1Raw from '../../data/landers/viking1_site.json';
import viking2Raw from '../../data/landers/viking2_site.json';
import phoenixRaw from '../../data/landers/phoenix_site.json';
import insightRaw from '../../data/landers/insight_site.json';

import hazardsRaw from '../../data/hazards/classified_hazards.json';
import cautionZonesRaw from '../../data/hazards/caution_zones.json';

import threeForksRaw from '../../data/discoveries/three_forks_samples.json';
import organicsRaw from '../../data/discoveries/organics_biosignatures.json';
import waterIceRaw from '../../data/discoveries/water_ice_deposits.json';
import hydrothermalRaw from '../../data/discoveries/hydrothermal_minerals.json';

import satellitesRaw from '../../data/satellites/orbital_layers_meta.json';
import graphMemoryRaw from '../../data/graph_memory.json';

import type {
  RoverTraverseData,
  IngenuityData,
  LanderSiteData,
  ClassifiedHazard,
  ThreeForksDepotData,
  OrganicDiscovery,
  WaterIceDeposit,
  HydrothermalMineral,
  SatelliteLayerMeta,
  OrbiterMissionData,
  EVAPlannedWaypoint,
  EVARouteAnalysis
} from '../types/mission';
import type { GraphMemoryData } from '../types/memory';

export const perseveranceData = perseveranceRaw as unknown as RoverTraverseData;
export const ingenuityData = ingenuityRaw as unknown as IngenuityData;
export const curiosityData = curiosityRaw as unknown as RoverTraverseData;
export const opportunityData = opportunityRaw as unknown as RoverTraverseData;
export const spiritData = spiritRaw as unknown as RoverTraverseData;
export const sojournerData = sojournerRaw as unknown as RoverTraverseData;

export const viking1Data = viking1Raw as unknown as LanderSiteData;
export const viking2Data = viking2Raw as unknown as LanderSiteData;
export const phoenixData = phoenixRaw as unknown as LanderSiteData;
export const insightData = insightRaw as unknown as LanderSiteData;

export const classifiedHazards = (hazardsRaw as { hazards_registry: ClassifiedHazard[] }).hazards_registry;
export const cautionZonesGeoJSON = cautionZonesRaw;

export const threeForksDepot = threeForksRaw as unknown as ThreeForksDepotData;
export const organicsCatalog = (organicsRaw as { catalog: OrganicDiscovery[] }).catalog;
export const waterIceCatalog = (waterIceRaw as { catalog: WaterIceDeposit[] }).catalog;
export const hydrothermalCatalog = (hydrothermalRaw as { catalog: HydrothermalMineral[] }).catalog;

export const satelliteLayers = (satellitesRaw as { satellites: SatelliteLayerMeta[] }).satellites;
export const graphMemory = graphMemoryRaw as unknown as GraphMemoryData;

export const allRoverTraverses: Record<string, RoverTraverseData> = {
  perseverance: perseveranceData,
  curiosity: curiosityData,
  opportunity: opportunityData,
  spirit: spiritData,
  sojourner: sojournerData
};

export const allLanders: Record<string, LanderSiteData> = {
  viking1: viking1Data,
  viking2: viking2Data,
  phoenix: phoenixData,
  insight: insightData
};

export const allSatelliteMissions: Record<string, OrbiterMissionData> = {
  mro: {
    id: 'mro',
    name: 'Mars Reconnaissance Orbiter (MRO)',
    agency: 'NASA / JPL',
    launch_date: 'August 12, 2005',
    arrival_date: 'March 10, 2006',
    status: 'ACTIVE',
    orbital_altitude_km: '250 - 320 km (Sun-Synchronous Polar)',
    purpose_and_objectives: 'Conduct ultra-high-resolution visible, hyperspectral, and radar reconnaissance of Mars to uncover the history of surface water, search for habitable paleo-environments, sound subsurface glacial ice, and identify safe landing sites for rovers and future human expeditions.',
    key_instruments: [
      {
        name: 'High Resolution Imaging Science Experiment',
        acronym: 'HiRISE',
        description: '0.25 - 0.5 meter/pixel telescope camera capable of resolving individual rover tracks, meter-scale boulders, and active avalanche chutes.'
      },
      {
        name: 'Compact Reconnaissance Imaging Spectrometer for Mars',
        acronym: 'CRISM',
        description: 'Visible and infrared spectrometer (0.36 - 3.92 µm) that detected phyllosilicates (clays), hydrated sulfates, and carbonates in Jezero and Gale craters.'
      },
      {
        name: 'Shallow Subsurface Radar',
        acronym: 'SHARAD',
        description: '15-25 MHz sounding radar penetrating up to 1,000 meters beneath the martian crust, discovering massive subsurface debris-covered glaciers.'
      },
      {
        name: 'Context Camera',
        acronym: 'CTX',
        description: '6 meter/pixel grayscale orbital mosaic camera providing regional geological context for rover traverses.'
      }
    ],
    major_discoveries: [
      'Discovered Recurring Slope Lineae (RSL) seasonal dark streaks cascading down warm equatorial crater walls.',
      'Mapped massive buried glacial water ice sheets (Lobate Debris Aprons) in Deuteronilus Mensae and Utopia Planitia.',
      'Identified ancient deltaic lakebed clays and carbonates in Jezero Crater, securing it as the landing site for Perseverance.',
      'Tracked active CO2 frost sublimation geysers and spontaneous polar dune avalanches in real time.'
    ],
    astronaut_relevance: 'Essential for human EVA routing: resolves meter-scale landing hazards, identifies traversable slope ramps, and pinpoints shallow buried ice sheets for propellant In-Situ Resource Utilization (ISRU).',
    satellite_layer_id: 'MRO_JEZERO_CTX'
  },
  odyssey: {
    id: 'odyssey',
    name: '2001 Mars Odyssey',
    agency: 'NASA / JPL',
    launch_date: 'April 7, 2001',
    arrival_date: 'October 24, 2001',
    status: 'ACTIVE',
    orbital_altitude_km: '390 - 410 km (Circular Polar)',
    purpose_and_objectives: 'Perform global geochemical and thermal mapping to detect elemental distributions, surface thermal inertia, and water-equivalent hydrogen deposits across the entire planet.',
    key_instruments: [
      {
        name: 'Thermal Emission Imaging System',
        acronym: 'THEMIS',
        description: '9-band thermal infrared (100 m/px) and 5-band visible imager measuring surface thermal inertia and mineralogy.'
      },
      {
        name: 'Gamma Ray Spectrometer Suite',
        acronym: 'GRS / HEND',
        description: 'Measures epithermal neutron leakage to map hydrogen and bulk chemical abundance in the top 1 meter of regolith.'
      }
    ],
    major_discoveries: [
      'First confirmed detection of vast subsurface hydrogen/water-ice reserves locked in the top meter of martian circumpolar soil.',
      'Global thermal inertia maps distinguishing solid bedrock pavement from treacherous, loose fine-dust sand traps.',
      'Discovered exposed olivine-rich volcanic bedrock outcrops in Nili Fossae and Ganges Chasma.'
    ],
    astronaut_relevance: 'THEMIS nighttime infrared maps are the primary tool used by mission planners to avoid fatal rover entrapment in low-thermal-inertia sulfate sand traps like Spirit\'s Troy trap.',
    satellite_layer_id: 'ODYSSEY_THEMIS_NIGHTIR'
  },
  mgs: {
    id: 'mgs',
    name: 'Mars Global Surveyor (MGS)',
    agency: 'NASA / JPL',
    launch_date: 'November 7, 1996',
    arrival_date: 'September 12, 1997',
    status: 'COMPLETED',
    orbital_altitude_km: '378 km (Sun-Synchronous)',
    purpose_and_objectives: 'Establish the global topographic elevation datum of Mars, map surface geology and magnetism, and monitor global atmospheric dust and weather patterns over full seasonal cycles.',
    key_instruments: [
      {
        name: 'Mars Orbiter Laser Altimeter',
        acronym: 'MOLA',
        description: 'Precision laser altimeter that fired over 670 million laser pulses to construct the definitive 3D topography and areoid zero-elevation reference of Mars.'
      },
      {
        name: 'Mars Orbiter Camera',
        acronym: 'MOC',
        description: 'Wide-angle and narrow-angle imaging system that first revealed gullies, sedimentary layering, and active dust devils.'
      },
      {
        name: 'Thermal Emission Spectrometer',
        acronym: 'TES',
        description: 'Infrared spectrometer that mapped global volcanic basalt and discovered the hematite deposit at Meridiani Planum, selecting Opportunity\'s landing site.'
      }
    ],
    major_discoveries: [
      'Created the global MOLA topographic map measuring the 30 km elevation span between Hellas Basin (-8.2 km) and Olympus Mons (+21.2 km).',
      'Discovered remanent crustal magnetic striping, proving Mars once had an active core dynamo and global magnetic field.',
      'First detected active geological gullies suggesting recent fluid flows.'
    ],
    astronaut_relevance: 'MOLA defines the zero-elevation datum (areoid) used by all Mars descent engines, slope stability calculations, and EVA route incline planning.',
    satellite_layer_id: 'MGS_MOLA'
  },
  maven: {
    id: 'maven',
    name: 'MAVEN (Atmosphere & Volatile Evolution)',
    agency: 'NASA / LASP',
    launch_date: 'November 18, 2013',
    arrival_date: 'September 22, 2014',
    status: 'ACTIVE',
    orbital_altitude_km: '150 - 6,200 km (Elliptical Aeronomy Orbit)',
    purpose_and_objectives: 'Determine the history of the loss of Mars\' atmospheric gases (CO2, N2, H2O) to space caused by solar wind stripping, cosmic radiation, and photochemical escape.',
    key_instruments: [
      {
        name: 'Particles and Fields Package',
        acronym: 'SWEA / SWIA / MAG',
        description: 'Analyzes solar wind electrons, ion fluxes, and interplanetary magnetic field topology.'
      },
      {
        name: 'Imaging Ultraviolet Spectrograph',
        acronym: 'IUVS',
        description: 'Observes global upper-atmosphere hydrogen and oxygen corona loss and widespread martian auroras.'
      }
    ],
    major_discoveries: [
      'Measured martian atmospheric loss at ~100 grams per second, spiking 10- to 20-fold during coronal mass ejections (CMEs).',
      'Proved Mars lost over 0.5 bar of atmospheric CO2 to space, turning a once-warm and wet world into a frigid desert.',
      'Discovered widespread diffuse proton auroras covering the entire sunlit martian hemisphere.'
    ],
    astronaut_relevance: 'Real-time space weather sentinel: alerts human crews on Mars to incoming solar particle events (SPEs) and coronal radiation storms that require shelter in habitat radiation vaults.'
  },
  mars_express: {
    id: 'mars_express',
    name: 'Mars Express',
    agency: 'ESA (European Space Agency / NASA partner)',
    launch_date: 'June 2, 2003',
    arrival_date: 'December 25, 2003',
    status: 'ACTIVE',
    orbital_altitude_km: '300 - 10,100 km (Polar Elliptical)',
    purpose_and_objectives: 'Perform 3D full-color stereo imaging of surface landforms, probe the deep subsurface for water and ice reservoirs, and analyze the geochemical eras of martian history.',
    key_instruments: [
      {
        name: 'High Resolution Stereo Camera',
        acronym: 'HRSC',
        description: '10 meter/pixel full 3D stereo color camera mapping dramatic river valleys, ancient shorelines, and impact craters.'
      },
      {
        name: 'Subsurface Sounding Radar / Altimeter',
        acronym: 'MARSIS',
        description: 'Long-wavelength radar sounding up to 5 km depth into the martian ice caps and crust.'
      },
      {
        name: 'Visible and Infrared Mineralogical Mapping Spectrometer',
        acronym: 'OMEGA',
        description: 'Established the three martian geological eras: Phyllocian (wet/clay), Theiikian (acidic/sulfate), and Siderikian (dry/rust).'
      }
    ],
    major_discoveries: [
      'MARSIS radar detected prospective subglacial liquid water/brine lakes beneath the South Polar layered deposits.',
      'Discovered traces of localized atmospheric methane plumes in Valles Marineris and Syrtis Major.',
      'Mapped vast sheets of pure water ice exposed in the polar layered deposits.'
    ],
    astronaut_relevance: 'Identified deep subglacial radar anomalies and ancient canyon terraces offering structural stability for future subterranean lava-tube basecamps.'
  }
};

/**
 * Calculates Great-Circle Geodesic Distance on Mars sphere
 * Mars mean volumetric radius R = 3,389.5 km
 */
export function calculateMarsGeodesicDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3389.5; // Mars radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Evaluates an Astronaut EVA Route for distance, walking/rover duration, and hazard proximity.
 * Checks distance not just to discrete waypoints, but continuously along traversal segments.
 */
export function evaluateEVARoute(waypoints: EVAPlannedWaypoint[]): EVARouteAnalysis {
  if (waypoints.length < 2) {
    return {
      waypoints,
      totalDistanceKm: 0,
      estimatedWalkingHours: 0,
      estimatedRoverHours: 0,
      hazardsEncountered: [],
      safetyScore: 100,
      riskSummary: 'Route requires at least 2 waypoints.'
    };
  }

  let totalDistKm = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistKm += calculateMarsGeodesicDistanceKm(
      waypoints[i].lat,
      waypoints[i].lon,
      waypoints[i + 1].lat,
      waypoints[i + 1].lon
    );
  }

  // Astronaut walking speed in spacesuit: ~1.2 km/h
  // Pressurized rover travel speed: ~6.0 km/h
  const walkingHours = totalDistKm / 1.2;
  const roverHours = totalDistKm / 6.0;

  // Check proximity of any waypoint OR route segment to classified hazards
  const hazardsEncountered: Array<{ hazard: ClassifiedHazard; distanceKm: number }> = [];

  for (const hazard of classifiedHazards) {
    let minDistanceToHazard = Infinity;

    // 1. Check discrete waypoints
    for (const wp of waypoints) {
      const d = calculateMarsGeodesicDistanceKm(
        wp.lat,
        wp.lon,
        hazard.coordinates.lat,
        hazard.coordinates.lon
      );
      if (d < minDistanceToHazard) {
        minDistanceToHazard = d;
      }
    }

    // 2. Check intermediate geodesic points along each segment
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const segLen = calculateMarsGeodesicDistanceKm(p1.lat, p1.lon, p2.lat, p2.lon);
      // Sample every 50 meters along the segment
      const numSamples = Math.max(20, Math.ceil(segLen / 0.05));
      for (let s = 1; s < numSamples; s++) {
        const t = s / numSamples;
        const lat = p1.lat + t * (p2.lat - p1.lat);
        const lon = p1.lon + t * (p2.lon - p1.lon);
        const d = calculateMarsGeodesicDistanceKm(
          lat,
          lon,
          hazard.coordinates.lat,
          hazard.coordinates.lon
        );
        if (d < minDistanceToHazard) {
          minDistanceToHazard = d;
        }
      }
    }

    // If within caution radius or warning buffer zone
    const cautionRadiusKm = hazard.caution_radius_m / 1000;
    if (minDistanceToHazard <= cautionRadiusKm * 3 + 2.0) {
      hazardsEncountered.push({
        hazard,
        distanceKm: Math.round(minDistanceToHazard * 100) / 100
      });
    }
  }

  // Calculate safety score
  let safetyScore = 100;
  for (const h of hazardsEncountered) {
    const radiusKm = h.hazard.caution_radius_m / 1000;
    if (h.distanceKm <= radiusKm) {
      // Crossing inside exclusion zone: CRITICAL drops score below 40
      safetyScore -= h.hazard.severity === 'CRITICAL' ? 70 : 45;
    } else {
      // Approaching buffer zone
      safetyScore -= h.hazard.severity === 'CRITICAL' ? 15 : 10;
    }
  }
  safetyScore = Math.max(0, Math.min(100, safetyScore));

  let riskSummary = 'Optimal clear corridor. Safe for nominal EVA.';
  if (safetyScore < 40) {
    riskSummary = 'CRITICAL DANGER: Trajectory intersects fatal entrapment or biochemical exclusion zones!';
  } else if (safetyScore < 75) {
    riskSummary = 'CAUTION: Path approaches known sand dunes, ventifact puncture fields, or scarps. Exercise caution.';
  } else if (safetyScore < 100) {
    riskSummary = 'ADVISORY: Path approaches outer warning buffer of classified terrain hazards. Maintain optical scanning.';
  }

  return {
    waypoints,
    totalDistanceKm: Math.round(totalDistKm * 1000) / 1000,
    estimatedWalkingHours: Math.round(walkingHours * 10) / 10,
    estimatedRoverHours: Math.round(roverHours * 10) / 10,
    hazardsEncountered,
    safetyScore,
    riskSummary
  };
}

/**
 * Searches the Mars dataset across rovers, helicopter, landers, discoveries, and hazards
 */
export function queryMarsDataset(query: string): string {
  const q = query.toLowerCase().trim();
  if (!q) return 'No query provided.';

  const results: string[] = [];

  // Check Three Forks samples
  for (const tube of threeForksDepot.tubes) {
    if (
      tube.sample_name.toLowerCase().includes(q) ||
      tube.rock_type.toLowerCase().includes(q) ||
      tube.formation.toLowerCase().includes(q) ||
      tube.scientific_value.toLowerCase().includes(q)
    ) {
      results.push(`[Sample Tube #${tube.tube_index} - ${tube.sample_name}] Rock: ${tube.rock_type} (Sol ${tube.sol_dropped}). Loc: ${tube.coordinates.lat}°N, ${tube.coordinates.lon}°E. Value: ${tube.scientific_value}`);
    }
  }

  // Check hazards
  for (const h of classifiedHazards) {
    if (
      h.name.toLowerCase().includes(q) ||
      h.region.toLowerCase().includes(q) ||
      h.threat_class.toLowerCase().includes(q) ||
      h.incident_history.toLowerCase().includes(q) ||
      h.astronaut_protocol.toLowerCase().includes(q)
    ) {
      results.push(`[Hazard: ${h.name} (${h.severity})] Region: ${h.region}. Threat: ${h.threat_class}. Loc: ${h.coordinates.lat}, ${h.coordinates.lon}. Protocol: ${h.astronaut_protocol}`);
    }
  }

  // Check rovers
  for (const [_key, rover] of Object.entries(allRoverTraverses)) {
    if (
      rover.rover.toLowerCase().includes(q) ||
      rover.mission.toLowerCase().includes(q) ||
      (rover.landing_site.crater && rover.landing_site.crater.toLowerCase().includes(q))
    ) {
      results.push(`[Rover: ${rover.rover} (${rover.mission})] Landing: ${rover.landing_site.name} (${rover.landing_site.latitude}°N, ${rover.landing_site.longitude}°E). Total Distance: ${rover.current_status.total_odometer_km} km. Status: ${rover.current_status.active ? 'Active' : 'Completed'}`);
    }
    for (const wp of rover.waypoints) {
      if (
        wp.target_name.toLowerCase().includes(q) ||
        wp.activity.toLowerCase().includes(q) ||
        (wp.hazard_warning && wp.hazard_warning.toLowerCase().includes(q))
      ) {
        results.push(`[${rover.rover} Sol ${wp.sol} - ${wp.target_name}] Loc: ${wp.lat}, ${wp.lon} (Elev: ${wp.elev_m}m). Act: ${wp.activity}. ${wp.hazard_warning ? 'Warning: ' + wp.hazard_warning : ''}`);
      }
    }
  }

  // Check Ingenuity helicopter
  if (
    q.includes('ingenuity') ||
    q.includes('helicopter') ||
    q.includes('flight') ||
    q.includes('airfield')
  ) {
    results.push(`[Helicopter: ${ingenuityData.craft}] Completed: ${ingenuityData.total_flights} flights (${ingenuityData.total_distance_km} km, ${ingenuityData.total_air_time_minutes} min airtime). Status: ${ingenuityData.mission_status}. Airfields: ${ingenuityData.key_airfields.map(a => `${a.name} (${a.lat}°N, ${a.lon}°E)`).join('; ')}`);
  }

  // Check landers
  for (const [_key, lander] of Object.entries(allLanders)) {
    if (
      lander.mission.toLowerCase().includes(q) ||
      lander.landing_site.region.toLowerCase().includes(q) ||
      lander.astronaut_tactical_note.toLowerCase().includes(q)
    ) {
      results.push(`[Lander: ${lander.mission}] Loc: ${lander.landing_site.region} (${lander.landing_site.latitude}°N, ${lander.landing_site.longitude}°E). Note: ${lander.astronaut_tactical_note}`);
    }
  }

  // Check organics
  for (const o of organicsCatalog) {
    if (
      o.discovery_name.toLowerCase().includes(q) ||
      o.location.toLowerCase().includes(q) ||
      o.molecules_detected.some(m => m.toLowerCase().includes(q))
    ) {
      results.push(`[Biosignature/Organic: ${o.discovery_name}] Loc: ${o.location}. Molecules: ${o.molecules_detected.join(', ')}. Significance: ${o.biosignature_significance}`);
    }
  }

  // Check water ice
  for (const ice of waterIceCatalog) {
    if (
      ice.name.toLowerCase().includes(q) ||
      ice.region.toLowerCase().includes(q) ||
      ice.discovery_summary.toLowerCase().includes(q)
    ) {
      results.push(`[Water Ice Deposit: ${ice.name}] Region: ${ice.region} (Depth: ${ice.depth_cm}cm, Purity: ${ice.purity_pct}%). ISRU: ${ice.astronaut_in_situ_resource_utilization}`);
    }
  }

  // Check hydrothermal minerals
  for (const h of hydrothermalCatalog) {
    if (
      h.mineral_system.toLowerCase().includes(q) ||
      h.site.toLowerCase().includes(q) ||
      h.discovery_story.toLowerCase().includes(q) ||
      h.geological_significance.toLowerCase().includes(q)
    ) {
      results.push(`[Hydrothermal System: ${h.mineral_system}] Site: ${h.site} (${h.mission}). Significance: ${h.geological_significance}`);
    }
  }

  if (results.length === 0) {
    return `No direct telemetry matches found for '${query}'. Try searching for: Perseverance, Three Forks, Troy, Purgatory, Curiosity, Ingenuity, Ice, Methane, or Perchlorate.`;
  }

  return results.slice(0, 10).join('\n\n');
}
