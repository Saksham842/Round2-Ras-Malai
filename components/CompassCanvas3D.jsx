"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CompassCanvas3D({ className = "w-full h-[450px]" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Dimensions
    const width = currentMount.clientWidth || 440;
    const height = currentMount.clientHeight || 450;

    // 1. Scene, Camera, High-performance WebGL Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6.9;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Attach canvas cleanly
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.outline = "none";
    currentMount.appendChild(renderer.domElement);

    // Group for entire compass
    const compassGroup = new THREE.Group();
    scene.add(compassGroup);

    // Color definitions matching the original hackathon pitch and screenshot
    const COLOR_TEAL = 0x14b8a6;    // Bright Teal
    const COLOR_CYAN = 0x06b6d4;    // Vivid Cyan
    const COLOR_EMERALD = 0x10b981; // Emerald Green
    const COLOR_CORE = 0x2dd4bf;    // Crystalline Turquoise
    const COLOR_NORTH = 0x38bdf8;   // Electric Sky Blue / Cyan (North Needle)
    const COLOR_SOUTH = 0xf43f5e;   // Neon Rose / Coral Red (South Needle)
    const COLOR_PARTICLES = 0x5eead4; // Luminous Teal Star Dust

    // 1. Outer Torus Ring (Teal wireframe - outer circle in screenshot)
    const ring1Geo = new THREE.TorusGeometry(2.35, 0.024, 16, 120);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: COLOR_TEAL,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    compassGroup.add(ring1);

    // 2. Middle Gimbal Ring (Cyan tilted elliptical ring)
    const ring2Geo = new THREE.TorusGeometry(1.85, 0.02, 16, 90);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: COLOR_CYAN,
      transparent: true,
      opacity: 0.7,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3.1;
    compassGroup.add(ring2);

    // 3. Inner Gimbal Ring (Emerald tilted ring)
    const ring3Geo = new THREE.TorusGeometry(1.25, 0.016, 16, 70);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: COLOR_EMERALD,
      transparent: true,
      opacity: 0.6,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 3.8;
    compassGroup.add(ring3);

    // 4. Central Holographic Core (Octahedron / Compass Diamond Cage)
    const coreGeo = new THREE.OctahedronGeometry(0.65, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: COLOR_CORE,
      emissive: 0x0f766e,
      roughness: 0.2,
      metalness: 0.85,
      wireframe: true,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    compassGroup.add(core);

    // 5. Compass Needle Axis (Dual-cone magnetic needle)
    // North Cone (Pointing UP - Electric Cyan Wireframe)
    const needleNorthGeo = new THREE.ConeGeometry(0.18, 1.4, 8);
    const needleNorthMat = new THREE.MeshBasicMaterial({
      color: COLOR_NORTH,
      wireframe: true,
    });
    const needleNorth = new THREE.Mesh(needleNorthGeo, needleNorthMat);
    needleNorth.position.y = 0.7;
    compassGroup.add(needleNorth);

    // South Cone (Pointing DOWN - Neon Coral / Rose Wireframe)
    const needleSouthGeo = new THREE.ConeGeometry(0.18, 1.4, 8);
    const needleSouthMat = new THREE.MeshBasicMaterial({
      color: COLOR_SOUTH,
      wireframe: true,
    });
    const needleSouth = new THREE.Mesh(needleSouthGeo, needleSouthMat);
    needleSouth.position.y = -0.7;
    needleSouth.rotation.z = Math.PI;
    compassGroup.add(needleSouth);

    // Center Pivot Ring (Connecting the two cones at y = 0)
    const pivotRingGeo = new THREE.TorusGeometry(0.19, 0.02, 16, 32);
    const pivotRingMat = new THREE.MeshBasicMaterial({
      color: COLOR_SOUTH,
      transparent: true,
      opacity: 0.9,
    });
    const pivotRing = new THREE.Mesh(pivotRingGeo, pivotRingMat);
    pivotRing.rotation.x = Math.PI / 2;
    compassGroup.add(pivotRing);

    // 6. Glowing Starfield Particle Cloud
    const particleCount = 220;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8.5;
      positions[i + 1] = (Math.random() - 0.5) * 8.5;
      positions[i + 2] = (Math.random() - 0.5) * 8.5;
    }
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      color: COLOR_PARTICLES,
      transparent: true,
      opacity: 0.75,
    });
    const particleField = new THREE.Points(particlesGeo, particleMat);
    scene.add(particleField);

    // 7. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(COLOR_TEAL, 2.5, 50);
    pointLight.position.set(4, 4, 4);
    scene.add(pointLight);

    const cyanRim = new THREE.DirectionalLight(COLOR_CYAN, 1.2);
    cyanRim.position.set(-3, -2, 5);
    scene.add(cyanRim);

    // 8. Mouse Interaction with Smooth Inertia
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      const rect = currentMount.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = x * 0.0016;
      mouseY = y * 0.0016;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth rotate towards target mouse position
      targetRotationY += (mouseX - targetRotationY) * 0.055;
      targetRotationX += (mouseY - targetRotationX) * 0.055;

      compassGroup.rotation.y = targetRotationY + elapsedTime * 0.22;
      compassGroup.rotation.x = targetRotationX + Math.sin(elapsedTime * 0.5) * 0.09;

      // Internal rings counter-rotation
      ring1.rotation.z = elapsedTime * 0.14;
      ring2.rotation.y = -elapsedTime * 0.28;
      ring3.rotation.x = elapsedTime * 0.36;
      core.rotation.y = -elapsedTime * 0.55;
      core.rotation.z = elapsedTime * 0.28;

      // Gentle floating bob
      compassGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;

      // Particle gentle swirl
      particleField.rotation.y = elapsedTime * 0.045;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-radial from-compass-500/20 via-transparent to-transparent pointer-events-none rounded-full blur-3xl opacity-80" />
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
