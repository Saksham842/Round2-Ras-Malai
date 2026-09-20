---
name: ui-ux-pro-max
description: >-
  UI/UX design intelligence and design system engineering for web and modern interfaces.
  Covers 60+ UI styles (Glassmorphism, Cyberpunk/Dark Cyber, Bento Grid, Neumorphism),
  190+ harmonious color palettes, typography pairings, WCAG 2.1 AA accessibility rules,
  touch & interaction timing, responsive layouts, and motion design guidelines.
  Use when designing, refactoring, or styling pages, components, and design systems.
---

# UI/UX Pro Max — Design Intelligence & System Engineering

## Overview
This skill provides automated design intelligence and reasoning frameworks to transform generic interfaces into stunning, high-converting, accessible user experiences. It prevents common AI aesthetic blind spots (such as generic browser defaults, low-contrast grays, jarring zero-duration transitions, and missing hover/focus states).

---

## 1. Core Visual Design Hierarchy & Golden Rules

### The 60-30-10 Color Balance Rule
- **60% Dominant Base**: Neutral deep canvas (e.g., `#050a0f` obsidian cyber-bg, or `#0c1520` elevated surface).
- **30% Secondary Structure**: Structural cards, borders, navigation chrome, and subdued typography (e.g., `#1f334a` borders, `#94a3b8` slate text).
- **10% High-Energy Accent**: Action buttons, active badges, laser beam highlights, and score meters (e.g., `#14b8a6` Teal primary, `#10b981` Emerald success).

### Typography Scale & Font Pairing
Never use standard uncurated browser sans-serifs.
- **Headings / Display**: *Outfit*, *Space Grotesk*, or *Inter* (semibold 600 or extrabold 800, tight line-height `leading-[1.15]`, slight negative tracking `-0.02em`).
- **Body & UI**: *Inter* or system stack with optimal reading line-height (`leading-relaxed` 1.5 - 1.6), minimum 15px-16px.
- **Data / Code / Scores**: *JetBrains Mono*, *Fira Code*, or *Menlo* for issue IDs, timestamps, and confidence scores.

---

## 2. Priority UX Rules Matrix (1 → 10)

| Priority | Domain | Key Requirements (Must-Haves) | Anti-Patterns (Avoid) |
|---|---|---|---|
| **1. Accessibility (WCAG AA)** | `ux` | 4.5:1 text contrast ratio (3:1 for large text), visible keyboard focus rings (`focus-visible:ring-2`), aria-labels on icon buttons. | Removing focus outlines completely, gray text on dark gray, icon-only buttons with no accessible name. |
| **2. Touch & Hit Targets** | `ux` | Minimum target size 44×44px, minimum 8px gap between clickable elements, immediate visual feedback on `:active`. | Tiny 16px clickable icons without padding, reliance on hover on touch devices. |
| **3. Performance & CLS** | `ux` | Reserve layout space for dynamic images/components to prevent Cumulative Layout Shift (CLS < 0.1), use skeleton loaders. | Jarring layout pops when async data resolves, unoptimized image assets. |
| **4. Style Cohesion** | `style` | Stick to one cohesive visual identity (e.g., Dark Cyber Glassmorphism); use SVG icons (Lucide/Heroicons), never emojis as functional UI icons. | Mixing skeuomorphic drop shadows with flat minimal controls, mixing mismatched icon weights. |
| **5. Responsive Breakpoints** | `layout` | Mobile-first breakpoints (`sm`, `md`, `lg`, `xl`), zero horizontal overflow, fluid padding (`px-4 sm:px-6 lg:px-8`). | Hardcoded pixel widths (`w-[1200px]`), unhandled table or card overflow on mobile. |
| **6. Micro-Interactions** | `motion` | Context-aware timing: 150ms for buttons, 250-350ms for modal/drawers, spring ease (`cubic-bezier(0.16, 1, 0.3, 1)`). Respect `prefers-reduced-motion`. | Instant 0ms jarring jumps, sluggish 800ms+ animations for simple button hovers. |
| **7. Forms & Inputs** | `ux` | Explicit persistent labels, inline validation errors positioned adjacent to the invalid input, autofocus on first field. | Placeholder text used as the only label, alert dialogs for form validation errors. |
| **8. State Completeness** | `ux` | Every interactive component must handle: Default, Hover, Active, Focus-visible, Loading, Disabled, and Empty states. | Buttons that don't indicate loading when clicked, empty lists that show blank white space. |

---

## 3. Curated Style Palettes & CSS Implementations

### Style A: Dark Cyber / Dev Tool (Contrib Compass Standard)
```css
:root {
  --bg-primary: #050a0f;
  --bg-surface: #0c1520;
  --bg-card: #111d2c;
  --border-subtle: #1f334a;
  --accent-teal: #14b8a6;
  --accent-cyan: #06b6d4;
  --accent-emerald: #10b981;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
}

/* Glassmorphism Panel */
.glass-cyber-panel {
  background: rgba(12, 21, 32, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(31, 51, 74, 0.8);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

/* Glowing Border Accent on Hover */
.cyber-glow-card {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-subtle);
}
.cyber-glow-card:hover {
  border-color: rgba(45, 212, 191, 0.5);
  box-shadow: 0 0 25px -5px rgba(20, 184, 166, 0.3);
  transform: translateY(-2px);
}
```

### Style B: Bento Grid Layout
Use asymmetrical Bento grids to showcase varied data densities:
```jsx
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[220px]">
  {/* Hero Card (Double Span) */}
  <div className="col-span-1 md:col-span-2 row-span-2 glass-cyber-panel rounded-2xl p-6 relative overflow-hidden">
    <div className="text-xl font-bold text-white mb-2">AI Semantic Triager</div>
    <p className="text-sm text-slate-400">Classifies issues across difficulty, effort, and skills in &lt;400ms.</p>
  </div>

  {/* Metric 1 */}
  <div className="col-span-1 glass-cyber-panel rounded-2xl p-6 flex flex-col justify-between">
    <span className="text-xs font-mono text-compass-400 uppercase tracking-wider">Ingestion Speed</span>
    <span className="text-4xl font-extrabold text-white">350<span className="text-emerald-400 text-lg"> tok/s</span></span>
  </div>

  {/* Metric 2 */}
  <div className="col-span-1 glass-cyber-panel rounded-2xl p-6 flex flex-col justify-between">
    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Matching Accuracy</span>
    <span className="text-4xl font-extrabold text-white">94.8%</span>
  </div>
</div>
```

---

## 4. UI Quality Checklist (Pre-Delivery Audit)

Before marking any UI task complete, audit against this checklist:
- [ ] **Contrast Check**: All body text meets at least 4.5:1 contrast against its background.
- [ ] **State Coverage**: Test default, hover, active, focus-visible, and disabled states for all buttons.
- [ ] **Empty States**: If a list or search has 0 items, display a helpful illustration, friendly text, and a CTA.
- [ ] **Error Boundaries**: Network failure or bad inputs show descriptive inline errors, not a white screen or silent freeze.
- [ ] **Motion Performance**: Animations use GPU-accelerated properties (`transform`, `opacity`), never animating layout triggers (`width`, `height`, `top`).
- [ ] **Touch Targets**: All clickable items have at least 44px hit dimensions on mobile screens.
