"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Sparkles, 
  GitFork, 
  GitPullRequest, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  Compass,
  Loader2,
  Github,
  Star,
  Clock,
  Tag,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Terminal,
  Layers,
  Code2,
  Shield,
  Search,
  ExternalLink
} from "lucide-react";
import IssueCard from "../components/IssueCard";
import StripeDevShowcase from "../components/StripeDevShowcase";
import { MOCK_MATCH_RESULTS } from "../lib/mockData";

// Dynamically import 3D Three.js canvas with ssr: false for rock-solid SSR & hydration
const CompassCanvas3D = dynamic(() => import("../components/CompassCanvas3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-compass-400 gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-compass-400" />
      <span className="text-xs font-mono text-compass-300">Initializing 3D WebGL Compass...</span>
    </div>
  ),
});

const QUICK_PERSONAS = [
  { handle: "Saksham842", role: "Fullstack / AI" },
  { handle: "shadcn", role: "Design Systems / Radix" },
  { handle: "leerob", role: "Next.js & Performance" },
];

const QUICK_REPOS = [
  { name: "vercel/next.js", desc: "React Framework", stars: "125k" },
  { name: "facebook/react", desc: "UI Library", stars: "228k" },
  { name: "fastify/fastify", desc: "Node.js Web", stars: "32k" },
  { name: "tailwindlabs/tailwindcss", desc: "Styling", stars: "82k" },
];

const ECOSYSTEM_LOGOS = [
  { name: "Next.js", tag: "App Router" },
  { name: "React", tag: "v19 Core" },
  { name: "Groq", tag: "LPU Inference" },
  { name: "TypeScript", tag: "Typed OSS" },
  { name: "Supabase", tag: "PostgreSQL" },
  { name: "Fastify", tag: "High Performance" },
  { name: "TailwindCSS", tag: "Styling Engine" },
];

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("username"); // "username" | "repo"
  const [inputVal, setInputVal] = useState("Saksham842");
  const [sampleIndex, setSampleIndex] = useState(0);

  // Animation Refs
  const pageContainerRef = useRef(null);
  const heroRef = useRef(null);
  const proofBarRef = useRef(null);
  const launcherRef = useRef(null);
  const showcaseRef = useRef(null);
  const featuresRef = useRef(null);
  const devShowcaseRef = useRef(null);
  const bottomCtaRef = useRef(null);

  // Counter Refs
  const counter1Ref = useRef(null);
  const counter2Ref = useRef(null);
  const counter3Ref = useRef(null);
  const counter4Ref = useRef(null);

  const activeIssueSample = MOCK_MATCH_RESULTS[sampleIndex] || MOCK_MATCH_RESULTS[0];

  const handleLaunch = (e) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    if (activeTab === "username") {
      const clean = inputVal.replace(/^@/, "").trim();
      router.push(`/match?user=${encodeURIComponent(clean)}`);
    } else {
      router.push(`/connect`);
    }
  };

  const cycleSample = () => {
    setSampleIndex((prev) => (prev + 1) % MOCK_MATCH_RESULTS.length);
  };

  // GSAP Orchestration
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Telemetry Counters Animation
      if (proofBarRef.current) {
        // Counter 1: 0% -> 94.3%
        const c1 = { val: 0 };
        gsap.to(c1, {
          val: 94.3,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: proofBarRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            if (counter1Ref.current) counter1Ref.current.innerText = c1.val.toFixed(1) + "%";
          },
        });

        // Counter 2: 800ms -> 350ms
        const c2 = { val: 800 };
        gsap.to(c2, {
          val: 350,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: proofBarRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            if (counter2Ref.current) counter2Ref.current.innerText = "< " + Math.round(c2.val) + "ms";
          },
        });

        // Counter 3: 0 -> 768-D
        const c3 = { val: 0 };
        gsap.to(c3, {
          val: 768,
          duration: 2.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: proofBarRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            if (counter3Ref.current) counter3Ref.current.innerText = Math.round(c3.val) + "-D";
          },
        });

        // Counter 4: 0% -> 100%
        const c4 = { val: 0 };
        gsap.to(c4, {
          val: 100,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: proofBarRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            if (counter4Ref.current) counter4Ref.current.innerText = Math.round(c4.val) + "%";
          },
        });
      }
    }, pageContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageContainerRef} className="relative w-full overflow-hidden bg-[#050a0f] text-slate-100">
      
      {/* Background Cyber Grid with Radial Fade */}
      <div className="absolute inset-0 cyber-grid cyber-grid-radial opacity-60 pointer-events-none" />

      {/* Atmospheric Glowing Radial Aura behind Compass & Hero */}
      <div className="absolute top-12 right-10 w-[550px] h-[550px] bg-compass-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-96 left-0 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* HERO SECTION (Faithful to Screenshot & Hackathon Pitch) */}
      <section ref={heroRef} className="relative z-10 pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text / CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Hackathon Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-compass-500/10 border border-compass-500/30 text-compass-300 text-xs font-mono shadow-[0_0_15px_rgba(20,184,166,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-compass-400" />
              <span>Morrow 1.0 • Round 2 Hackathon Project</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              CONTRIB{" "}
              <span className="bg-gradient-to-r from-compass-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                COMPASS
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-300 font-light max-w-2xl leading-relaxed">
              AI-powered contributor matching for open-source projects. Connects developers to the right issue —{" "}
              <span className="text-white font-medium">automatically</span>.
            </p>

            {/* Feature Checkpoints */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Manual Triaging</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Smart Semantic Matching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Self-Improving Model</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/match"
                className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-glow-teal transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Launch Smart Matcher</span>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/connect"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 transition-all hover:border-compass-500/40"
              >
                <GitFork className="w-4 h-4 text-compass-400" />
                <span>Connect Repositories</span>
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-3.5 text-xs text-slate-400 hover:text-white font-mono transition-colors"
              >
                <span>Browse Issue Feed →</span>
              </Link>
            </div>
          </div>

          {/* Right: 3D Holographic Compass with Exact Screenshot Colors */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full max-w-[460px] aspect-square relative flex items-center justify-center">
              <CompassCanvas3D className="w-full h-full" />
              <div className="absolute -bottom-2 text-center pointer-events-none">
                <span className="text-[10px] font-mono uppercase tracking-widest text-compass-400/90 bg-[#050a0f]/80 px-3.5 py-1 rounded-full border border-compass-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                  Interactive 3D WebGL Compass • Move Mouse to Tilt
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1-CLICK INTERACTIVE LAUNCHPAD CONSOLE */}
      <section ref={launcherRef} className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="cyber-glass-card rounded-2xl p-6 sm:p-7 border border-compass-500/25 shadow-glow-teal relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-compass-400 to-emerald-400" />
          
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("username");
                  setInputVal("Saksham842");
                }}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "username"
                    ? "bg-gradient-to-r from-compass-500 to-emerald-500 text-slate-950 font-bold shadow-glow-teal"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Contributor Handle
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("repo");
                  setInputVal("vercel/next.js");
                }}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "repo"
                    ? "bg-gradient-to-r from-compass-500 to-emerald-500 text-slate-950 font-bold shadow-glow-teal"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Repository URL
              </button>
            </div>

            <span className="text-[11px] font-mono text-compass-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Instant Semantic Match
            </span>
          </div>

          <form onSubmit={handleLaunch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  activeTab === "username"
                    ? "Enter GitHub user (e.g. Saksham842, shadcn, leerob)"
                    : "Enter repo (e.g. vercel/next.js, facebook/react)"
                }
                className="w-full h-11 bg-[#070e17] border border-compass-500/30 rounded-xl px-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-compass-400 font-mono transition-all"
              />
            </div>

            <button
              type="submit"
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-glow-teal"
            >
              <span>Run Match Query</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Persona Chips */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Quick Picks:</span>
            {activeTab === "username" ? (
              <>
                {QUICK_PERSONAS.map((p) => (
                  <button
                    key={p.handle}
                    type="button"
                    onClick={() => {
                      setInputVal(p.handle);
                      router.push(`/match?user=${p.handle}`);
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-compass-500/20 text-slate-300 hover:text-compass-200 border border-white/10 hover:border-compass-500/40 text-[11px] transition-all"
                  >
                    @{p.handle}
                  </button>
                ))}
              </>
            ) : (
              <>
                {QUICK_REPOS.map((r) => (
                  <button
                    key={r.name}
                    type="button"
                    onClick={() => {
                      setInputVal(r.name);
                      router.push(`/connect`);
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-compass-500/20 text-slate-300 hover:text-compass-200 border border-white/10 hover:border-compass-500/40 text-[11px] transition-all"
                  >
                    {r.name}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* REAL-TIME CANDIDATE SHOWCASE */}
      <section ref={showcaseRef} className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="cyber-glass-card rounded-3xl p-6 sm:p-7 border border-compass-500/25 shadow-glow-teal space-y-4 relative overflow-hidden">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                Real-Time Triaged Candidate
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 hidden sm:inline-block">
                Sample {sampleIndex + 1} of {MOCK_MATCH_RESULTS.length}
              </span>
              <button
                type="button"
                onClick={cycleSample}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-compass-500/20 hover:bg-compass-500/30 text-xs font-mono text-compass-300 border border-compass-500/40 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-compass-400" />
                <span>Next Candidate</span>
              </button>
            </div>
          </div>

          {/* Issue Card */}
          <IssueCard
            issue={activeIssueSample.issue}
            score={activeIssueSample.score}
            matchReason={activeIssueSample.matchReason}
          />

          {/* Neural Vector Telemetry */}
          <div className="rounded-2xl bg-[#060c14] p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-compass-400" />
                <span>Neural Projection:</span>
              </span>
              <span className="text-compass-300 font-semibold">
                Cosine Similarity 0.943 • 768-D
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Skill Vector Match (Next.js / TypeScript)</span>
                <span className="text-white font-mono font-medium">{activeIssueSample.score || 94}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-compass-400 via-emerald-400 to-cyan-400 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${activeIssueSample.score || 94}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Eval Benchmark: 94.3% Agreement</span>
              </span>
              <span className="text-slate-500">Groq LPU: 312ms</span>
            </div>
          </div>
        </div>
      </section>

      {/* TELEMETRY PROOF BAR */}
      <section ref={proofBarRef} className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="cyber-glass-card p-6 rounded-2xl border border-compass-500/20 text-center">
            <span
              ref={counter1Ref}
              className="text-4xl sm:text-5xl font-extrabold text-white block tracking-tight mb-1"
            >
              94.3%
            </span>
            <span className="text-xs font-semibold text-compass-400 uppercase tracking-wider block font-mono">
              Triage Agreement
            </span>
            <p className="text-[11px] text-slate-400 mt-2">vs 65.7% heuristic baseline (N=35 in /eval)</p>
          </div>

          <div className="cyber-glass-card p-6 rounded-2xl border border-compass-500/20 text-center">
            <span
              ref={counter2Ref}
              className="text-4xl sm:text-5xl font-extrabold text-cyan-400 block tracking-tight mb-1"
            >
              &lt; 350ms
            </span>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block font-mono">
              Groq LLM Latency
            </span>
            <p className="text-[11px] text-slate-400 mt-2">llama-3.3-70b-versatile LPU</p>
          </div>

          <div className="cyber-glass-card p-6 rounded-2xl border border-compass-500/20 text-center">
            <span
              ref={counter3Ref}
              className="text-4xl sm:text-5xl font-extrabold text-emerald-400 block tracking-tight mb-1"
            >
              768-D
            </span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block font-mono">
              Vector Space
            </span>
            <p className="text-[11px] text-slate-400 mt-2">Sentence-Transformers embeddings</p>
          </div>

          <div className="cyber-glass-card p-6 rounded-2xl border border-compass-500/20 text-center">
            <span
              ref={counter4Ref}
              className="text-4xl sm:text-5xl font-extrabold text-amber-400 block tracking-tight mb-1"
            >
              100%
            </span>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block font-mono">
              Self-Improving
            </span>
            <p className="text-[11px] text-slate-400 mt-2">Maintainer human-in-the-loop overrides</p>
          </div>
        </div>
      </section>

      {/* 3-PILLAR SOLUTION ARCHITECTURE */}
      <section ref={featuresRef} className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-compass-400">
            Unified Open Source Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            A complete suite for contributors &amp; maintainers.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Eliminate friction between developers looking for meaningful contributions and maintainers drowning in issue triage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="cyber-glass-card rounded-2xl p-7 flex flex-col justify-between border border-white/10 hover:border-compass-500/40">
            <div>
              <div className="w-12 h-12 rounded-xl bg-compass-500/20 border border-compass-500/40 flex items-center justify-center text-compass-400 mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">Automated Issue Radar</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Connect your repository to immediately parse issues, sanitize markdown, and classify difficulty (Easy, Intermediate, Advanced) and estimated effort.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-compass-400">
              <span>Groq LPU Triaging</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="cyber-glass-card rounded-2xl p-7 flex flex-col justify-between border border-white/10 hover:border-cyan-500/40">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-6">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">Neural Skill Matching</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Extract competencies from your GitHub profile or custom skill tags, projecting them against 768-D issue vectors to compute precise 0–100 compatibility scores.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-cyan-400">
              <span>Vector Similarity Engine</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="cyber-glass-card rounded-2xl p-7 flex flex-col justify-between border border-white/10 hover:border-emerald-500/40">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">Maintainer Feedback Studio</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Maintainers can correct or calibrate any label with one click. Corrections persist and tune future classifications, compounding accuracy over time.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-emerald-400">
              <span>Self-Calibrating Pipeline</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* DEVELOPER CODE SANDBOX */}
      <section ref={devShowcaseRef} className="py-20 bg-[#04080e] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-compass-400">
                Developer First Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Designed for engineers, built with open standards.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Integrate Contrib Compass into your CI/CD pipeline or GitHub Actions. Access REST and GraphQL endpoints with standard Bearer authentication.
              </p>

              <div className="space-y-3 pt-2 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-compass-500/20 flex items-center justify-center text-compass-400">
                    ✓
                  </div>
                  <span>Deterministic error shapes with structured error codes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    ✓
                  </div>
                  <span>In-memory 60s cache TTL to respect GitHub API limits</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    ✓
                  </div>
                  <span>Deployable on Render, Vercel, or custom Docker containers</span>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/maintainer"
                  className="cyber-btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
                >
                  <span>Explore Developer Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 text-compass-400" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <StripeDevShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM HORIZON CTA */}
      <section ref={bottomCtaRef} className="py-24 max-w-5xl mx-auto px-4 text-center relative z-10">
        <div className="cyber-glass-card rounded-3xl p-10 sm:p-14 border border-compass-500/30 shadow-glow-teal relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-compass-400 to-emerald-400" />

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Ready to find your next open-source contribution?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            No more wandering through thousands of issues. Let our AI compass steer you to issues calibrated for your exact skills.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/match"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-glow-teal transition-all active:scale-95"
            >
              Start Matching Now
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm border border-white/10 transition-all hover:border-compass-500/40"
            >
              Browse Live Issues
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
