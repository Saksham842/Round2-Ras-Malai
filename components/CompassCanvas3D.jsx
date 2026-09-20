"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CompassCanvas3D({ className = "w-full h-[450px]" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Group for entire compass
    const compassGroup = new THREE.Group();
    scene.add(compassGroup);

    // 1. Outer Ring
    const ring1Geo = new THREE.TorusGeometry(2.4, 0.025, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x14b8a6, // Teal
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    compassGroup.add(ring1);

    // 2. Middle Ring with Cyan Tint
    const ring2Geo = new THREE.TorusGeometry(1.8, 0.02, 16, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Cyan
      transparent: true,
      opacity: 0.6,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    compassGroup.add(ring2);

    // 3. Inner Ring with Emerald
    const ring3Geo = new THREE.TorusGeometry(1.2, 0.015, 16, 60);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Emerald
      transparent: true,
      opacity: 0.5,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 4;
    compassGroup.add(ring3);

    // 4. Central Holographic Core (Octahedron / Compass Diamond)
    const coreGeo = new THREE.OctahedronGeometry(0.65, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x0f766e,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    compassGroup.add(core);

    // 5. Compass Needle Axis
    const needleGeo = new THREE.ConeGeometry(0.18, 1.4, 8);
    const needleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
    });
    const needleNorth = new THREE.Mesh(needleGeo, needleMat);
    needleNorth.position.y = 0.7;
    compassGroup.add(needleNorth);

    const needleSouthMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      wireframe: true,
    });
    const needleSouth = new THREE.Mesh(needleGeo, needleSouthMat);
    needleSouth.position.y = -0.7;
    needleSouth.rotation.z = Math.PI;
    compassGroup.add(needleSouth);

    // 6. Glowing Particle Cloud
    const particleCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 8;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x5eead4,
      transparent: true,
      opacity: 0.7,
    });
    const particleField = new THREE.Points(particlesGeo, particleMat);
    scene.add(particleField);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x14b8a6, 2, 50);
    pointLight.position.set(4, 4, 4);
    scene.add(pointLight);

    // Mouse Interaction
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      const rect = currentMount.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = x * 0.0015;
      mouseY = y * 0.0015;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth rotate towards target
      targetRotationY += (mouseX - targetRotationY) * 0.05;
      targetRotationX += (mouseY - targetRotationX) * 0.05;

      compassGroup.rotation.y = targetRotationY + elapsedTime * 0.25;
      compassGroup.rotation.x = targetRotationX + Math.sin(elapsedTime * 0.5) * 0.1;

      // Internal rings counter-rotation
      ring1.rotation.z = elapsedTime * 0.15;
      ring2.rotation.y = -elapsedTime * 0.3;
      ring3.rotation.x = elapsedTime * 0.4;
      core.rotation.y = -elapsedTime * 0.6;
      core.rotation.z = elapsedTime * 0.3;

      // Float effect
      compassGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;

      // Particle gentle swirl
      particleField.rotation.y = elapsedTime * 0.05;

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
      <div className="absolute inset-0 bg-gradient-radial from-compass-500/15 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
