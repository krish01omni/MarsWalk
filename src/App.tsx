import React, { useState } from 'react';
import { TacticalHeader } from './components/layout/TacticalHeader';
import { TelemetryDrawer } from './components/layout/TelemetryDrawer';
import { MarsGlobe3D } from './components/globe/MarsGlobe3D';
import { TacticalMap2D } from './components/map/TacticalMap2D';
import { MissionHub } from './components/missions/MissionHub';
import { HazardRadarPanel } from './components/tools/HazardRadarPanel';
import { EVARoutePlanner } from './components/tools/EVARoutePlanner';
import { DiscoveryCatalog } from './components/tools/DiscoveryCatalog';
import { SpaceRefsModal } from './components/tools/SpaceRefsModal';
import { OfflineSetupModal } from './components/tools/OfflineSetupModal';
import { AresCopilotModal } from './components/ai/AresCopilotModal';

import { 
  allRoverTraverses, 
  allLanders, 
  classifiedHazards 
} from './services/dataService';
import { aresAI } from './services/aiService';
import type { 
  RoverWaypoint, 
  ClassifiedHazard, 
  EVAPlannedWaypoint 
} from './types/mission';
import type { CopilotMode } from './services/aiService';

export const App: React.FC = () => {
  // Navigation & Page State (Connected Multi-View)
  const [currentTab, setCurrentTab] = useState<'missions' | 'map'>('missions');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [activeMission, setActiveMission] = useState<string>('perseverance');
  const [selectedSol, setSelectedSol] = useState<number>(1395);
  const [isTelemetryDrawerOpen, setIsTelemetryDrawerOpen] = useState<boolean>(false);

  // Modals & Panels State
  const [isHazardModalOpen, setIsHazardModalOpen] = useState<boolean>(false);
  const [isEVAModalOpen, setIsEVAModalOpen] = useState<boolean>(false);
  const [isDiscoveriesModalOpen, setIsDiscoveriesModalOpen] = useState<boolean>(false);
  const [isRefsModalOpen, setIsRefsModalOpen] = useState<boolean>(false);
  const [isOfflineSetupOpen, setIsOfflineSetupOpen] = useState<boolean>(false);
  const [isCopilotModalOpen, setIsCopilotModalOpen] = useState<boolean>(false);

  // Selected Entities
  const [selectedHazard, setSelectedHazard] = useState<ClassifiedHazard | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lon: number; zoom?: number } | null>(null);

  // EVA Route Planning State
  const [isMapPlacementActive, setIsMapPlacementActive] = useState<boolean>(false);
  const [evaWaypoints, setEvaWaypoints] = useState<EVAPlannedWaypoint[]>([]);

  // AI Copilot State
  const [aiMode, setAiMode] = useState<CopilotMode>(aresAI.getMode());

  // Global Aerospace Keyboard Accelerators (Cmd+K Copilot, Esc Close)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCopilotModalOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsHazardModalOpen(false);
        setIsEVAModalOpen(false);
        setIsDiscoveriesModalOpen(false);
        setIsRefsModalOpen(false);
        setIsOfflineSetupOpen(false);
        setIsCopilotModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle rover or lander selection
  const handleSelectMission = (missionId: string) => {
    setActiveMission(missionId);
    const rover = allRoverTraverses[missionId];
    if (rover) {
      setSelectedSol(rover.current_status.sol);
      setFlyToTarget({
        lat: rover.landing_site.latitude,
        lon: rover.landing_site.longitude,
        zoom: 7
      });
      setIsTelemetryDrawerOpen(true);
    } else {
      const lander = allLanders[missionId];
      if (lander) {
        setFlyToTarget({
          lat: lander.landing_site.latitude,
          lon: lander.landing_site.longitude,
          zoom: 7
        });
        setIsTelemetryDrawerOpen(true);
      }
    }
  };

  // Handle 3D pin selection from Mars Globe
  const handleSelectSiteFromGlobe = (siteType: string, id: string) => {
    if (siteType === 'rover' || siteType === 'lander') {
      handleSelectMission(id);
      setViewMode('2d');
    } else if (siteType === 'hazard') {
      const hazard = classifiedHazards.find(h => h.id === id);
      if (hazard) {
        setSelectedHazard(hazard);
        setIsHazardModalOpen(true);
      }
    }
  };

  // Handle Waypoint selection from 2D map
  const handleSelectWaypoint = (wp: RoverWaypoint) => {
    setSelectedSol(wp.sol);
    setIsTelemetryDrawerOpen(true);
  };

  // Handle Hazard selection from 2D map
  const handleSelectHazard = (h: ClassifiedHazard) => {
    setSelectedHazard(h);
    setIsHazardModalOpen(true);
  };

  // Toggle AI Copilot Mode (Online Gemini <-> Offline Local Qwen)
  const handleToggleAIMode = () => {
    const nextMode: CopilotMode = aiMode === 'online' ? 'offline' : 'online';
    aresAI.setMode(nextMode);
    setAiMode(nextMode);
  };

  // Fly to sample location from catalog
  const handleFlyToLocation = (lat: number, lon: number) => {
    setFlyToTarget({ lat, lon, zoom: 8 });
    setViewMode('2d');
    setCurrentTab('map');
    setIsDiscoveriesModalOpen(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#050608] font-sans">
      {/* Tactical Header with Multi-Page Navigation */}
      <TacticalHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        viewMode={viewMode}
        onToggleView={setViewMode}
        onOpenCopilot={() => setIsCopilotModalOpen(true)}
        onOpenEVA={() => setIsEVAModalOpen(true)}
        onOpenDiscoveries={() => setIsDiscoveriesModalOpen(true)}
        onOpenHazards={() => setIsHazardModalOpen(true)}
        onOpenRefs={() => setIsRefsModalOpen(true)}
        onOpenOfflineSetup={() => setIsOfflineSetupOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {currentTab === 'missions' ? (
          /* ===================== VIEW 1: MISSIONS DIRECTORY ===================== */
          <MissionHub
            onSelectMissionOnMap={(missionId, mode) => {
              handleSelectMission(missionId);
              if (mode) setViewMode(mode);
              setCurrentTab('map');
            }}
            initialMissionId={activeMission}
            onOpenOfflineSetup={() => setIsOfflineSetupOpen(true)}
          />
        ) : (
          /* ===================== VIEW 2: FULL-SCREEN PLANETARY MAP ===================== */
          <>
            {viewMode === '3d' ? (
              <MarsGlobe3D
                onSelectSite={handleSelectSiteFromGlobe}
                selectedSiteId={activeMission}
              />
            ) : (
              <TacticalMap2D
                activeMission={activeMission}
                selectedSol={selectedSol}
                onSelectWaypoint={handleSelectWaypoint}
                onSelectHazard={handleSelectHazard}
                onSelectMission={handleSelectMission}
                isEVAPlanning={isMapPlacementActive}
                evaWaypoints={evaWaypoints}
                onAddEVAWaypoint={wp => setEvaWaypoints(prev => [...prev, wp])}
                flyToTarget={flyToTarget}
              />
            )}

            {/* Floating Telemetry Drawer (Opens on demand or when waypoint is selected) */}
            <TelemetryDrawer
              activeMission={activeMission}
              roverData={allRoverTraverses[activeMission]}
              landerData={allLanders[activeMission]}
              selectedSol={selectedSol}
              onSelectSol={setSelectedSol}
              isOpen={isTelemetryDrawerOpen}
              onToggleOpen={() => setIsTelemetryDrawerOpen(!isTelemetryDrawerOpen)}
              onFlyToWaypoint={wp => {
                setFlyToTarget({ lat: wp.lat, lon: wp.lon, zoom: 8 });
              }}
            />
          </>
        )}
      </main>

      {/* Hazard Radar & Buffer Zones Modal */}
      <HazardRadarPanel
        isOpen={isHazardModalOpen}
        onClose={() => setIsHazardModalOpen(false)}
        onSelectHazard={h => setSelectedHazard(h)}
        selectedHazard={selectedHazard}
      />

      {/* Astronaut EVA Route Waypoint Planner Modal */}
      <EVARoutePlanner
        isOpen={isEVAModalOpen}
        onClose={() => setIsEVAModalOpen(false)}
        waypoints={evaWaypoints}
        onAddWaypoint={wp => setEvaWaypoints(prev => [...prev, wp])}
        onRemoveWaypoint={id => setEvaWaypoints(prev => prev.filter(w => w.id !== id))}
        onClearRoute={() => setEvaWaypoints([])}
        onStartMapPlacement={() => {
          setIsMapPlacementActive(!isMapPlacementActive);
          setViewMode('2d');
          setCurrentTab('map');
          setIsEVAModalOpen(false);
        }}
        isMapPlacementActive={isMapPlacementActive}
      />

      {/* Discovery & Sample Depot Catalog Modal */}
      <DiscoveryCatalog
        isOpen={isDiscoveriesModalOpen}
        onClose={() => setIsDiscoveriesModalOpen(false)}
        onFlyToLocation={handleFlyToLocation}
      />

      {/* Gold-Standard Space References Modal */}
      <SpaceRefsModal
        isOpen={isRefsModalOpen}
        onClose={() => setIsRefsModalOpen(false)}
      />

      {/* Offline Deployment & GitHub Field Kit Modal */}
      <OfflineSetupModal
        isOpen={isOfflineSetupOpen}
        onClose={() => setIsOfflineSetupOpen(false)}
      />

      {/* Ares Copilot AI Assistant Modal */}
      <AresCopilotModal
        isOpen={isCopilotModalOpen}
        onClose={() => setIsCopilotModalOpen(false)}
        aiMode={aiMode}
        onToggleMode={handleToggleAIMode}
      />
    </div>
  );
};

export default App;
