"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Activity, Cpu, Sparkles, Terminal, Cloud, ShieldCheck } from "lucide-react";

export default function CompassCanvas3D({ className = "w-full h-[440px]" }) {
  const mountRef = useRef(null);
  const [hudStats, setHudStats] = useState({
    tokensPerSec: 752,
    latency: 14,
    vectorDim: 768,
    activeNodes: 12,
  });

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Dimensions with fallback
    let width = currentMount.clientWidth || 400;
    let height = currentMount.clientHeight || 440;
    if (height < 250) height = 400;

    // 1. Scene, Camera, High-performance WebGL Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      width / height,
      0.1,
      1000
    );
    camera.position.set(0, 0, 7.8);

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true, 
      powerPreference: "high-performance" 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    
    // Ensure canvas expands nicely
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.outline = "none";
    currentMount.appendChild(renderer.domElement);

    // Main 3D Container Group
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

    // 2. Stripe & Cyber Signature Colors
    const RENDER_CYAN = 0x00d4b6;
    const RENDER_BLURPLE = 0x635bff;
    const RENDER_MAGENTA = 0xff5b79;
    const RENDER_AMBER = 0xff805d;
    const RENDER_INDIGO = 0x4f46e5;

    // 3. Central Crystalline Polyhedron Core
    const gemGroup = new THREE.Group();
    universeGroup.add(gemGroup);

    // Outer Geodesic Icosahedron Hologram Cage
    const outerGeo = new THREE.IcosahedronGeometry(1.3, 1);
    const outerMat = new THREE.MeshStandardMaterial({
      color: RENDER_CYAN,
      emissive: 0x03282b,
      roughness: 0.15,
      metalness: 0.9,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const outerGem = new THREE.Mesh(outerGeo, outerMat);
    gemGroup.add(outerGem);

    // Inner Faceted Core Gem
    const innerGeo = new THREE.OctahedronGeometry(0.82, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: RENDER_BLURPLE,
      emissive: 0x221c6e,
      roughness: 0.1,
      metalness: 0.95,
      wireframe: false,
    });
    const innerGem = new THREE.Mesh(innerGeo, innerMat);
    gemGroup.add(innerGem);

    // 4. Tri-Ring Precision Gyroscope Gimbal
    const ringGroup = new THREE.Group();
    universeGroup.add(ringGroup);

    // Outer Cyan Laser Ring
    const ring1Geo = new THREE.TorusGeometry(2.5, 0.025, 16, 120);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: RENDER_CYAN,
      transparent: true,
      opacity: 0.85,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ringGroup.add(ring1);

    // Middle Blurple Ring (Tilted 55 deg)
    const ring2Geo = new THREE.TorusGeometry(2.1, 0.022, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: RENDER_BLURPLE,
      transparent: true,
      opacity: 0.8,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3.2;
    ringGroup.add(ring2);

    // Inner Magenta Ring (Tilted 70 deg)
    const ring3Geo = new THREE.TorusGeometry(1.7, 0.02, 16, 80);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: RENDER_MAGENTA,
      transparent: true,
      opacity: 0.75,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 2.8;
    ringGroup.add(ring3);

    // 5. Service Satellites (Representing Repos & Contributors)
    const satellites = [];
    const satelliteCount = 6;
    const satelliteColors = [RENDER_CYAN, RENDER_BLURPLE, RENDER_MAGENTA, RENDER_AMBER, RENDER_CYAN, RENDER_INDIGO];

    for (let i = 0; i < satelliteCount; i++) {
      const satGeo = new THREE.SphereGeometry(0.13, 16, 16);
      const satMat = new THREE.MeshStandardMaterial({
        color: satelliteColors[i],
        emissive: satelliteColors[i],
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      
      const orbitRadius = 2.9 + (i % 3) * 0.45;
      const angle = (i / satelliteCount) * Math.PI * 2;
      satMesh.position.set(Math.cos(angle) * orbitRadius, Math.sin(angle * 2) * 0.85, Math.sin(angle) * orbitRadius);

      // Laser Line linking satellite to core
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        satMesh.position,
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: satelliteColors[i],
        transparent: true,
        opacity: 0.35,
      });
      const lineMesh = new THREE.Line(lineGeo, lineMat);

      universeGroup.add(satMesh);
      universeGroup.add(lineMesh);

      satellites.push({
        mesh: satMesh,
        line: lineMesh,
        orbitRadius,
        speed: 0.35 + (i * 0.12),
        phase: angle,
      });
    }

    // 6. Vector Embedding Point Nebula (768-D representation)
    const particleCount = 220;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cCyan = new THREE.Color(RENDER_CYAN);
    const cBlurple = new THREE.Color(RENDER_BLURPLE);
    const cMagenta = new THREE.Color(RENDER_MAGENTA);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.8 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);

      const colorPick = Math.random();
      const chosenColor = colorPick > 0.6 ? cCyan : colorPick > 0.3 ? cBlurple : cMagenta;
      colors[i] = chosenColor.r;
      colors[i + 1] = chosenColor.g;
      colors[i + 2] = chosenColor.b;
    }

    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const particleField = new THREE.Points(particlesGeo, particleMat);
    scene.add(particleField);

    // 7. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(RENDER_CYAN, 5.0, 40);
    cyanPoint.position.set(4, 5, 4);
    scene.add(cyanPoint);

    const blurplePoint = new THREE.PointLight(RENDER_BLURPLE, 5.0, 40);
    blurplePoint.position.set(-4, -4, 4);
    scene.add(blurplePoint);

    const magentaRim = new THREE.DirectionalLight(RENDER_MAGENTA, 2.5);
    magentaRim.position.set(0, 6, -5);
    scene.add(magentaRim);

    // 8. Mouse Parallax & Dynamic Dragging
    let targetX = 0;
    let targetY = 0;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseMove = (e) => {
      if (!currentMount) return;
      const rect = currentMount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        universeGroup.rotation.y += deltaX * 0.008;
        universeGroup.rotation.x += deltaY * 0.008;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        targetX = y * 0.35;
        targetY = x * 0.55;
      }
    };

    const handleMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    currentMount.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // 9. Resize Handling via ResizeObserver & Window Resize
    const updateSize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(currentMount);
    window.addEventListener("resize", updateSize);

    // 10. Animation Loop
    let animationId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera / group parallax
      if (!isDragging) {
        universeGroup.rotation.x += (targetX - universeGroup.rotation.x) * 0.06;
        universeGroup.rotation.y += (targetY - universeGroup.rotation.y) * 0.06;
      }

      // Continuous rhythmic rotations
      gemGroup.rotation.y = elapsed * 0.45;
      gemGroup.rotation.z = Math.sin(elapsed * 0.5) * 0.2;
      innerGem.rotation.y = -elapsed * 0.9;
      innerGem.rotation.x = elapsed * 0.35;

      ring1.rotation.z = elapsed * 0.25;
      ring2.rotation.y = -elapsed * 0.35;
      ring3.rotation.x = elapsed * 0.4;

      // Floating gentle bobbing
      universeGroup.position.y = Math.sin(elapsed * 1.6) * 0.15;

      // Update orbiting satellites & laser lines
      satellites.forEach((sat, index) => {
        const curAngle = sat.phase + elapsed * sat.speed;
        const x = Math.cos(curAngle) * sat.orbitRadius;
        const y = Math.sin(curAngle * 1.8 + index) * 0.75;
        const z = Math.sin(curAngle) * sat.orbitRadius;
        sat.mesh.position.set(x, y, z);

        // Update line vertices
        const posAttr = sat.line.geometry.attributes.position;
        posAttr.setXYZ(0, 0, 0, 0);
        posAttr.setXYZ(1, x, y, z);
        posAttr.needsUpdate = true;
      });

      // Swirl particle nebula
      particleField.rotation.y = elapsed * 0.08;
      particleField.rotation.x = Math.sin(elapsed * 0.05) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    const interval = setInterval(() => {
      setHudStats((prev) => ({
        tokensPerSec: Math.floor(740 + Math.random() * 35),
        latency: Math.floor(12 + Math.random() * 3),
        vectorDim: 768,
        activeNodes: Math.floor(11 + Math.random() * 3),
      }));
    }, 2500);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(interval);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      currentMount.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", updateSize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Floating HUD Badges */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a0e1e]/85 border border-[#00d4b6]/40 backdrop-blur-md shadow-md">
        <div className="w-2 h-2 rounded-full bg-[#00d4b6] animate-pulse" />
        <span className="text-[11px] font-mono font-semibold text-[#00d4b6] tracking-wide">
          Vector Engine: 768-D Live
        </span>
      </div>

      <div className="absolute top-3 right-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a0e1e]/85 border border-[#635bff]/40 backdrop-blur-md shadow-md">
        <Cpu className="w-3.5 h-3.5 text-[#635bff] animate-pulse" />
        <span className="text-[11px] font-mono text-slate-300">
          Inference: <strong className="text-[#00d4b6]">{hudStats.tokensPerSec} tps</strong>
        </span>
      </div>

      <div className="absolute bottom-3 left-4 z-10 hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#070913]/90 border border-white/10 backdrop-blur-md text-[11px] font-mono text-slate-300">
        <span className="flex items-center gap-1.5 text-[#00d4b6]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4b6] animate-pulse" />
          <span>Latency: {hudStats.latency}ms</span>
        </span>
        <span className="text-white/20">|</span>
        <span>Active Nodes: {hudStats.activeNodes}</span>
      </div>

      {/* 3D WebGL Canvas Mount with explicit min-height */}
      <div 
        ref={mountRef} 
        className="w-full h-full min-h-[360px] cursor-grab active:cursor-grabbing relative z-0" 
      />

      {/* Drag Hint Footer */}
      <div className="absolute bottom-3 right-4 pointer-events-none hidden sm:block">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-[#0a0e1e]/80 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
          ✦ Interactive 3D Vector Gyroscope
        </span>
      </div>
    </div>
  );
}
