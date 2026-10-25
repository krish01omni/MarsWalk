import React from 'react';
import { ExternalLink, X, Compass, Globe, Sparkles, Orbit } from 'lucide-react';

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
      badge: 'WMTS Basemap Source',
      icon: Globe
    },
    {
      name: 'NASA Eyes on Asteroids & Solar System',
      agency: 'NASA / JPL',
      url: 'https://eyes.nasa.gov/apps/asteroids/',
      description: 'Gold-standard real-time 3D planetary tracking interface with dark titanium aesthetics, high-speed telemetry, and orbital trajectory visualization.',
      badge: 'Aerospace UI Reference',
      icon: Orbit
    },
    {
      name: 'ESA Space Situational Awareness (SSA)',
      agency: 'European Space Agency',
      url: 'https://swe.ssa.esa.int/',
      description: 'Military/operational space weather telemetry dashboard with dense data cards, space weather alert banners, and tactical space radar readouts.',
      badge: 'Hazard Radar Standard',
      icon: Compass
    },
    {
      name: 'James Webb Space Telescope (JWST) 3D Tracker',
      agency: 'NASA / ESA / CSA',
      url: 'https://webb.nasa.gov/content/webbLaunch/whereIsWebb.html',
      description: 'Real-time telemetry odometer, instrument sensor temperature readouts, and mission phase scrubbers inspiring our sol-by-sol rover telemetry drawer.',
      badge: 'Telemetry Drawer Reference',
      icon: Sparkles
    },
    {
      name: 'NASA Mars 2020 Mission Manager & Sample Registry',
      agency: 'NASA JPL',
      url: 'https://mars.nasa.gov/mars-2020/participate/samples/',
      description: 'Official database of all sealed titanium rock cores, regolith tubes, and atmospheric blanks cached at Three Forks for Mars Sample Return.',
      badge: 'Three Forks Ground Truth',
      icon: ExternalLink
    },
    {
      name: 'Stellarium Web Planetary Engine',
      agency: 'Stellarium Open-Source',
      url: 'https://stellarium-web.org/',
      description: 'High-speed celestial rendering and dark-adapted night-vision HUD controls inspiring our anti-AI-slop typography and high-contrast color scheme.',
      badge: 'Night-Vision HUD Standard',
      icon: Orbit
    }
  ];

  return (
    <div className="fixed inset-0 z-[2000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-3xl max-h-[88vh] bg-[#080B12] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-300">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] bg-[#0A0D14] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold">
                AEROSPACE DESIGN BENCHMARKS & MISSIONS
              </div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>GOLD-STANDARD SPACE REFERENCES</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10 font-mono">
                  NASA / ESA
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#242E40] text-zinc-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-3">
            Ares Command adheres strictly to verified aerospace telemetry patterns and avoids generic AI frontend tropes. Explore these official reference platforms:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {references.map((ref, idx) => {
              const Icon = ref.icon;
              return (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5 font-mono">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-400 border border-white/10">
                        {ref.agency}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-bold">
                        {ref.badge}
                      </span>
                    </div>
                    <div className="flex items-start space-x-2 mb-1.5">
                      <Icon className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                        {ref.name}
                      </h3>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed line-clamp-3">
                      {ref.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">
                    <span>Open External Mission</span>
                    <ExternalLink className="w-3 h-3 text-cyan-400" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0A0D14] text-right font-mono">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-xs text-black font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
