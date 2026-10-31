import React from 'react';
import { X, ArrowUpRight } from 'lucide-react';

interface SpaceRefsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpaceRefsModal: React.FC<SpaceRefsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const references = [
    {
      name: 'NASA Solar System Treks (Mars Trek)',
      agency: 'NASA / JPL',
      url: 'https://trek.nasa.gov/mars/',
      description: 'Official planetary GIS delivering high-resolution OGC WMTS raster mosaics (Viking MDIM, MOLA elevation, THEMIS day/night IR) across the Martian surface.',
      badge: 'WMTS BASEMAP SOURCE'
    },
    {
      name: 'NASA Eyes on Asteroids & Solar System',
      agency: 'NASA / JPL',
      url: 'https://eyes.nasa.gov/apps/asteroids/',
      description: 'Gold-standard real-time 3D planetary tracking interface with dark titanium aesthetics, high-speed telemetry, and orbital trajectory visualization.',
      badge: 'AEROSPACE UI STANDARD'
    },
    {
      name: 'ESA Space Situational Awareness (SSA)',
      agency: 'European Space Agency',
      url: 'https://swe.ssa.esa.int/',
      description: 'Operational space weather telemetry dashboard with dense data cards, space weather alert banners, and tactical space radar readouts.',
      badge: 'HAZARD RADAR STANDARD'
    },
    {
      name: 'James Webb Space Telescope (JWST) 3D Tracker',
      agency: 'NASA / ESA / CSA',
      url: 'https://webb.nasa.gov/content/webbLaunch/whereIsWebb.html',
      description: 'Real-time telemetry odometer, instrument sensor temperature readouts, and mission phase scrubbers inspiring our sol-by-sol rover telemetry drawer.',
      badge: 'TELEMETRY HUD REFERENCE'
    },
    {
      name: 'NASA Mars 2020 Mission Manager & Sample Registry',
      agency: 'NASA JPL',
      url: 'https://mars.nasa.gov/mars-2020/participate/samples/',
      description: 'Official database of all sealed titanium rock cores, regolith tubes, and atmospheric blanks cached at Three Forks for Mars Sample Return.',
      badge: 'THREE FORKS GROUND TRUTH'
    },
    {
      name: 'Stellarium Web Planetary Engine',
      agency: 'Stellarium Open-Source',
      url: 'https://stellarium-web.org/',
      description: 'High-speed celestial rendering and dark-adapted night-vision HUD controls inspiring our anti-AI-slop typography and high-contrast color scheme.',
      badge: 'DARK-ADAPTED HUD STANDARD'
    }
  ];

  return (
    <div className="fixed inset-0 z-[2000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bezel-shell w-full max-w-3xl max-h-[88vh] flex flex-col">
        <div className="bezel-core w-full h-full flex flex-col overflow-hidden text-zinc-300">
          
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-white/[0.08] bg-[#07090E] flex items-center justify-between font-mono">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-white/[0.04] border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                REF
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono font-bold">
                  AEROSPACE DESIGN BENCHMARKS & CITATIONS
                </div>
                <h2 className="text-xs md:text-sm font-bold text-white flex items-center space-x-2 uppercase">
                  <span>GOLD-STANDARD SPACE REFERENCES</span>
                  <span className="text-[9px] px-2 py-0.2 rounded bg-white/10 text-zinc-300 border border-white/10">
                    NASA / ESA
                  </span>
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white rounded transition-colors"
              title="Close (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
            <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-3">
              MarsWalk adheres to verified space flight telemetry patterns and rejects generic AI frontend tropes. Explore these official reference platforms:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {references.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded border border-white/[0.08] bg-[#0A0D14] hover:bg-white/[0.04] hover:border-white/20 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5 font-mono">
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-400 border border-white/10">
                        {ref.agency}
                      </span>
                      <span className="text-[9px] text-white font-bold font-mono">
                        {ref.badge}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors leading-snug uppercase mb-1.5">
                      {ref.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed line-clamp-3">
                      {ref.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-500 group-hover:text-white">
                    <span>OPEN PLATFORM</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
