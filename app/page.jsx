"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
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
  ExternalLink,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Award
} from "lucide-react";
import IssueCard from "../components/IssueCard";
import { MOCK_ISSUES, MOCK_MATCH_RESULTS } from "../lib/mockData";

// Dynamically import 3D Three.js canvas with ssr: false for rock-solid SSR & hydration
const CompassCanvas3D = dynamic(() => import("../components/CompassCanvas3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-compass-400 gap-2">
      <Loader2 className="w-7 h-7 animate-spin" />
      <span className="text-[11px] font-mono">Initializing 3D Compass...</span>
    </div>
  ),
});

const QUICK_REPOS = [
  { name: "vercel/next.js", desc: "React Framework", stars: "125k" },
  { name: "facebook/react", desc: "UI Library", stars: "228k" },
  { name: "fastify/fastify", desc: "Node.js Web", stars: "32k" },
  { name: "tailwindlabs/tailwindcss", desc: "Styling", stars: "82k" },
];

const QUICK_PERSONAS = [
  { handle: "Saksham842", role: "Fullstack / AI" },
  { handle: "shadcn", role: "Design Systems / Radix" },
  { handle: "leerob", role: "Next.js & Performance" },
];

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("username"); // "username" | "repo"
  const [inputVal, setInputVal] = useState("Saksham842");
  const [sampleIndex, setSampleIndex] = useState(0);

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

  const cycleSampleIssue = () => {
    setSampleIndex((prev) => (prev + 1) % MOCK_MATCH_RESULTS.length);
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid cyber-grid-radial opacity-60 pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Eyebrow Badge */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-compass-500/10 border border-compass-500/30 text-compass-300 text-xs font-mono shadow-[0_0_15px_rgba(20,184,166,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-compass-400 animate-pulse" />
            <span>AI-Powered Open Source Contributor Matching</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mt-4 mb-4">
            Find the right open source issue —{" "}
            <span className="bg-gradient-to-r from-compass-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              in 10 seconds.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
            Groq LLM automatically triages issues by difficulty, skills, and effort. Enter your GitHub handle to get matched issues calibrated for your exact skills.
          </p>
        </div>

        {/* 1-CLICK INTERACTIVE LAUNCHPAD (Hero Centerpiece) */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="rounded-3xl border border-compass-500/30 bg-[#0c1624]/90 p-5 sm:p-7 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-compass-400 to-emerald-400" />

            {/* Mode Tabs */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("username");
                    setInputVal("Saksham842");
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                    activeTab === "username"
                      ? "bg-compass-500/20 text-compass-300 border border-compass-500/50 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Match by GitHub Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("repo");
                    setInputVal("vercel/next.js");
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                    activeTab === "repo"
                      ? "bg-compass-500/20 text-compass-300 border border-compass-500/50 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Triage by Target Repo</span>
                </button>
              </div>

              <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                Zero Setup Needed
              </span>
            </div>

            {/* Big Instant Input Box */}
            <form onSubmit={handleLaunch} className="flex flex-col sm:flex-row gap-2.5 items-stretch">
              <div className="relative flex-1">
                {activeTab === "username" ? (
                  <Github className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                ) : (
                  <GitFork className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                )}
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={
                    activeTab === "username"
                      ? "Enter GitHub username (e.g. Saksham842 or your handle)"
                      : "Enter GitHub repo (e.g. vercel/next.js)"
                  }
                  className="w-full h-12 bg-[#060c14] border border-white/10 rounded-2xl pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-compass-400 font-mono transition-colors"
                />
              </div>

              <button
                type="submit"
                className="h-12 px-6 rounded-2xl bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-glow-teal flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Discover Matches</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Clickable Quick-Start Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 text-[11px]">Instant Examples:</span>
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
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-compass-500/20 text-slate-300 hover:text-compass-300 border border-white/10 transition-all flex items-center gap-1.5"
                    >
                      <span className="font-semibold">@{p.handle}</span>
                      <span className="text-[10px] text-slate-400">({p.role})</span>
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
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-compass-500/20 text-slate-300 hover:text-compass-300 border border-white/10 transition-all flex items-center gap-1"
                    >
                      <span>{r.name}</span>
                      <span className="text-[10px] text-amber-400">★{r.stars}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* HERO INTERACTIVE SHOWCASE: Live Triaged Issue + 3D Compass Accent */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          
          {/* Left: Live Interactive Sample Issue Card */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Zap className="w-3.5 h-3.5 text-compass-400 animate-pulse" />
                <span className="font-semibold">Sample Issue Preview</span>
                <span className="text-[10px] text-amber-400/90 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full">Interactive Demo</span>
                <span className="text-slate-400">• #{sampleIndex + 1} of {MOCK_MATCH_RESULTS.length}</span>
              </div>
              
              <button
                type="button"
                onClick={cycleSampleIssue}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-compass-300 border border-white/10 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Next Sample</span>
              </button>
            </div>

            <IssueCard
              issue={activeIssueSample.issue}
              score={activeIssueSample.score}
              matchReason={activeIssueSample.matchReason}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>94.3% Agreement on Hand-Labeled Eval Dataset (N=35 in /eval)</span>
              </span>
              <span className="text-slate-400">
                Powered by Groq LLM + 768-D Vector Embeddings
              </span>
            </div>
          </div>

          {/* Right: 3D Holographic Compass Hero Accent */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            <div className="w-full max-w-[340px] aspect-square relative flex items-center justify-center">
              <CompassCanvas3D className="w-full h-full" />
              <div className="absolute -bottom-2 text-center pointer-events-none">
                <span className="text-[10px] font-mono uppercase tracking-widest text-compass-400/80 bg-black/70 px-3 py-1 rounded-full border border-compass-500/20 backdrop-blur-sm">
                  Interactive 3D WebGL Vector Compass
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS & PROOF BAR */}
      <section className="relative py-12 border-y border-white/5 bg-[#060c14]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white block mb-1">
                94.3%
              </span>
              <span className="text-xs font-mono text-compass-400 uppercase tracking-wider block">
                Triage Agreement
              </span>
              <p className="text-[11px] text-slate-400 mt-1">vs 65.7% heuristic baseline (N=35)</p>
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-cyan-400 block mb-1">
                &lt; 350ms
              </span>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
                Groq LLM Latency
              </span>
              <p className="text-[11px] text-slate-400 mt-1">llama-3.3-70b-versatile</p>
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 block mb-1">
                768-D
              </span>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">
                Vector Dimensions
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Sentence-Transformers</p>
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400 block mb-1">
                100%
              </span>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">
                Self-Improving
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Maintainer calibration override</p>
            </div>
          </div>
        </div>
      </section>

      {/* THE 3 CORE PILLARS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono text-compass-400 uppercase tracking-widest">End-to-End Intelligence</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            Engineered for contributors &amp; maintainers alike.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group rounded-3xl border border-white/10 bg-[#09121d] p-7 transition-all duration-300 hover:border-compass-500/50 hover:bg-[#0d1a29] hover:shadow-glow-teal flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-compass-500/20 border border-compass-500/40 flex items-center justify-center text-compass-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Automated Issue Triage</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Ingests GitHub issues and classifies difficulty (Easy, Intermediate, Advanced), skill area, and effort with confidence ratings.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-xs font-mono text-compass-300 flex items-center gap-1.5">
              <span>Groq LLM + Heuristic Fallback</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group rounded-3xl border border-compass-500/40 bg-[#0b1725] p-7 transition-all duration-300 hover:border-compass-400 hover:bg-[#0f1f31] shadow-glow-teal flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Neural Skill Matching</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Auto-extracts competencies from your GitHub profile or custom skill tags, projecting them against issue embeddings to score compatibility 0–100.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-xs font-mono text-cyan-300 flex items-center gap-1.5">
              <span>GSAP Interactive Visualizer</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group rounded-3xl border border-white/10 bg-[#09121d] p-7 transition-all duration-300 hover:border-compass-500/50 hover:bg-[#0d1a29] hover:shadow-glow-teal flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Maintainer Feedback Loop</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Maintainers can correct or calibrate any label with one click. Corrections persist and tune future classifications, compounding accuracy.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-xs font-mono text-emerald-300 flex items-center gap-1.5">
              <span>Self-Calibrating Pipeline</span>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-16 max-w-5xl mx-auto px-4 text-center">
        <div className="rounded-3xl border border-compass-500/30 bg-gradient-to-b from-[#0e1d2c] to-[#070e17] p-10 sm:p-14 shadow-glow-teal relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Start matching your skills right now
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            Skip the noise of scrolling through hundreds of stagnant issues. Let Contrib Compass steer you directly to issues you can solve today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/match"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-glow-teal transition-all active:scale-95"
            >
              Launch Smart Matcher
            </Link>
            <Link
              href="/maintainer"
              className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm border border-white/10 transition-all hover:border-compass-500/30"
            >
              Maintainer Feedback Studio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
