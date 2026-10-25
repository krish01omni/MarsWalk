export interface Coordinates {
  lat: number;
  lon: number;
  elev_m?: number;
}

export interface RoverWaypoint {
  sol: number;
  site?: number;
  drive?: number;
  lat: number;
  lon: number;
  elev_m: number;
  dist_m: number;
  heading_deg?: number;
  target_name: string;
  activity: string;
  hazard_warning?: string | null;
}

export interface RoverTraverseData {
  mission: string;
  rover: string;
  landing_site: {
    name: string;
    crater?: string;
    region?: string;
    latitude: number;
    longitude: number;
    elevation_m: number;
    landing_sol: number;
    earth_date: string;
  };
  current_status: {
    sol: number;
    total_odometer_km: number;
    active: boolean;
    current_region?: string;
    end_date?: string;
    final_resting_site?: string;
    cause_of_end?: string;
    historic_feat?: string;
    samples_collected?: number;
    samples_cached_at_depot?: number;
    core_capacity?: number;
    samples_drilled?: number;
    wheel_condition?: string;
  };
  traverse_summary: {
    target_destination: string;
    key_milestones: string[];
  };
  waypoints: RoverWaypoint[];
}

export interface IngenuityFlight {
  flight: number;
  sol: number;
  date: string;
  airfield_origin: string;
  airfield_dest: string;
  duration_sec: number;
  max_alt_m: number;
  dist_m: number;
  notes: string;
}

export interface IngenuityData {
  craft: string;
  total_flights: number;
  mission_status: string;
  total_air_time_minutes: number;
  total_distance_km: number;
  max_altitude_m: number;
  max_groundspeed_mps: number;
  key_airfields: Array<{
    name: string;
    lat: number;
    lon: number;
    elev_m: number;
    flights_hosted: number[];
  }>;
  milestone_flights: IngenuityFlight[];
}

export interface LanderSiteData {
  mission: string;
  craft_type: string;
  landing_site: {
    name: string;
    region: string;
    latitude: number;
    longitude: number;
    elevation_m: number;
    landing_sol: number;
    earth_date: string;
  };
  operational_record: {
    duration_sols: number;
    end_date: string;
    cause_of_end: string;
    historic_feat: string;
  };
  science_instruments: string[];
  historic_discoveries: Array<{
    experiment?: string;
    phenomenon?: string;
    discovery?: string;
    finding?: string;
    details?: string;
    significance?: string;
    status?: string;
  }>;
  astronaut_tactical_note: string;
}

export interface ClassifiedHazard {
  id: string;
  name: string;
  region: string;
  threat_class: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  coordinates: {
    lat: number;
    lon: number;
    elev_m: number;
  };
  caution_radius_m: number;
  incident_history: string;
  terrain_mechanism: string;
  astronaut_protocol: string;
  detection_signature: string;
}

export interface SampleTube {
  tube_index: number;
  tube_serial: string;
  sample_name: string;
  sol_dropped: number;
  drop_date: string;
  rock_type: string;
  formation: string;
  core_length_mm: number;
  coordinates: {
    lat: number;
    lon: number;
    elev_m: number;
  };
  scientific_value: string;
}

export interface ThreeForksDepotData {
  depot_name: string;
  region: string;
  mission: string;
  depot_status: string;
  purpose: string;
  center_coordinates: {
    lat: number;
    lon: number;
    elev_m: number;
  };
  tubes: SampleTube[];
}

export interface OrganicDiscovery {
  id: string;
  discovery_name: string;
  location: string;
  mission: string;
  coordinates: Coordinates;
  instrument: string;
  sol_detected: number;
  molecules_detected: string[];
  geological_context: string;
  biosignature_significance: string;
}

export interface WaterIceDeposit {
  id: string;
  name: string;
  region: string;
  mission: string;
  coordinates: Coordinates;
  depth_cm: number;
  purity_pct: number;
  estimated_thickness_m?: number;
  estimated_volume_km3?: number;
  discovery_summary: string;
  astronaut_in_situ_resource_utilization: string;
}

export interface HydrothermalMineral {
  id: string;
  mineral_system: string;
  site: string;
  mission: string;
  coordinates: Coordinates;
  discovery_story: string;
  geological_significance: string;
}

export interface SatelliteLayerMeta {
  id: string;
  satellite: string;
  instrument: string;
  layer_name: string;
  resolution: string;
  coverage: string;
  description: string;
  nasa_trek_wmts: string;
  nasa_trek_wms: string;
  esri_wmts?: string;
  max_native_zoom?: number;
  format?: string;
}

export interface OrbiterMissionData {
  id: string;
  name: string;
  agency: string;
  launch_date: string;
  arrival_date: string;
  status: 'ACTIVE' | 'COMPLETED';
  orbital_altitude_km: string;
  purpose_and_objectives: string;
  key_instruments: Array<{
    name: string;
    acronym: string;
    description: string;
  }>;
  major_discoveries: string[];
  astronaut_relevance: string;
  satellite_layer_id?: string;
  imagery_url?: string;
}

export interface EVAPlannedWaypoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  notes?: string;
}

export interface EVARouteAnalysis {
  waypoints: EVAPlannedWaypoint[];
  totalDistanceKm: number;
  estimatedWalkingHours: number;
  estimatedRoverHours: number;
  hazardsEncountered: Array<{
    hazard: ClassifiedHazard;
    distanceKm: number;
  }>;
  safetyScore: number; // 0 to 100
  riskSummary: string;
}
