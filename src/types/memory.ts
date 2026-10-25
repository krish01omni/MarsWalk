export interface GraphNode {
  id: string;
  type: 'RoverMission' | 'LanderMission' | 'HazardZone' | 'DiscoverySite' | 'Satellite';
  label: string;
  status?: string;
  landing_date?: string;
  end_date?: string;
  primary_site?: string;
  total_distance_km?: number;
  threat?: string;
  coordinates?: [number, number];
  buffer_radius_m?: number;
  contents?: string;
  core_attributes?: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

export interface MarsParameters {
  volumetric_mean_radius_km: number;
  equatorial_radius_km: number;
  polar_radius_km: number;
  surface_gravity_ms2: number;
  standard_sol_duration_sec: number;
  standard_sol_duration_earth_time: string;
  atmospheric_composition: Record<string, number>;
}

export interface GraphMemoryData {
  system: string;
  version: string;
  last_updated: string;
  mars_parameters: MarsParameters;
  nodes: GraphNode[];
  edges: GraphEdge[];
}
