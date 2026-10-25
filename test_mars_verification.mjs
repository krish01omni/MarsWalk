import fs from 'fs';
import path from 'path';

console.log('========================================================');
console.log('   ARES MARS COMPREHENSIVE DATA & MISSION AUDIT SUITE   ');
console.log('========================================================\n');

const dataDir = './data';
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

// 1. Rover Datasets Test
const rovers = ['perseverance', 'curiosity', 'opportunity', 'spirit', 'sojourner'];
for (const r of rovers) {
  const filePath = path.join(dataDir, 'rovers', `${r}_traverse.json`);
  assert(fs.existsSync(filePath), `Rover dataset exists: ${r}_traverse.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  assert(data.landing_site && Math.abs(data.landing_site.latitude) <= 90, `${r} landing latitude valid (-90 to 90)`);
  assert(data.waypoints && data.waypoints.length > 0, `${r} has ${data.waypoints?.length} waypoints`);
  assert(data.current_status.total_odometer_km > 0, `${r} odometer recorded (${data.current_status.total_odometer_km} km)`);
}

// Ingenuity Helicopter Flights
const ingFile = path.join(dataDir, 'rovers', 'ingenuity_flights.json');
assert(fs.existsSync(ingFile), 'Ingenuity flight dataset exists');
const ingData = JSON.parse(fs.readFileSync(ingFile, 'utf-8'));
assert(ingData.total_flights === 72, `Ingenuity has all 72 flights (Found: ${ingData.total_flights})`);
assert(ingData.key_airfields.length >= 5, `Ingenuity has key airfields recorded (${ingData.key_airfields.length} airfields)`);
assert(ingData.total_distance_km === 17.0, `Ingenuity distance recorded: ${ingData.total_distance_km} km`);

// 2. Landers
const landers = ['viking1', 'viking2', 'phoenix', 'insight'];
for (const l of landers) {
  const filePath = path.join(dataDir, 'landers', `${l}_site.json`);
  assert(fs.existsSync(filePath), `Lander dataset exists: ${l}_site.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  assert(data.landing_site && Math.abs(data.landing_site.latitude) <= 90, `${l} coordinates valid`);
  assert(data.historic_discoveries && data.historic_discoveries.length > 0, `${l} discoveries documented`);
  assert(data.science_instruments && data.science_instruments.length > 0, `${l} science instruments documented`);
  assert(data.astronaut_tactical_note && data.astronaut_tactical_note.length > 20, `${l} astronaut tactical note recorded`);
}

// 3. Hazards Registry (All 7 hazards)
const hazFile = path.join(dataDir, 'hazards', 'classified_hazards.json');
assert(fs.existsSync(hazFile), 'Classified hazards file exists');
const hazData = JSON.parse(fs.readFileSync(hazFile, 'utf-8'));
assert(hazData.hazards_registry.length === 7, `All 7 classified hazards registered (Found: ${hazData.hazards_registry.length})`);
hazData.hazards_registry.forEach(h => {
  assert(h.caution_radius_m > 0, `Hazard ${h.name} has caution radius: ${h.caution_radius_m}m`);
  assert(h.astronaut_protocol && h.astronaut_protocol.length > 10, `Hazard ${h.name} has protocol`);
  assert(h.terrain_mechanism && h.terrain_mechanism.length > 10, `Hazard ${h.name} has physical terrain mechanism`);
});

// Caution Zones GeoJSON (All 7 buffer polygons including Cerberus Fossae)
const zonesFile = path.join(dataDir, 'hazards', 'caution_zones.json');
assert(fs.existsSync(zonesFile), 'Caution zones GeoJSON exists');
const zonesData = JSON.parse(fs.readFileSync(zonesFile, 'utf-8'));
assert(zonesData.features.length === 7, `Caution zones contains all 7 polygon features (Found: ${zonesData.features.length})`);
const zoneIds = zonesData.features.map(f => f.properties.hazard_id);
assert(zoneIds.includes('HAZ-007'), 'Caution zones contains Cerberus Fossae (HAZ-007) polygon');

// 4. Discoveries: Three Forks 10 Tubes
const tfFile = path.join(dataDir, 'discoveries', 'three_forks_samples.json');
assert(fs.existsSync(tfFile), 'Three Forks sample depot file exists');
const tfData = JSON.parse(fs.readFileSync(tfFile, 'utf-8'));
assert(tfData.tubes.length === 10, `Three Forks has exactly 10 cached tubes (Found: ${tfData.tubes.length})`);
tfData.tubes.forEach(t => {
  assert(t.tube_serial && t.sample_name && t.rock_type, `Tube #${t.tube_index} valid: ${t.tube_serial} (${t.sample_name})`);
});

// Organics, Water Ice, Hydrothermal Minerals
const orgFile = path.join(dataDir, 'discoveries', 'organics_biosignatures.json');
assert(fs.existsSync(orgFile), 'Organics and biosignatures catalog exists');
const iceFile = path.join(dataDir, 'discoveries', 'water_ice_deposits.json');
assert(fs.existsSync(iceFile), 'Water ice catalog exists');
const hydroFile = path.join(dataDir, 'discoveries', 'hydrothermal_minerals.json');
assert(fs.existsSync(hydroFile), 'Hydrothermal minerals catalog exists');

// 5. Satellites Metadata & Verified Tile Formats
const satFile = path.join(dataDir, 'satellites', 'orbital_layers_meta.json');
assert(fs.existsSync(satFile), 'Orbital layers meta exists');
const satData = JSON.parse(fs.readFileSync(satFile, 'utf-8'));
assert(satData.satellites.length >= 4, `Satellite layers recorded: ${satData.satellites.length}`);
const themis = satData.satellites.find(s => s.id === 'ODYSSEY_THEMIS_NIGHTIR');
assert(themis && themis.nasa_trek_wmts.endsWith('.png'), 'THEMIS Night IR WMTS URL correctly ends with .png format');
assert(themis && themis.max_native_zoom === 9, 'THEMIS Night IR has max_native_zoom: 9');

const ctx = satData.satellites.find(s => s.id === 'MRO_JEZERO_CTX');
assert(ctx && ctx.nasa_trek_wmts.includes('JEZ_ctx'), 'MRO Jezero CTX Mosaic URL is verified');
assert(ctx && ctx.max_native_zoom === 13, 'MRO Jezero CTX has max_native_zoom: 13');

// 6. Graph Memory Completeness
const gmFile = path.join(dataDir, 'graph_memory.json');
assert(fs.existsSync(gmFile), 'Graph memory file exists');
const gmData = JSON.parse(fs.readFileSync(gmFile, 'utf-8'));
assert(gmData.nodes.length >= 21, `Graph memory has complete nodes (Found: ${gmData.nodes.length})`);
assert(gmData.edges.length >= 13, `Graph memory has complete edges (Found: ${gmData.edges.length})`);
const nodeIds = gmData.nodes.map(n => n.id);
assert(nodeIds.includes('HAZARD-CERBERUS-FOSSAE'), 'Graph memory tracks Cerberus Fossae');
assert(nodeIds.includes('CRAFT-INGENUITY'), 'Graph memory tracks Ingenuity helicopter');
assert(nodeIds.includes('DISCOVERY-HYDROTHERMAL'), 'Graph memory tracks hydrothermal minerals');

// 7. Mars Geodesic Distance Verification
const R_MARS = 3389.5;
function marsDist(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R_MARS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 1 degree at equator on Mars = 2 * PI * 3389.5 / 360 = 59.158 km
const deg1 = marsDist(0, 0, 0, 1);
assert(Math.abs(deg1 - 59.158) < 0.1, `Mars equatorial 1-degree geodesic test: ${deg1.toFixed(3)} km (expected ~59.158 km)`);

// North Pole to South Pole = PI * 3389.5 = 10648.118 km
const poleToPole = marsDist(90, 0, -90, 0);
assert(Math.abs(poleToPole - 10648.118) < 0.5, `Mars pole-to-pole geodesic test: ${poleToPole.toFixed(3)} km (expected ~10648.118 km)`);

// 8. EVA Route Analysis - Segment Hazard Interception Engine Test (Reviewer Edge Case)
function evaluateEVARouteTest(waypoints, classifiedHazards) {
  if (waypoints.length < 2) return { safetyScore: 100, hazardsEncountered: [] };

  let totalDistKm = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistKm += marsDist(waypoints[i].lat, waypoints[i].lon, waypoints[i + 1].lat, waypoints[i + 1].lon);
  }

  const hazardsEncountered = [];
  for (const hazard of classifiedHazards) {
    let minDistanceToHazard = Infinity;
    // Check waypoints
    for (const wp of waypoints) {
      const d = marsDist(wp.lat, wp.lon, hazard.coordinates.lat, hazard.coordinates.lon);
      if (d < minDistanceToHazard) minDistanceToHazard = d;
    }
    // Check segment samples
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const segLen = marsDist(p1.lat, p1.lon, p2.lat, p2.lon);
      const numSamples = Math.max(20, Math.ceil(segLen / 0.05));
      for (let s = 1; s < numSamples; s++) {
        const t = s / numSamples;
        const lat = p1.lat + t * (p2.lat - p1.lat);
        const lon = p1.lon + t * (p2.lon - p1.lon);
        const d = marsDist(lat, lon, hazard.coordinates.lat, hazard.coordinates.lon);
        if (d < minDistanceToHazard) minDistanceToHazard = d;
      }
    }

    const cautionRadiusKm = hazard.caution_radius_m / 1000;
    if (minDistanceToHazard <= cautionRadiusKm * 3 + 2.0) {
      hazardsEncountered.push({
        hazard,
        distanceKm: Math.round(minDistanceToHazard * 100) / 100
      });
    }
  }

  let safetyScore = 100;
  for (const h of hazardsEncountered) {
    const radiusKm = h.hazard.caution_radius_m / 1000;
    if (h.distanceKm <= radiusKm) {
      safetyScore -= h.hazard.severity === 'CRITICAL' ? 70 : 45;
    } else {
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

  return { totalDistKm, hazardsEncountered, safetyScore, riskSummary };
}

// Test A: Segment intersecting Troy Sand Trap (-14.6085°S, 175.5265°E) with endpoints placed outside buffer
const crossTroyWaypoints = [
  { id: 'W1', lat: -14.50, lon: 175.5265 },
  { id: 'W2', lat: -14.70, lon: 175.5265 }
];
const troyResult = evaluateEVARouteTest(crossTroyWaypoints, hazData.hazards_registry);
assert(troyResult.hazardsEncountered.length > 0, 'Cross-hazard segment detected Troy Sand Trap along path');
assert(troyResult.hazardsEncountered[0]?.distanceKm <= 0.05, `Segment passes through center of Troy (${troyResult.hazardsEncountered[0]?.distanceKm} km from hazard center)`);
assert(troyResult.safetyScore <= 30, `Safety score dropped to danger level (${troyResult.safetyScore} / 100)`);
assert(troyResult.riskSummary.includes('CRITICAL DANGER'), 'Triggers CRITICAL DANGER alert summary');

// Test B1: Pristine clear traversal route in Chryse Planitia (100/100 score)
const clearChryseWaypoints = [
  { id: 'C1', lat: 22.4800, lon: 47.9500 },
  { id: 'C2', lat: 22.4900, lon: 47.9600 }
];
const clearResult = evaluateEVARouteTest(clearChryseWaypoints, hazData.hazards_registry);
assert(clearResult.safetyScore === 100, `Clear corridor achieves 100/100 safety score (Found: ${clearResult.safetyScore})`);
assert(clearResult.riskSummary.includes('Optimal clear corridor'), 'Safe corridor confirmed by risk evaluator');
assert(clearResult.hazardsEncountered.length === 0, 'No hazards encountered along Chryse corridor');

// Test B2: Jezero Delta route within 3.8 km warning buffer of South Séítah
const jezeroDeltaWaypoints = [
  { id: 'S1', lat: 18.4520, lon: 77.4095 },
  { id: 'S2', lat: 18.4545, lon: 77.4077 }
];
const deltaResult = evaluateEVARouteTest(jezeroDeltaWaypoints, hazData.hazards_registry);
assert(deltaResult.safetyScore === 85, `Delta corridor correctly assesses outer buffer caution with score 85 (Found: ${deltaResult.safetyScore})`);
assert(deltaResult.hazardsEncountered.some(h => h.hazard.id === 'HAZ-003'), 'South Séítah detected in proximity buffer');
assert(deltaResult.riskSummary.includes('ADVISORY'), 'Advisory warning issued for Séítah buffer');

// 9. Telemetry Search Engine Indexing Test
function searchIndexTest(query) {
  const q = query.toLowerCase().trim();
  const results = [];
  for (const t of tfData.tubes) {
    if (t.sample_name.toLowerCase().includes(q) || t.rock_type.toLowerCase().includes(q)) {
      results.push(t.sample_name);
    }
  }
  for (const h of hazData.hazards_registry) {
    if (h.name.toLowerCase().includes(q) || h.threat_class.toLowerCase().includes(q)) {
      results.push(h.name);
    }
  }
  if (q.includes('ingenuity') || q.includes('helicopter')) {
    results.push(ingData.craft);
  }
  return results;
}

assert(searchIndexTest('Amalik').length > 0, 'Search index matches Three Forks tube Amalik');
assert(searchIndexTest('Troy').length > 0, 'Search index matches Troy Sand Trap');
assert(searchIndexTest('Ingenuity').length > 0, 'Search index matches Ingenuity helicopter');

console.log(`\n========================================================`);
console.log(`AUDIT COMPLETE: ${testsPassed} Passed, ${testsFailed} Failed`);
console.log(`========================================================`);

if (testsFailed > 0) process.exit(1);
