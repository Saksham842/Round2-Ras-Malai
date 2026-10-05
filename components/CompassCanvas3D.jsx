"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Activity, Cpu, Sparkles, Terminal, Cloud, ShieldCheck } from "lucide-react";

export default function CompassCanvas3D({ className = "w-full h-[480px]" }) {
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

    // 1. Scene, Camera, High-performance Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    currentMount.appendChild(renderer.domElement);

    // Main 3D Container Group
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

    // 2. Render.com Official Signature Colors
    const RENDER_CYAN = 0x00e5ff;
    const RENDER_INDIGO = 0x6366f1;
    const RENDER_VIOLET = 0x8b5cf6;
    const RENDER_PINK = 0xf43f5e;
    const RENDER_EMERALD = 0x10b981;

    // 3. Central Crystalline Deployment Polyhedron (Render Iconic Crystal)
    const gemGroup = new THREE.Group();
    universeGroup.add(gemGroup);

    // Outer Geodesic / Icosahedron Hologram Cage
    const outerGeo = new THREE.IcosahedronGeometry(1.25, 1);
    const outerMat = new THREE.MeshStandardMaterial({
      color: RENDER_CYAN,
      emissive: 0x071e33,
      roughness: 0.15,
      metalness: 0.9,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const outerGem = new THREE.Mesh(outerGeo, outerMat);
    gemGroup.add(outerGem);

    // Inner Faceted Core Gem (Render Violet / Indigo Crystalline Center)
    const innerGeo = new THREE.OctahedronGeometry(0.78, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: RENDER_INDIGO,
      emissive: 0x312e81,
      roughness: 0.1,
      metalness: 0.95,
      wireframe: false,
    });
    const innerGem = new THREE.Mesh(innerGeo, innerMat);
    gemGroup.add(innerGem);

    // 4. Tri-Ring Precision Gimbal (Render Electric Rings)
    const ringGroup = new THREE.Group();
    universeGroup.add(ringGroup);

    // Outer Render Cyan Laser Ring
    const ring1Geo = new THREE.TorusGeometry(2.5, 0.022, 16, 120);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: RENDER_CYAN,
      transparent: true,
      opacity: 0.8,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ringGroup.add(ring1);

    // Middle Render Indigo Ring (Tilted 55 deg)
    const ring2Geo = new THREE.TorusGeometry(2.1, 0.02, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: RENDER_INDIGO,
      transparent: true,
      opacity: 0.75,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3.2;
    ringGroup.add(ring2);

    // Inner Render Violet Ring (Tilted 70 deg)
    const ring3Geo = new THREE.TorusGeometry(1.68, 0.018, 16, 80);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: RENDER_VIOLET,
      transparent: true,
      opacity: 0.7,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 2.8;
    ringGroup.add(ring3);

    // 5. Render Service Satellites (Representing Deployed Microservices & Repos)
    const satellites = [];
    const satelliteCount = 6;
    const satelliteColors = [RENDER_CYAN, RENDER_INDIGO, RENDER_VIOLET, RENDER_CYAN, RENDER_PINK, RENDER_EMERALD];

    for (let i = 0; i < satelliteCount; i++) {
      const satGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const satMat = new THREE.MeshStandardMaterial({
        color: satelliteColors[i],
        emissive: satelliteColors[i],
        emissiveIntensity: 0.7,
        roughness: 0.2,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      
      const orbitRadius = 2.8 + (i % 3) * 0.42;
      const angle = (i / satelliteCount) * Math.PI * 2;
      satMesh.position.set(Math.cos(angle) * orbitRadius, Math.sin(angle * 2) * 0.8, Math.sin(angle) * orbitRadius);

      // Render Laser Fiber Line linking satellite to core
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        satMesh.position,
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: satelliteColors[i],
        transparent: true,
        opacity: 0.25,
      });
      const lineMesh = new THREE.Line(lineGeo, lineMat);

      universeGroup.add(satMesh);
      universeGroup.add(lineMesh);

      satellites.push({
        mesh: satMesh,
        line: lineMesh,
        orbitRadius,
        speed: 0.38 + (i * 0.1),
        phase: angle,
      });
    }

    // 6. Glowing Render Particle Cloud (400 points)
    const particleCount = 420;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cCyan = new THREE.Color(RENDER_CYAN);
    const cIndigo = new THREE.Color(RENDER_INDIGO);
    const cViolet = new THREE.Color(RENDER_VIOLET);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.3 + Math.random() * 4.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);

      const colorPick = Math.random();
      const chosenColor = colorPick > 0.6 ? cCyan : colorPick > 0.3 ? cIndigo : cViolet;
      colors[i] = chosenColor.r;
      colors[i + 1] = chosenColor.g;
      colors[i + 2] = chosenColor.b;
    }

    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleField = new THREE.Points(particlesGeo, particleMat);
    scene.add(particleField);

    // 7. Render Atmospheric Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(RENDER_CYAN, 4.0, 35);
    cyanPoint.position.set(4, 5, 4);
    scene.add(cyanPoint);

    const indigoPoint = new THREE.PointLight(RENDER_INDIGO, 4.0, 35);
    indigoPoint.position.set(-4, -4, 4);
    scene.add(indigoPoint);

    const violetRim = new THREE.DirectionalLight(RENDER_VIOLET, 2.2);
    violetRim.position.set(0, 6, -5);
    scene.add(violetRim);

    // 8. Mouse Parallax & Dynamic Dragging
    let targetX = 0;
    let targetY = 0;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseMove = (e) => {
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

    window.addEventListener("mousemove", handleMouseMove);
    currentMount.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // 9. Resize Handling
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

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
      window.removeEventListener("mousemove", handleMouseMove);
      currentMount.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Render Signature Cyan & Indigo Aurora Orbs */}
      <div className="absolute w-72 h-72 rounded-full aurora-orb-cyan top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute w-80 h-80 rounded-full aurora-orb-indigo bottom-1/4 right-1/4 translate-x-1/4 translate-y-1/4" />
      <div className="absolute w-64 h-64 rounded-full aurora-orb-violet top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Floating Render Dashboard HUD Badges */}
      <div className="absolute top-2 left-3 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d101d]/90 border border-render-cyan/40 backdrop-blur-md shadow-glow-render">
        <div className="w-2 h-2 rounded-full bg-render-cyan animate-ping" />
        <span className="text-[11px] font-mono font-semibold text-render-cyan tracking-wide">
          Vector Engine: 768-D Live
        </span>
      </div>

      <div className="absolute top-2 right-3 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d101d]/90 border border-render-indigo/40 backdrop-blur-md shadow-glow-indigo">
        <Cpu className="w-3.5 h-3.5 text-render-indigo animate-pulse" />
        <span className="text-[11px] font-mono text-slate-300">
          Inference: <strong className="text-render-cyan">{hudStats.tokensPerSec} tps</strong>
        </span>
      </div>

      <div className="absolute bottom-2 left-4 z-10 hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#08090f]/80 border border-render-border backdrop-blur-md text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 text-render-emerald">
          <span className="w-1.5 h-1.5 rounded-full bg-render-emerald animate-pulse" />
          <span>Latency: {hudStats.latency}ms</span>
        </span>
        <span className="text-white/20">|</span>
        <span className="text-render-cyan">Nodes Active: {hudStats.activeNodes}</span>
      </div>

      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing relative z-0" />

      {/* Render Drag Hint Footer */}
      <div className="absolute -bottom-1 pointer-events-none text-center">
        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 bg-[#0d101d]/90 px-3 py-1 rounded-full border border-render-border backdrop-blur-md">
          ✦ Click &amp; Drag 3D Vector Compass • Render WebGL Runtime
        </span>
      </div>
    </div>
  );
}
