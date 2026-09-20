---
name: frontend-architecture
description: >-
  Complete guide for the Contrib Compass Next.js 14 frontend (Dev C role).
  Covers Three.js 3D WebGL compass canvas, GSAP 3 interactive visualizer timelines,
  Framer Motion transitions, dark cyber design system tokens, and dual-mode (Live vs Mock) API resilience.
  Use when building, debugging, or styling frontend pages, animations, and components.
---

# Dev C: Frontend / UI / Motion — Contrib Compass

## Stack
- **Framework**: Next.js 14 (App Router, JavaScript/JSX)
- **Styling**: Tailwind CSS 3.4 with custom `compass` & `cyber` themes, Vanilla CSS utilities (`cyber-grid`, glassmorphism)
- **3D Graphics**: Three.js (`three` 0.169+) with dynamic client-side loading (`ssr: false`)
- **Animations**: GSAP 3.12 (Timelines, score counters, laser beam SVGs) & Framer Motion 11
- **Icons**: Lucide React (`lucide-react`)
- **State & Data**: Dual-mode client (`lib/api.js`) with automatic fallback to `lib/mockData.js`

---

## CRITICAL Rule: Dev C Boundary
Dev C writes **ONLY outside the `server/` directory**. Never create or modify files in `server/`.
```
/ (repo root)
├── app/                  ← Dev C ONLY (Next.js App Router)
│   ├── page.jsx          ← Landing page (Hero + 3D Compass + Bento Grid)
│   ├── connect/page.jsx  ← Connect GitHub repo URL / Preset selector
│   ├── match/page.jsx    ← Contributor skills matching & GSAP visualizer
│   ├── maintainer/page.jsx ← Triage workbench & label correction feedback
│   ├── dashboard/page.jsx← Contributor saved matches & progress
│   ├── login/page.jsx    ← GitHub OAuth redirect handler
│   ├── layout.jsx        ← Root shell (Navbar, Footer, Providers)
│   └── globals.css       ← Cyber-grid, glowing borders, custom scrollbars
├── components/           ← Dev C ONLY
│   ├── CompassCanvas3D.jsx ← Three.js 3D interactive WebGL compass
│   ├── GSAPMatchVisualizer.jsx ← GSAP animated skill-to-issue laser connector
│   ├── IssueCard.jsx     ← Standardized issue card with difficulty badges
│   ├── Navbar.jsx        ← Navigation, status indicator, mock mode toggle
│   └── Footer.jsx        ← Hackathon credits, links, API status
├── lib/                  ← Dev C ONLY
│   ├── api.js            ← API client with live/mock fallback & token storage
│   ├── mockData.js       ← Deterministic mock users, repos, issues & matches
│   └── utils.js          ← Class name merger (`cn`), date formatters
└── public/               ← Dev C ONLY (Static assets)
```

---

## 1. Three.js 3D Compass Implementation (`components/CompassCanvas3D.jsx`)

The 3D Compass is the visual centerpiece on the landing hero. It represents directional orientation toward open-source contributions.

### Key Architecture & Memory Safety Rules:
1. **Dynamic Import with `ssr: false`**: WebGL relies on browser `window` and `HTMLCanvasElement`. In `app/page.jsx`, always import dynamically:
   ```jsx
   const CompassCanvas3D = dynamic(() => import("../components/CompassCanvas3D"), {
     ssr: false,
     loading: () => <CompassSkeletonLoader />,
   });
   ```
2. **WebGL Context & Memory Disposal**: Always clean up geometries, materials, textures, and cancel `requestAnimationFrame` on unmount to prevent WebGL context loss and memory leaks.
3. **Mouse Parallax & Inertia**: Use smooth lerp (`current += (target - current) * 0.05`) for subtle cursor tracking without jarring jumps.

### Implementation Pattern:
```jsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CompassCanvas3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);

    // Renderer with Alpha transparency and high DPI support
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for entire compass to rotate together
    const compassGroup = new THREE.Group();
    scene.add(compassGroup);

    // Outer Ring (Torus)
    const ringGeo = new THREE.TorusGeometry(2.4, 0.06, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x14b8a6, // Compass Teal
      emissive: 0x0f766e,
      roughness: 0.3,
      metalness: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    compassGroup.add(ring);

    // Compass Needle (Dual Cones: North Teal, South Slate)
    const northConeGeo = new THREE.ConeGeometry(0.25, 2.0, 16);
    northConeGeo.translate(0, 1.0, 0);
    const northConeMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x14b8a6,
      roughness: 0.2,
      metalness: 0.9,
    });
    const northNeedle = new THREE.Mesh(northConeGeo, northConeMat);
    compassGroup.add(northNeedle);

    const southConeGeo = new THREE.ConeGeometry(0.25, 2.0, 16);
    southConeGeo.translate(0, -1.0, 0);
    southConeGeo.rotateZ(Math.PI);
    const southConeMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5,
      metalness: 0.5,
    });
    const southNeedle = new THREE.Mesh(southConeGeo, southConeMat);
    compassGroup.add(southNeedle);

    // Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const tealLight = new THREE.PointLight(0x2dd4bf, 2, 20);
    tealLight.position.set(3, 3, 4);
    scene.add(tealLight);

    // Particles (Floating Starfield / Sparks)
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Tracking with Lerp
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.4;
      targetY = y * 0.4;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      compassGroup.rotation.y = mouseX + Math.sin(elapsed * 0.6) * 0.15;
      compassGroup.rotation.x = -mouseY + Math.cos(elapsed * 0.5) * 0.1;
      particles.rotation.y = elapsed * 0.03;

      renderer.render(scene, camera);
    };
    animate();

    // CLEANUP
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      northConeGeo.dispose();
      northConeMat.dispose();
      southConeGeo.dispose();
      southConeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[360px] md:h-[460px] cursor-grab active:cursor-grabbing"
    />
  );
}
```

---

## 2. GSAP Match Visualizer Architecture (`components/GSAPMatchVisualizer.jsx`)

When contributors run matching, the GSAP visualizer dynamically connects the contributor's skill tags to matched issues via animated laser beams and reveals scores with synchronized counters.

### Best Practices:
1. **`useIsomorphicLayoutEffect`**: Avoids Next.js SSR hydration warnings when referencing DOM nodes.
2. **`gsap.context()`**: Scopes all animations to a root ref. When the component unmounts or re-renders with new matches, `ctx.revert()` cleanly removes all tweens and prevents memory leaks.
3. **Score Bar Tweening**: Animate `width: 0% → X%` while tweening an inner state integer counter (`0 → score`) via GSAP's `onUpdate`.
4. **Confetti Climax**: Trigger `canvas-confetti` when a 90%+ match is reached.

### SVG Laser Beam Blueprint:
```jsx
{/* Laser Beams connecting Contributor card to each matched Issue card */}
<svg ref={beamSvgRef} className="absolute inset-0 pointer-events-none w-full h-full">
  {matches.slice(0, 3).map((match, i) => (
    <path
      key={match.issue.id}
      className="laser-beam"
      d={`M 180,${80 + i * 40} C 260,${80 + i * 40} 320,${60 + i * 110} 400,${60 + i * 110}`}
      fill="none"
      stroke="url(#beam-gradient)"
      strokeWidth="2"
      strokeDasharray="8 4"
    />
  ))}
  <defs>
    <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
      <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
      <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
    </linearGradient>
  </defs>
</svg>
```

---

## 3. Cyber & Compass Design System

Contrib Compass uses a custom developer aesthetic inspired by modern cyber tools (Raycast, Linear, Vercel).

### Tailwind Tokens (`tailwind.config.js`):
- `compass-400`: `#2dd4bf` (Teal accent / active state)
- `compass-500`: `#14b8a6` (Brand primary)
- `cyber-bg`: `#050a0f` (Deep obsidian background)
- `cyber-surface`: `#0c1520` (Elevated cards and inputs)
- `cyber-border`: `#1f334a` (Subtle 1px borders)
- `cyber-accent`: `#10b981` (Emerald green for High Confidence / Easy)

### Reusable CSS Utilities (`app/globals.css`):
```css
/* Background cyber grid */
.cyber-grid {
  background-size: 40px 40px;
  background-image: 
    linear-gradient(to right, rgba(31, 51, 74, 0.25) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(31, 51, 74, 0.25) 1px, transparent 1px);
}

.cyber-grid-radial {
  mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
}

/* Glassmorphic card */
.glass-panel {
  background: rgba(12, 21, 32, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(31, 51, 74, 0.8);
}

/* Glowing border hover */
.glow-on-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.glow-on-hover:hover {
  border-color: rgba(45, 212, 191, 0.6);
  box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.3);
}
```

---

## 4. Dual-Mode Resilience Architecture (Live Backend + Mock Fallback)

In hackathons, backends spin down or encounter rate limits. The frontend client (`lib/api.js`) must NEVER crash the user experience:

1. **Auto-fallback on Failure**: When any fetch throws (Render spinning up, 502/504, or network failure), catch the error, log a warning, and return pre-computed high-fidelity data from `lib/mockData.js`.
2. **Force Mock Mode Toggle**: A toggle in the Navbar or `localStorage.getItem("contrib_force_mock")` allows judges or presenters to force 100% instantaneous, deterministic offline mode.
3. **Session Token Management**: Store JWT in `localStorage` as `contrib_session_token`. If live auth fails, store a mock token (`gh_mock_sess_...`) so routing to protected pages (`/dashboard`, `/maintainer`) succeeds immediately.

---

## 5. Standard Component Props Contracts

### `IssueCard.jsx`
```jsx
<IssueCard
  issue={{
    id: "iss_101",
    repoName: "facebook/react",
    number: 28412,
    title: "Support async Transitions in Suspense siblings",
    body: "Markdown body...",
    url: "https://github.com/facebook/react/issues/28412",
    labels: {
      difficulty: "Advanced", // "Easy" | "Intermediate" | "Advanced"
      skillArea: "React / State",
      effort: "1-2 days",
      confidence: 0.94
    },
    commentsCount: 14,
    createdAt: "2026-09-18T10:00:00Z"
  }}
  isInteractive={true}
  onSelect={(issue) => ...}
  showScore={92}
  matchReason="Matches your React skills and async debugging experience"
/>
```

### Difficulty Badge Color Rules:
- **Easy**: `bg-emerald-500/10 text-emerald-400 border-emerald-500/30`
- **Intermediate**: `bg-amber-500/10 text-amber-400 border-amber-500/30`
- **Advanced**: `bg-rose-500/10 text-rose-400 border-rose-500/30`
