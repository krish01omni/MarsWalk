import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { 
  allRoverTraverses, 
  allLanders, 
  classifiedHazards 
} from '../../services/dataService';

interface MarsGlobe3DProps {
  onSelectSite: (siteType: string, id: string) => void;
  selectedSiteId?: string;
}

interface HoveredSiteData {
  id: string;
  name: string;
  type: 'rover' | 'lander' | 'hazard';
  lat: number;
  lon: number;
  details?: string;
  screenX: number;
  screenY: number;
}

export const MarsGlobe3D: React.FC<MarsGlobe3DProps> = ({
  onSelectSite,
  selectedSiteId: _selectedSiteId
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredSite, setHoveredSite] = useState<HoveredSiteData | null>(null);
  const [isLoadingTexture, setIsLoadingTexture] = useState<boolean>(true);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    let animationFrameId: number;
    const width = mountNode.clientWidth;
    const height = mountNode.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 6.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mountNode.appendChild(renderer.domElement);

    // 2. High-Resolution Starfield with soft circular points (No square pixel artifacts)
    const createStarfield = () => {
      const starCanvas = document.createElement('canvas');
      starCanvas.width = 32;
      starCanvas.height = 32;
      const ctx = starCanvas.getContext('2d')!;
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(220, 235, 255, 0.7)');
      gradient.addColorStop(0.7, 'rgba(160, 190, 240, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);

      const starTexture = new THREE.CanvasTexture(starCanvas);
      const count = 2200;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        // Distribute stars on a distant sphere
        const r = 80 + Math.random() * 40;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Natural astronomical color variation: blue-white, pure white, warm yellow
        const colorType = Math.random();
        if (colorType > 0.8) {
          // Warm amber / red star
          colors[i * 3] = 1.0;
          colors[i * 3 + 1] = 0.85;
          colors[i * 3 + 2] = 0.7;
        } else if (colorType > 0.4) {
          // Pure white
          colors[i * 3] = 0.95;
          colors[i * 3 + 1] = 0.98;
          colors[i * 3 + 2] = 1.0;
        } else {
          // Cool blue-white
          colors[i * 3] = 0.8;
          colors[i * 3 + 1] = 0.9;
          colors[i * 3 + 2] = 1.0;
        }
      }

      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const starMat = new THREE.PointsMaterial({
        size: 0.5,
        map: starTexture,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      return new THREE.Points(starGeo, starMat);
    };

    const starField = createStarfield();
    scene.add(starField);

    // 3. Mars Planetary Sphere
    const sphereRadius = 2.25;
    const marsGeometry = new THREE.SphereGeometry(sphereRadius, 96, 96);

    const textureLoader = new THREE.TextureLoader();
    
    // Load high-res NASA diffuse and bump maps
    const marsDiffuse = textureLoader.load(
      '/textures/2k_mars.jpg',
      () => setIsLoadingTexture(false),
      undefined,
      (err) => console.warn('Using fallback texture, error loading /textures/2k_mars.jpg:', err)
    );
    marsDiffuse.colorSpace = THREE.SRGBColorSpace;

    const marsBump = textureLoader.load(
      '/textures/2k_mars_bump.jpg',
      undefined,
      undefined,
      () => {}
    );

    const marsMaterial = new THREE.MeshStandardMaterial({
      map: marsDiffuse,
      bumpMap: marsBump,
      bumpScale: 0.045,
      roughness: 0.92,
      metalness: 0.05
    });

    const marsMesh = new THREE.Mesh(marsGeometry, marsMaterial);
    // Initial tilt matching Mars axial tilt (25.19°)
    marsMesh.rotation.z = 25.19 * (Math.PI / 180);
    // Rotate to show Jezero and Gale craters initially
    marsMesh.rotation.y = -Math.PI * 0.4;
    scene.add(marsMesh);

    // 4. Realistic Martian Atmospheric Limb Glow (Rayleigh scattering halo)
    const atmosGeometry = new THREE.SphereGeometry(sphereRadius * 1.018, 64, 64);
    const atmosMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float fresnel = 1.0 - dot(vNormal, viewDir);
          fresnel = pow(fresnel, 3.2);

          // Mars rust sunset atmosphere: warm terracotta-amber fading to deep thin haze
          vec3 atmosColor = vec3(0.92, 0.42, 0.22);
          gl_FragColor = vec4(atmosColor, fresnel * 0.75);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    scene.add(atmosMesh);

    // 5. Cinematic Space Lighting
    // Directional Sunlight (sharp planetary terminator)
    const sunLight = new THREE.DirectionalLight(0xfff3e5, 2.6);
    sunLight.position.set(10, 4, 7);
    scene.add(sunLight);

    // Subtle dark-side cosmic ambient fill
    const ambientLight = new THREE.AmbientLight(0x0a0f1d, 0.4);
    scene.add(ambientLight);

    // 6. Beacons Container (Rotates synchronously with Mars)
    const beaconsGroup = new THREE.Group();
    marsMesh.add(beaconsGroup);

    // Lat/Lon to 3D Sphere Vector
    const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // Site registry for raycasting & hover detection
    const interactiveObjects: Array<{
      object: THREE.Object3D;
      data: HoveredSiteData;
    }> = [];

    // Helper: Build sleek aerospace beacon marker
    const createBeacon = (
      id: string,
      name: string,
      type: 'rover' | 'lander' | 'hazard',
      lat: number,
      lon: number,
      colorHex: number,
      details?: string
    ) => {
      const surfacePos = latLonToVector3(lat, lon, sphereRadius);
      const normal = surfacePos.clone().normalize();

      const beaconObj = new THREE.Group();
      beaconObj.position.copy(surfacePos);
      beaconObj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      // 1. Surface Ground Ring (HUD Target Circle)
      const ringGeo = new THREE.RingGeometry(0.035, 0.05, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.003; // Just above terrain
      beaconObj.add(ringMesh);

      // 2. Central Pulse Core Dot
      const coreGeo = new THREE.CircleGeometry(0.02, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.rotation.x = Math.PI / 2;
      coreMesh.position.y = 0.004;
      beaconObj.add(coreMesh);

      // 3. Subtle Holographic Vertical Beam
      const beamHeight = type === 'hazard' ? 0.12 : 0.18;
      const beamGeo = new THREE.CylinderGeometry(0.003, 0.003, beamHeight, 8);
      beamGeo.translate(0, beamHeight / 2, 0);
      const beamMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.6
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beaconObj.add(beamMesh);

      // 4. Hover Hit Target (Invisible sphere for easy mouse hover)
      const hitGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({
        visible: false
      });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.y = beamHeight / 2;
      beaconObj.add(hitMesh);

      beaconsGroup.add(beaconObj);

      const siteData: HoveredSiteData = {
        id,
        name,
        type,
        lat,
        lon,
        details,
        screenX: 0,
        screenY: 0
      };

      interactiveObjects.push({
        object: hitMesh,
        data: siteData
      });
    };

    // Register All Rovers (Aerospace White Phosphor)
    Object.entries(allRoverTraverses).forEach(([id, rover]) => {
      createBeacon(
        id,
        `${rover.rover}`,
        'rover',
        rover.landing_site.latitude,
        rover.landing_site.longitude,
        0xffffff,
        `${rover.landing_site.crater || rover.landing_site.name} • ${rover.current_status.total_odometer_km} km`
      );
    });

    // Register All Landers (Cyan / Tech Teal #06B6D4)
    Object.entries(allLanders).forEach(([id, lander]) => {
      createBeacon(
        id,
        lander.mission,
        'lander',
        lander.landing_site.latitude,
        lander.landing_site.longitude,
        0x06b6d4,
        `${lander.landing_site.name} • ${lander.operational_record.duration_sols} Sols`
      );
    });

    // Register Classified Hazards (Tactical Warning Red #EF4444)
    classifiedHazards.forEach((hazard) => {
      createBeacon(
        hazard.id,
        hazard.name,
        'hazard',
        hazard.coordinates.lat,
        hazard.coordinates.lon,
        0xef4444,
        `Threat Class ${hazard.threat_class} • Buffer: ${hazard.caution_radius_m}m`
      );
    });

    // 7. Fluid Interaction & Rotation Physics
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotationVelocityX = 0;
    let rotationVelocityY = 0.0015; // Smooth idle planetary rotation
    let isHoveringInteractive = false;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      rotationVelocityX = 0;
      rotationVelocityY = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;

      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;

        rotationVelocityY = deltaX * 0.004;
        rotationVelocityX = deltaY * 0.004;

        marsMesh.rotation.y += rotationVelocityY;
        marsMesh.rotation.x += rotationVelocityX;

        // Clamp vertical tilt to prevent gimbal lock
        marsMesh.rotation.x = Math.max(-Math.PI * 0.4, Math.min(Math.PI * 0.4, marsMesh.rotation.x));

        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        // Raycast for hover tooltips
        raycaster.setFromCamera(mouse, camera);
        const hitMeshes = interactiveObjects.map(item => item.object);
        const intersects = raycaster.intersectObjects(hitMeshes, false);

        if (intersects.length > 0) {
          const hit = intersects[0];
          const matched = interactiveObjects.find(item => item.object === hit.object);
          if (matched) {
            isHoveringInteractive = true;
            if (mountNode) mountNode.style.cursor = 'pointer';

            // Calculate screen coordinates
            const worldPos = new THREE.Vector3();
            hit.object.getWorldPosition(worldPos);
            worldPos.project(camera);

            const screenX = (worldPos.x * 0.5 + 0.5) * rect.width;
            const screenY = (-(worldPos.y * 0.5) + 0.5) * rect.height;

            // Only show if beacon is on the front-facing hemisphere of Mars
            const cameraDirection = camera.position.clone().normalize();
            const beaconDirection = worldPos.clone().normalize();

            if (beaconDirection.dot(cameraDirection) > 0.05) {
              setHoveredSite({
                ...matched.data,
                screenX,
                screenY
              });
            } else {
              setHoveredSite(null);
            }
          }
        } else {
          isHoveringInteractive = false;
          if (mountNode) mountNode.style.cursor = isDragging ? 'grabbing' : 'grab';
          setHoveredSite(null);
        }
      }
    };

    const onPointerUp = () => {
      isDragging = false;
      if (mountNode) mountNode.style.cursor = isHoveringInteractive ? 'pointer' : 'grab';
    };

    const onPointerClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;

      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hitMeshes = interactiveObjects.map(item => item.object);
      const intersects = raycaster.intersectObjects(hitMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const matched = interactiveObjects.find(item => item.object === hit.object);
        if (matched) {
          onSelectSite(matched.data.type, matched.data.id);
        }
      }
    };

    // Smooth Zoom Wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.0025;
      camera.position.z = Math.max(3.8, Math.min(10.5, camera.position.z + zoomFactor));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('click', onPointerClick);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Handle Window Resize
    const onResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', onResize);

    // 8. Animation Loop with Momentum Damping
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock.getDelta();

      // Atmospheric rotation & idle spin
      if (!isDragging) {
        marsMesh.rotation.y += rotationVelocityY;
        marsMesh.rotation.x += rotationVelocityX;

        // Apply gentle damping to drag velocity
        rotationVelocityY *= 0.96;
        rotationVelocityX *= 0.96;

        // Keep a minimum baseline planetary orbit rotation
        if (Math.abs(rotationVelocityY) < 0.001) {
          rotationVelocityY = 0.0012;
        }
      }

      // Very subtle starfield counter-drift
      starField.rotation.y += 0.00015;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('click', onPointerClick);
      domElement.removeEventListener('wheel', onWheel);
      if (mountNode && renderer.domElement) {
        mountNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      marsGeometry.dispose();
      marsMaterial.dispose();
      atmosGeometry.dispose();
      atmosMaterial.dispose();
    };
  }, [onSelectSite]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#07090E]">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Subtle Texture Loading Indicator */}
      {isLoadingTexture && (
        <div className="absolute top-4 right-4 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#0D111A]/80 border border-white/10 text-[11px] text-zinc-400 font-mono backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>INITIALIZING 2K MARS ELEVATION MESH...</span>
        </div>
      )}

      {/* Floating Tactical Overlay Controls (NASA Eyes Style) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-3 px-4 py-1.5 rounded bg-black/90 border border-white/15 backdrop-blur-xl shadow-2xl text-[10px] font-mono text-zinc-400 pointer-events-none">
        <span className="text-zinc-300">DRAG TO ROTATE GLOBE</span>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-300">SCROLL TO ZOOM</span>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-300">CLICK TARGET TO INSPECT</span>
      </div>

      {/* Hovered Target HUD Glass Tooltip */}
      {hoveredSite && (
        <div
          className="absolute z-30 pointer-events-none transition-all duration-75 -translate-x-1/2 -translate-y-full mb-3"
          style={{
            left: `${hoveredSite.screenX}px`,
            top: `${hoveredSite.screenY}px`
          }}
        >
          <div className="min-w-[220px] max-w-[280px] p-3 rounded bg-[#080B10]/95 border border-white/15 backdrop-blur-xl shadow-2xl text-zinc-200 font-mono">
            {/* Header / Type Badge */}
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.2 rounded border uppercase ${
                  hoveredSite.type === 'rover'
                    ? 'bg-white/10 text-white border-white/20'
                    : hoveredSite.type === 'lander'
                    ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    : 'bg-red-950/60 text-red-400 border-red-500/40'
                }`}
              >
                {hoveredSite.type === 'rover'
                  ? 'ROVER MISSION'
                  : hoveredSite.type === 'lander'
                  ? 'STATIONARY LANDER'
                  : 'CRITICAL HAZARD'}
              </span>
              <span className="text-[9px] text-zinc-500">CLICK TO ENTER</span>
            </div>

            {/* Target Title */}
            <h4 className="text-xs font-bold text-white tracking-tight mb-1 uppercase truncate">
              {hoveredSite.name}
            </h4>

            {/* Details */}
            {hoveredSite.details && (
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed mb-2">
                {hoveredSite.details}
              </p>
            )}

            {/* Geographic Coordinates */}
            <div className="pt-1.5 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-zinc-400">
              <span>LAT: {hoveredSite.lat.toFixed(4)}°N</span>
              <span>LON: {hoveredSite.lon.toFixed(4)}°E</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
