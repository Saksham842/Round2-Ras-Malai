"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Activity, Cpu, Sparkles, Terminal } from "lucide-react";

export default function CompassCanvas3D({ className = "w-full h-[480px]" }) {
  const mountRef = useRef(null);
  const [hudStats, setHudStats] = useState({
    tokensPerSec: 748,
    latency: 14,
    vectorDim: 768,
    activeNodes: 12,
  });

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. Scene, Camera, Renderer
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
    renderer.toneMappingExposure = 1.2;
    currentMount.appendChild(renderer.domElement);

    // Main 3D Container Group
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

    // 2. MongoDB & Render Signature Colors
    const MONGO_GREEN = 0x00ed64;
    const RENDER_CYAN = 0x00f5ff;
    const RENDER_VIOLET = 0x8b5cf6;
    const EMERALD_DEEP = 0x00684a;

    // 3. Central Crystalline Core (Icosahedron + Octahedron nested gem)
    const gemGroup = new THREE.Group();
    universeGroup.add(gemGroup);

    const outerGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const outerMat = new THREE.MeshStandardMaterial({
      color: RENDER_CYAN,
      emissive: 0x022c3e,
      roughness: 0.15,
      metalness: 0.85,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const outerGem = new THREE.Mesh(outerGeo, outerMat);
    gemGroup.add(outerGem);

    const innerGeo = new THREE.OctahedronGeometry(0.75, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: MONGO_GREEN,
      emissive: EMERALD_DEEP,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: false,
    });
    const innerGem = new THREE.Mesh(innerGeo, innerMat);
    gemGroup.add(innerGem);

    // 4. Dual Rotating Energy Gimbal Rings
    const ringGroup = new THREE.Group();
    universeGroup.add(ringGroup);

    // Outer MongoDB Green Ring
    const ring1Geo = new THREE.TorusGeometry(2.5, 0.022, 16, 120);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: MONGO_GREEN,
      transparent: true,
      opacity: 0.75,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ringGroup.add(ring1);

    // Render Electric Cyan Ring (Tilted 55 deg)
    const ring2Geo = new THREE.TorusGeometry(2.1, 0.02, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: RENDER_CYAN,
      transparent: true,
      opacity: 0.7,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3.2;
    ringGroup.add(ring2);

    // Render Violet Ring (Tilted 70 deg)
    const ring3Geo = new THREE.TorusGeometry(1.65, 0.018, 16, 80);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: RENDER_VIOLET,
      transparent: true,
      opacity: 0.65,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 2.8;
    ringGroup.add(ring3);

    // 5. Orbital Satellites (Representing OSS Issue Nodes)
    const satellites = [];
    const satelliteCount = 6;
    const satelliteColors = [MONGO_GREEN, RENDER_CYAN, 0x10b981, 0x38bdf8, 0xa855f7, 0x00ed64];

    for (let i = 0; i < satelliteCount; i++) {
      const satGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const satMat = new THREE.MeshStandardMaterial({
        color: satelliteColors[i],
        emissive: satelliteColors[i],
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      
      const orbitRadius = 2.8 + (i % 3) * 0.4;
      const angle = (i / satelliteCount) * Math.PI * 2;
      satMesh.position.set(Math.cos(angle) * orbitRadius, (Math.sin(angle * 2) * 0.8), Math.sin(angle) * orbitRadius);

      // Link laser line connecting satellite to core
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        satMesh.position,
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: satelliteColors[i],
        transparent: true,
        opacity: 0.22,
      });
      const lineMesh = new THREE.Line(lineGeo, lineMat);

      universeGroup.add(satMesh);
      universeGroup.add(lineMesh);

      satellites.push({
        mesh: satMesh,
        line: lineMesh,
        orbitRadius,
        speed: 0.4 + (i * 0.12),
        phase: angle,
      });
    }

    // 6. Glowing Particle Nebula (350 points)
    const particleCount = 380;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(MONGO_GREEN);
    const c2 = new THREE.Color(RENDER_CYAN);
    const c3 = new THREE.Color(RENDER_VIOLET);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.2 + Math.random() * 3.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);

      const chosenColor = Math.random() > 0.6 ? c1 : Math.random() > 0.3 ? c2 : c3;
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
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particleField = new THREE.Points(particlesGeo, particleMat);
    scene.add(particleField);

    // 7. Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(RENDER_CYAN, 3.5, 30);
    cyanPoint.position.set(4, 5, 4);
    scene.add(cyanPoint);

    const mongoPoint = new THREE.PointLight(MONGO_GREEN, 3.5, 30);
    mongoPoint.position.set(-4, -4, 4);
    scene.add(mongoPoint);

    const violetRim = new THREE.DirectionalLight(RENDER_VIOLET, 1.8);
    violetRim.position.set(0, 5, -5);
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
      innerGem.rotation.x = elapsed * 0.3;

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

      // Swirl particle galaxy
      particleField.rotation.y = elapsed * 0.08;
      particleField.rotation.x = Math.sin(elapsed * 0.05) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Minor telemetry flicker for high-tech realism
    const interval = setInterval(() => {
      setHudStats((prev) => ({
        tokensPerSec: Math.floor(730 + Math.random() * 45),
        latency: Math.floor(12 + Math.random() * 4),
        vectorDim: 768,
        activeNodes: Math.floor(10 + Math.random() * 5),
      }));
    }, 2400);

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
      {/* MongoDB Neon & Render Aurora Ambient Glows */}
      <div className="absolute w-72 h-72 rounded-full aurora-orb-mongo top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute w-72 h-72 rounded-full aurora-orb-render bottom-1/4 right-1/4 translate-x-1/4 translate-y-1/4" />
      <div className="absolute w-60 h-60 rounded-full aurora-orb-violet top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Floating Modern HUD Badges (MongoDB & Render Developer Style) */}
      <div className="absolute top-2 left-3 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#030d14]/80 border border-mongo-green/30 backdrop-blur-md shadow-glow-mongo">
        <div className="w-2 h-2 rounded-full bg-mongo-green animate-ping" />
        <span className="text-[11px] font-mono font-semibold text-mongo-green tracking-wide">
          Vector Engine: 768-D Live
        </span>
      </div>

      <div className="absolute top-2 right-3 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#060a18]/80 border border-render-cyan/30 backdrop-blur-md shadow-glow-render">
        <Cpu className="w-3.5 h-3.5 text-render-cyan animate-pulse" />
        <span className="text-[11px] font-mono text-slate-300">
          Groq Inference: <strong className="text-render-cyan">{hudStats.tokensPerSec} tps</strong>
        </span>
      </div>

      <div className="absolute bottom-2 left-4 z-10 hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Latency: {hudStats.latency}ms</span>
        </span>
        <span className="text-white/20">|</span>
        <span className="text-cyan-400">Nodes Active: {hudStats.activeNodes}</span>
      </div>

      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing relative z-0" />

      {/* Drag Hint Footer */}
      <div className="absolute -bottom-1 pointer-events-none text-center">
        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 bg-[#001e2b]/80 px-3 py-1 rounded-full border border-mongo-green/20 backdrop-blur-md">
          ✦ Click &amp; Drag 3D Vector Compass • Real-time WebGL
        </span>
      </div>
    </div>
  );
}
