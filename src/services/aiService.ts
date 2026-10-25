import { queryMarsDataset, classifiedHazards } from './dataService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ares' | 'system';
  content: string;
  timestamp: string;
  engineUsed?: 'gemini-online' | 'qwen-offline' | 'ares-local-rag';
  citations?: string[];
}

export type CopilotMode = 'online' | 'offline';

export class AresAIService {
  private mode: CopilotMode = 'online';
  private geminiKey: string;
  private geminiModel: string;
  private localEndpoint: string;
  private localModel: string;

  constructor() {
    this.geminiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
    this.geminiModel = (import.meta.env.VITE_GEMINI_MODEL as string) || 'gemini-2.5-flash';
    this.localEndpoint = (import.meta.env.VITE_LOCAL_LLM_URL as string) || 'http://localhost:11434/v1';
    this.localModel = (import.meta.env.VITE_LOCAL_MODEL_NAME as string) || 'qwen2.5:7b-instruct';
  }

  public getMode(): CopilotMode {
    return this.mode;
  }

  public setMode(mode: CopilotMode) {
    this.mode = mode;
  }

  public getGeminiKey(): string {
    return this.geminiKey;
  }

  public setGeminiKey(key: string) {
    this.geminiKey = key.trim();
  }

  public getGeminiModel(): string {
    return this.geminiModel;
  }

  public setGeminiModel(model: string) {
    this.geminiModel = model.trim();
  }

  public getLocalEndpoint(): string {
    return this.localEndpoint;
  }

  public setLocalEndpoint(url: string) {
    this.localEndpoint = url.trim();
  }

  public getLocalModel(): string {
    return this.localModel;
  }

  public setLocalModel(name: string) {
    this.localModel = name.trim();
  }

  /**
   * Generates a context bundle from the Mars RAG index
   */
  private buildMarsRAGContext(userPrompt: string): string {
    const searchMatches = queryMarsDataset(userPrompt);

    const contextSnippet = `
CURRENT MISSION CONTEXT & MARS KNOWLEDGE BASE:
- Mars Equatorial Radius: 3,396.2 km | Polar: 3,376.2 km | Gravity: 0.38g (3.72 m/s²)
- Sol Duration: 24h 39m 35s
- Atmosphere: 95.3% CO2, surface pressure ~6 to 9 mbar.

TOP RELEVANT TELEMETRY RETRIEVED FOR USER QUERY:
${searchMatches}

CRITICAL HAZARD SUMMARY:
${classifiedHazards.map(h => `- ${h.name} (${h.severity}): ${h.coordinates.lat}°N, ${h.coordinates.lon}°E [Threat: ${h.threat_class}]. Protocol: ${h.astronaut_protocol}`).join('\n')}

THREE FORKS DEPOT OVERVIEW:
Total Tubes: 10 cached titanium core tubes at 18.4547°N, 77.4075°E deposited by Perseverance (Sols 653-710). Includes igneous cumulate, delta mudstone, regolith, and atmospheric witness tubes.
`;
    return contextSnippet;
  }

  /**
   * Query the AI Assistant
   */
  public async query(prompt: string, conversationHistory: ChatMessage[] = []): Promise<ChatMessage> {
    const ragContext = this.buildMarsRAGContext(prompt);
    const systemPrompt = `You are 'Ares Copilot', the aerospace navigation and tactical science AI assistant for human Mars expedition crews.
You operate with military aerospace precision (NASA Flight Operations style).
Tone: Concise, technical, vigilant, mission-focused.
Reference exact Martian coordinates (lat/lon), Sol numbers, instruments (SHERLOC, SuperCam, PIXL, APXS, SEIS), and hazard classes.
When astronauts ask about routes or hazards, cite specific exclusion radii, ground slip risks, and required safety protocols.
Use markdown for readability.

${ragContext}
`;

    // MODE 1: OFFLINE MODE (Local Qwen 2.5 7B via Ollama / LM Studio)
    if (this.mode === 'offline') {
      try {
        const response = await fetch(`${this.localEndpoint}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.localModel,
            messages: [
              { role: 'system', content: systemPrompt },
              ...conversationHistory.slice(-6).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.content
              })),
              { role: 'user', content: prompt }
            ],
            temperature: 0.4,
            max_tokens: 800
          })
        });

        if (!response.ok) {
          throw new Error(`Local LLM responded with HTTP ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'No response from local model.';

        return {
          id: `ares-${Date.now()}`,
          sender: 'ares',
          content: reply,
          timestamp: new Date().toLocaleTimeString(),
          engineUsed: 'qwen-offline',
          citations: ['Local Quantized Model (Qwen 2.5 7B)', 'Local Mars GIS RAG Index']
        };
      } catch (err) {
        console.warn('Local LLM offline or unreachable. Falling back to Ares Local RAG Synthesizer.', err);
        return this.synthesizeLocalRAGResponse(prompt, ragContext, 'offline_fallback');
      }
    }

    // MODE 2: ONLINE MODE (Gemini API)
    if (this.geminiKey) {
      const modelsToTry = [this.geminiModel, 'gemini-1.5-flash'];
      for (const model of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiKey}`;
          const contents = [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nAstronaut Query: ${prompt}` }]
            }
          ];

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 900
              }
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`Gemini API error ${response.status}: ${JSON.stringify(errData)}`);
          }

          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (reply) {
            return {
              id: `ares-${Date.now()}`,
              sender: 'ares',
              content: reply,
              timestamp: new Date().toLocaleTimeString(),
              engineUsed: 'gemini-online',
              citations: [`Google Gemini (${model})`, 'NASA Mission Telemetry Archives']
            };
          }
        } catch (geminiErr) {
          console.warn(`Gemini model ${model} failed, checking fallback:`, geminiErr);
        }
      }
    }

    // MODE 3: High-Fidelity Local RAG Synthesizer (Works without any API keys or servers!)
    return this.synthesizeLocalRAGResponse(prompt, ragContext, 'online_no_key');
  }

  /**
   * Deterministic aerospace RAG synthesizer for zero-dependency offline field operation
   */
  private synthesizeLocalRAGResponse(
    prompt: string,
    ragContext: string,
    cause: 'offline_fallback' | 'online_no_key'
  ): ChatMessage {
    const p = prompt.toLowerCase();
    let answer = '';

    if (p.includes('three forks') || p.includes('sample') || p.includes('tube')) {
      answer = `### 🛰️ Three Forks Sample Depot Telemetry

**Location:** Jezero Crater Delta Front (18.4547°N, 77.4075°E)  
**Status:** 10 hermetically sealed titanium core tubes cached between Sol 653 and Sol 710.

#### Cached Inventory Highlights:
1. **Tube #1 (ST-241 'Amalik'):** Igneous cumulate from Séítah. Provides radioisotope crystallization age dating of Jezero base.
2. **Tube #2 (ST-266 'Mageik'):** Deltaic mudstone with high clay/sulfate concentration for fossilized cellular structures.
3. **Tube #3 (ST-277 'Malay'):** Mars ambient atmosphere witness sample (sealed at 7.2 mbar).
4. **Tube #4 (ST-254 'Atsah'):** Fluvial delta sandstone transported from beyond Jezero rim.
5. **Tube #5 (ST-218 'Coulettes'):** Unconsolidated regolith & microscopic spherules.
6. **Tube #6 (ST-262 'Montdenier'):** Máaz volcanic basalt with secondary mineral vein alteration.
7. **Tube #7 (ST-239 'Crosswind Lake'):** Delta mudstone with highest organic carbon signatures detected by SHERLOC Raman.
8. **Tube #8 (ST-258 'Roubion'):** Terrestrial witness blank.
9. **Tube #9 (ST-270 'Hazeltop'):** River mouth bar sandstone.
10. **Tube #10 (ST-264 'Bearwallow'):** Carbonate-bearing siltstone.

> **Astronaut Advisory:** Maintain a minimum 15-meter buffer from sample tubes to prevent rocket plume contamination during ascent vehicle descent.`;
    } else if (p.includes('troy') || p.includes('spirit') || p.includes('sand trap')) {
      answer = `### ⚠️ Hazard Advisory: Troy Sand Trap (Spirit Memorial)

**Coordinates:** -14.6085°S, 175.5265°E (Elev: -1,905 m)  
**Threat Class:** CLASS 1 - FATAL CHASSIS ENTRAPMENT  
**Caution Radius:** 450 meters (Exclusion Zone)

#### Incident Analysis:
- On Sol 1892 (April 2009), Spirit broke through a benign-looking cemented surface crust into low-density powdery iron sulfate (Fe-SO4).
- Wheel slip reached 100%, causing the belly pan to rest directly on the ground.
- **Physical Mechanism:** Hydrothermal fumarole alteration created ultrafine crystals lacking mechanical cohesion (friction angle < 18°).

#### Field Instructions:
1. All manned and robotic rovers must divert around the 450m caution buffer.
2. If conducting pedestrian EVA on foot, use wide-footprint snowshoe plates to distribute weight.`;
    } else if (p.includes('purgatory') || p.includes('opportunity')) {
      answer = `### ⚠️ Hazard Advisory: Purgatory Dune (Opportunity Stranding)

**Coordinates:** -1.9790°S, 354.5120°E (Elev: -1,375 m)  
**Threat Class:** CLASS 1 - WHEEL ENTRAPMENT  
**Caution Radius:** 350 meters

#### Incident Analysis:
- Opportunity was stranded for 38 sols in Sol 446 after driving into a transverse aeolian ridge (TAR) ripple with loose hematite spherules acting as frictionless ball bearings.
- **Safety Rule:** Never drive parallel into ripple troughs; approach ripple crests at 90-degree perpendicular angles with torque slip alerts active.`;
    } else if (p.includes('perchlorate') || p.includes('toxic') || p.includes('poison')) {
      answer = `### ☣️ Biochemical Hazard: Soil Perchlorates (ClO4-)

**Key Detection Site:** Phoenix Landing Site, Vastitas Borealis (68.2188°N, 234.2507°E)  
**Global Distribution:** 0.5% - 1.0% by weight in virtually all surface regolith.  
**Threat Class:** CLASS 3 - BIOCHEMICAL TOXICITY

#### Health Impact:
- Powerful endocrine disruptor that binds to the sodium-iodide symporter (NIS), blocking thyroid iodine uptake and inducing metabolic collapse.
- Severe irritant to lung tissue and mucous membranes.

#### Crew Mitigation Protocol:
1. **Zero Dust Ingress:** Mandatory suit-port or electrostatic particulate decontamination airlock before cabin entry.
2. **Washdown:** Wash exterior suit surfaces with catalytic chemical reduction fluid. Never track dry Martian red dust into pressurized modules.`;
    } else if (p.includes('ice') || p.includes('water')) {
      answer = `### 🧊 In-Situ Resource Utilization (ISRU): Water Ice Reserves

#### Primary Accessible Water Deposits:
1. **Utopia Planitia Subsurface Ice Sheet (48.27°N, 134.0°E):**
   - Volume: ~14,300 km³ (equivalent to Lake Superior).
   - Depth: 1 to 10 meters beneath volcanic dust mantle.
   - Purity: 85% - 90% water ice.
2. **Vastitas Borealis Permafrost (Phoenix Site - 68.22°N, 234.25°E):**
   - Depth: Just 5 cm below topsoil.
   - Purity: 99% pure water ice table.
3. **Arcadia Planitia Buried Sheet Ice (39.3°N, 189.7°E):**
   - Ideal mid-latitude human base site with shallow ice and low elevation (-3.8 km).

> **Extraction Recommendation:** Utilize automated thermal Rodriguez wells to melt downhole ice cavities and pump potable water to surface electrolysis plants for propellant production.`;
    } else {
      answer = `### 🛰️ Ares Tactical Telemetry Report

**Telemetry Digest:**
${queryMarsDataset(prompt)}

**Active Navigational Status:**
- All 5 rover traverse tracks (Perseverance, Curiosity, Opportunity, Spirit, Sojourner) and 4 historic lander stations (Viking 1/2, Phoenix, InSight) are synchronized in local GIS memory.
- Hazard radar is actively monitoring 7 classified danger zones with caution buffer geometries.

*Tip: Query me on specific sample tubes at Three Forks, sand trap extraction histories, perchlorate decontamination, or plan an EVA route in the EVA Planner tab.*`;
    }

    const note = cause === 'offline_fallback'
      ? '\n\n*(Note: Local LLM server was unreachable on ' + this.localEndpoint + '. Ares Local RAG Synthesizer provided this response. Run `setup_offline_qwen.bat` to launch Qwen 2.5 7B.)*'
      : '\n\n*(Note: Running in zero-dependency Local RAG Mode. Add `VITE_GEMINI_API_KEY` to `.env` or toggle Offline Mode to connect to local Qwen 2.5 7B.)*';

    return {
      id: `ares-${Date.now()}`,
      sender: 'ares',
      content: answer + note,
      timestamp: new Date().toLocaleTimeString(),
      engineUsed: 'ares-local-rag',
      citations: ['Ares Command Ground Telemetry Cache', 'Planetary GIS Graph Memory']
    };
  }
}

export const aresAI = new AresAIService();
