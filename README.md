# MarsWalk // Planetary Route Atlas & Tactical Telemetry System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel_Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://mars-eta-ochre.vercel.app)
[![NASA PDS](https://img.shields.io/badge/NASA_PDS-Ground_Truth_Verified-0B3D91?style=for-the-badge&logo=nasa&logoColor=white)](https://pds.nasa.gov/)
[![React 19](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**MarsWalk** is an aerospace-grade planetary route explorer, multispectral GIS, and tactical surface telemetry console designed for space scientists, mission planners, and planetary exploration enthusiasts. Built with strict adherence to NASA human integration ergonomics (NASA-STD-3001) and dark-adapted avionics displays, it synthesizes decades of ground-truth NASA, ESA, and USGS mission data into an intuitive, non-cluttered digital atlas.

**Live Application:** [https://mars-eta-ochre.vercel.app](https://mars-eta-ochre.vercel.app)

---

## Key Subsystems & Capabilities

### 1. Google Maps-Style Multispectral Layer Engine
MarsWalk features an on-demand floating layer drawer directly on the map canvas, allowing users to toggle between different spectral wavelengths and altimetry data:
* 🌍 **Visible True-Color (Viking MDIM 2.1):** 232 meters/pixel calibrated global mosaic capturing the natural iron oxide surface albedo.
* 🌡️ **Thermal Infrared (2001 Mars Odyssey THEMIS):** 100 meters/pixel nocturnal thermal inertia imaging. Distinguishes solid, heat-retaining bedrock (bright) from treacherous, loose fine dust and sand traps (dark).
* 🏔️ **Laser Topography (MGS MOLA):** Precision laser altimeter elevation model color-coded from Hellas Basin ($-8,000\text{ m}$) to the summit of Olympus Mons ($+21,000\text{ m}$).
* 🔬 **Panchromatic Reconnaissance (MRO CTX):** 6 meters/pixel contextual orbital photography resolving meter-scale boulders, crater rims, and rover tracks.

### 2. Complete NASA Surface & Orbital Telemetry Ledger
Explore every historical and operational mission through dedicated, multi-tab dossiers:
* **Rovers:**
  * **Perseverance (Mars 2020):** $31.84\text{ km}$ driven across Jezero Crater western delta, Neretva Vallis breach channel, and crater rim margin.
  * **Curiosity (MSL):** $33.25\text{ km}$ traversed up Mount Sharp (Aeolis Mons), investigating clay-bearing and sulfate-bearing strata.
  * **Opportunity (MER-B):** $45.16\text{ km}$ marathon traverse across Meridiani Planum, discovering hematite "blueberries" and sulfate sandstones.
  * **Spirit (MER-A):** $7.73\text{ km}$ across Gusev Crater and Columbia Hills, identifying volcanic silica sinter hydrothermal vents.
  * **Sojourner (Pathfinder):** Historic 1997 surface exploration across the Ares Vallis catastrophic flood plains.
* **Aviation:**
  * **Ingenuity Mars Helicopter:** All 72 completed atmospheric flights, $17.0\text{ km}$ total flight distance, and airfield coordinates.
* **Orbital Reconnaissance:**
  * **Mars Reconnaissance Orbiter (MRO):** HiRISE, CRISM hyperspectral, and SHARAD shallow subsurface sounding radar.
  * **2001 Mars Odyssey:** THEMIS thermal emission camera and GRS/HEND gamma ray spectrometer.
  * **Mars Global Surveyor (MGS):** Global laser altimeter (MOLA) and Mars Orbiter Camera (MOC).
  * **MAVEN:** Upper atmosphere solar wind stripping and volatile evolution sensors.
  * **ESA Mars Express:** High-Resolution Stereo Camera (HRSC) and MARSIS subsurface radar.
* **Stationary Surface Laboratories:**
  * **Viking 1 & Viking 2 (1976):** Historic soil chemistry and biology test stations in Chryse and Utopia Planitia.
  * **Phoenix (2008):** Arctic soil trench excavation, discovering pure water ice and soil perchlorates at $68.2^\circ\text{N}$.
  * **InSight (2018–2022):** Ultra-sensitive SEIS seismometer recording 1,319 marsquakes and mapping the Martian crust, mantle, and liquid core.

### 3. Three Forks Sample Depot Registry
Inspect the complete inventory of the first off-world sample depot deployed by Perseverance at Three Forks (Jezero Crater):
* 10 hermetically sealed titanium core tubes (ignous cumulates, lacustrine delta mudstones, regolith, and ambient atmospheric witness blanks).
* Detailed rock formations, core lengths (in mm), sol dropped, and astrobiological significance.

### 4. Hazard Radar & Geodesic Exclusion Zones
* Real-time hazard warning radar based on historical rover entrapment incidents:
  * **Troy Sand Trap:** Sulfate sand drift that immobilized Spirit on Sol 1899.
  * **Purgatory Dune:** Transverse aeolian ridge that trapped Opportunity for 5 weeks.
  * **South Séítah:** Active ripple field with high wheel slip in Jezero Crater.
  * **Ventifact Ridges:** Sharp, wheel-puncturing basalt teeth on Mount Sharp.
  * **Circumpolar Perchlorates:** Soil toxic chemical hazards requiring suit wash protocols.
  * **Cerberus Fossae:** Tectonic fissure fault zone with active seismic activity.

### 5. Astronaut EVA Traversal Route Planner
* Interactive terrain path-finding tool calculating geodesic traversal distances across Mars mean spherical curvature ($R = 3,389.5\text{ km}$).
* Estimates suited walking time ($1.2\text{ km/h}$) and pressurized rover driving time ($6.0\text{ km/h}$).
* Evaluates proximity to classified hazard zones to output an automated route safety score ($0–100\text{ safety index}$).

### 6. Dual-Engine AI Planetary Subsystem ('Ares Copilot')
* **Online Mode:** Powered by Google Gemini API via serverless RAG, answering queries about rock formations, hazard avoidance protocols, and mission milestones.
* **Offline / Air-Gapped Mode:** Seamless toggle to connect directly to local quantized models (e.g. `qwen2.5:7b-instruct` served via Ollama or LM Studio) on expedition laptops without internet.
* **Zero-Dependency Local Fallback:** Automatically serves verified telemetry directly from local JSON archives if no API key is supplied.

---

## Architecture & Codebase Layout

```
MarsWalk/
├── data/                              # Verified NASA & ESA Planetary Data
│   ├── graph_memory.json              # Knowledge graph linking missions, hazards & samples
│   ├── rovers/                        # Sequential waypoints, odometer & mission logs
│   ├── landers/                       # Touchdown coordinates, seismology & science instruments
│   ├── hazards/                       # Classified hazards & GeoJSON exclusion polygons
│   ├── discoveries/                   # Three Forks sample depot & biosignature logs
│   └── satellites/                    # OGC WMTS orbital layer specifications
├── src/
│   ├── components/
│   │   ├── layout/                    # TacticalHeader (SpaceX-style minimal navigation)
│   │   ├── globe/                     # MarsGlobe3D (Three.js WebGL Martian sphere)
│   │   ├── map/                       # TacticalMap2D (Leaflet GIS with WMTS rasters)
│   │   ├── missions/                  # MissionHub & MissionSatelliteMap with layer drawer
│   │   ├── tools/                     # HazardRadar, EVAPlanner, DiscoveryCatalog, SpaceRefs
│   │   └── ai/                        # AresCopilotModal (Telemetry Query Console)
│   ├── services/                      # DataService, GraphMemoryService, AIService
│   └── types/                         # Strict TypeScript domain interfaces
├── setup_offline_qwen.bat             # 1-click local quantized model setup via Ollama
├── test_mars_verification.mjs         # 112-test automated empirical data audit suite
└── vercel.json                        # Single-Page-App edge routing config
```

---

## Quickstart & Local Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### 1. Clone the Repository
```bash
git clone https://github.com/krish01omni/MarsWalk.git
cd MarsWalk
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Optional: Configure Google Gemini API (Online AI Mode)
To use online generative queries with the Ares Copilot:
1. Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. Create a `.env` file in the project root (never committed to git):
   ```bash
   cp .env.example .env
   ```
3. Set your API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

### 5. Optional: Run 100% Offline with Local Qwen 2.5
To run completely air-gapped on Mars surface hardware or offline workstations:
1. Ensure [Ollama](https://ollama.com/) is installed.
2. Run the 1-click batch launcher:
   ```cmd
   setup_offline_qwen.bat
   ```
3. This downloads and runs `qwen2.5:7b-instruct` locally on `http://localhost:11434/v1`.
4. In MarsWalk, toggle the Copilot engine to **OFFLINE QWEN 2.5**.

---

## Empirical Verification & Testing Suite

MarsWalk includes an automated data verification suite that audits all coordinates, waypoints, geodesics, and hazard rings:

```bash
node test_mars_verification.mjs
```

**Verification Results:**
* `112 / 112 Tests Passed (0 Failures)`
* Verifies planetary radius curvature calculation ($R = 3,389.5\text{ km}$).
* Validates all 10 Three Forks sample tube records against NASA PDS archives.
* Asserts non-null hazard mechanisms, cautionary radii, and terrain entrapment histories.

---

## Primary Research & Data Citations

* **Viking MDIM 2.1:** USGS Astrogeology Science Center — [Global Color Mosaic Archive](https://astrogeology.usgs.gov/search/map/Mars/Viking/MDIM21)
* **THEMIS Nighttime Infrared:** Christensen et al., Arizona State University / NASA JPL — [THEMIS Investigation](https://themis.asu.edu/)
* **MOLA Laser Altimetry:** Smith et al., NASA Mars Global Surveyor — [PDS Geosciences Node](https://pds-geosciences.wustl.edu/missions/mgs/mola.html)
* **MRO Context Camera (CTX):** Malin et al., NASA Mars Reconnaissance Orbiter — [CTX Archive](https://mars.nasa.gov/mro/mission/instruments/ctx/)
* **Jezero Organic Carbon Detection:** Farley et al., *Nature* 619, 280–287 (2022) — [DOI: 10.1038/s41586-022-04984-7](https://www.nature.com/articles/s41586-022-04984-7)
* **Gale Crater Lacustrine Mudstones:** Grotzinger et al., *Science* 350, aac7575 (2015) — [DOI: 10.1126/science.aac7575](https://www.science.org/doi/10.1126/science.aac7575)
* **InSight Martian Core & Mantle Seismology:** Khan et al., *Science* 373, 434–438 (2021) — [DOI: 10.1126/science.abf8966](https://www.science.org/doi/10.1126/science.abf8966)

---

## Security & Sensitive Information Policy

MarsWalk is designed to protect sensitive credentials:
* No API keys, credentials, or personal tokens are tracked in this repository.
* The `.gitignore` strictly ignores all `.env`, `.env.local`, `*.log`, and build outputs.
* All telemetry queries in offline mode execute purely on local hardware without transmitting data to external servers.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for full details.
