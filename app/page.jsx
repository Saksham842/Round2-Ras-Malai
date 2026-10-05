"use client";

import { useState, Suspense } from "react";
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
    <div className="relative w-full overflow-hidden bg-[#08090f] text-slate-100">
      {/* Render Signature Atmospheric Aurora Orbs (Cyan, Indigo, Violet) */}
      <div className="absolute top-0 left-1/4 w-[650px] h-[650px] rounded-full aurora-orb-cyan opacity-80" />
      <div className="absolute top-24 right-10 w-[600px] h-[600px] rounded-full aurora-orb-indigo opacity-80" />
      <div className="absolute top-[620px] left-1/3 w-[550px] h-[550px] rounded-full aurora-orb-violet opacity-75" />

      {/* Render Dot Matrix & Cyber Grid Overlay */}
      <div className="absolute inset-0 dot-matrix-render opacity-60 pointer-events-none" />
      <div className="absolute inset-0 render-grid render-grid-radial opacity-50 pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Eyebrow Badge (Render Developer Cloud Style) */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0e101d]/90 border border-render-cyan/40 text-render-cyan text-xs font-mono shadow-glow-render backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-render-cyan animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-render-cyan" />
            <span className="font-semibold tracking-wide">
              3D AI VECTOR MATCH ENGINE • POWERED BY GROQ &amp; RENDER CLOUD
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] mt-5 mb-5 font-sans">
            Find the right open source issue —{" "}
            <span className="bg-gradient-to-r from-render-cyan via-render-indigo to-render-violet bg-clip-text text-transparent">
              in 10 seconds.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Groq LLM automatically triages issues by difficulty, skill area, and effort. 768-D vector embeddings match candidates with precision on Render cloud infrastructure.
          </p>
        </div>

        {/* 1-CLICK INTERACTIVE LAUNCHPAD (Render Cloud Console Card) */}
        <div className="max-w-3xl mx-auto mb-14">
          <div className="rounded-3xl border border-[#222842] bg-[#0e101d]/90 p-5 sm:p-7 backdrop-blur-2xl shadow-glow-indigo relative overflow-hidden">
            {/* Top Glowing Laser Border */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-render-cyan via-render-indigo to-render-violet" />

            {/* Mode Tabs */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("username");
                    setInputVal("Saksham842");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                    activeTab === "username"
                      ? "bg-render-cyan/20 text-render-cyan border border-render-cyan/50 shadow-glow-render"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Github className="w-4 h-4" />
                  <span>Match by GitHub Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("repo");
                    setInputVal("vercel/next.js");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                    activeTab === "repo"
                      ? "bg-render-indigo/20 text-render-indigo border border-render-indigo/50 shadow-glow-indigo"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <GitFork className="w-4 h-4" />
                  <span>Triage by Target Repo</span>
                </button>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-render-cyan bg-[#141729] border border-render-cyan/30 px-2.5 py-1 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-render-cyan animate-pulse" />
                Zero Setup Needed
              </span>
            </div>

            {/* Big Instant Input Box */}
            <form onSubmit={handleLaunch} className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                {activeTab === "username" ? (
                  <Github className="w-5 h-5 text-render-cyan absolute left-4 top-1/2 -translate-y-1/2" />
                ) : (
                  <GitFork className="w-5 h-5 text-render-indigo absolute left-4 top-1/2 -translate-y-1/2" />
                )}
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={
                    activeTab === "username"
                      ? "Enter GitHub username (e.g. Saksham842, shadcn, leerob)"
                      : "Enter GitHub repo (e.g. vercel/next.js, facebook/react)"
                  }
                  className="w-full h-13 bg-[#08090f] border border-[#222842] rounded-2xl pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-render-cyan focus:shadow-glow-render font-mono transition-all"
                />
              </div>

              <button
                type="submit"
                className="h-13 px-7 rounded-2xl bg-gradient-to-r from-render-cyan via-render-indigo to-render-violet hover:opacity-90 text-slate-950 font-black text-sm shadow-glow-render flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
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
                      className="px-2.5 py-1 rounded-lg bg-[#121626] hover:bg-render-cyan/20 text-slate-300 hover:text-render-cyan border border-[#222842] hover:border-render-cyan/50 transition-all flex items-center gap-1.5"
                    >
                      <span className="font-semibold text-white">@{p.handle}</span>
                      <span className="text-[10px] text-render-cyan">({p.role})</span>
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
                      className="px-2.5 py-1 rounded-lg bg-[#121626] hover:bg-render-indigo/20 text-slate-300 hover:text-render-indigo border border-[#222842] hover:border-render-indigo/50 transition-all flex items-center gap-1"
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

        {/* HERO INTERACTIVE SHOWCASE: Live Triaged Issue + 3D Holographic Compass Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          
          {/* Left: Live Interactive Sample Issue Card */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Zap className="w-3.5 h-3.5 text-render-cyan animate-pulse" />
                <span className="font-bold text-white">Live Triaged Candidate</span>
                <span className="text-[10px] text-render-cyan bg-[#141729] border border-render-cyan/40 px-2 py-0.5 rounded-full font-mono">
                  Sample #{sampleIndex + 1} of {MOCK_MATCH_RESULTS.length}
                </span>
              </div>
              
              <button
                type="button"
                onClick={cycleSampleIssue}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#121626] hover:bg-[#1a1f36] text-xs font-mono text-render-cyan border border-render-cyan/30 transition-all"
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
              <span className="flex items-center gap-1.5 text-render-cyan font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-render-cyan" />
                <span>94.3% Agreement on Hand-Labeled Eval Benchmark (N=35 in /eval)</span>
              </span>
              <span className="text-render-indigo font-medium">
                Powered by Groq LLM + 768-D Vector Embeddings
              </span>
            </div>
          </div>

          {/* Right: 3D Holographic Compass Hero Accent */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            <div className="w-full max-w-[420px] aspect-square relative flex items-center justify-center p-2 rounded-3xl bg-[#0e101d]/80 border border-[#222842] backdrop-blur-2xl shadow-glow-render">
              <CompassCanvas3D className="w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* METRICS & PROOF BAR (Render Cloud Service Metrics) */}
      <section className="relative py-12 border-y border-[#222842] bg-[#0e101d]/75 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-[#131627]/60 border border-[#222842] hover:border-render-cyan/40 transition-colors">
              <span className="text-3xl sm:text-4xl font-black font-mono text-white block mb-1">
                94.3%
              </span>
              <span className="text-xs font-mono text-render-cyan uppercase tracking-wider block font-bold">
                Triage Agreement
              </span>
              <p className="text-[11px] text-slate-400 mt-1">vs 65.7% heuristic baseline (N=35)</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#131627]/60 border border-[#222842] hover:border-render-indigo/40 transition-colors">
              <span className="text-3xl sm:text-4xl font-black font-mono text-render-indigo block mb-1">
                &lt; 350ms
              </span>
              <span className="text-xs font-mono text-render-indigo uppercase tracking-wider block font-bold">
                Groq LLM Latency
              </span>
              <p className="text-[11px] text-slate-400 mt-1">llama-3.3-70b-versatile</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#131627]/60 border border-[#222842] hover:border-render-violet/40 transition-colors">
              <span className="text-3xl sm:text-4xl font-black font-mono text-render-violet block mb-1">
                768-D
              </span>
              <span className="text-xs font-mono text-render-violet uppercase tracking-wider block font-bold">
                Vector Dimensions
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Sentence-Transformers</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#131627]/60 border border-[#222842] hover:border-render-pink/40 transition-colors">
              <span className="text-3xl sm:text-4xl font-black font-mono text-render-pink block mb-1">
                100%
              </span>
              <span className="text-xs font-mono text-render-pink uppercase tracking-wider block font-bold">
                Self-Improving
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Maintainer calibration override</p>
            </div>
          </div>
        </div>
      </section>

      {/* THE 3 CORE PILLARS (Render Bento Grid) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono text-render-cyan uppercase tracking-widest font-bold">
            End-to-End Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
            Engineered for contributors &amp; maintainers alike.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group rounded-3xl border border-[#222842] bg-[#0e101d]/90 p-7 transition-all duration-300 hover:border-render-cyan/50 hover:bg-[#131627] hover:shadow-glow-render flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-render-cyan/20 border border-render-cyan/40 flex items-center justify-center text-render-cyan mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Automated Issue Triage</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ingests GitHub issues and classifies difficulty (Easy, Intermediate, Advanced), skill area, and effort with confidence ratings.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono text-render-cyan flex items-center gap-1.5 font-semibold">
              <span>Groq LLM + Heuristic Fallback</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group rounded-3xl border border-render-indigo/40 bg-[#121626]/95 p-7 transition-all duration-300 hover:border-render-indigo hover:bg-[#181d33] shadow-glow-indigo flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-render-indigo/20 border border-render-indigo/40 flex items-center justify-center text-render-indigo mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Neural Skill Matching</h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Auto-extracts competencies from your GitHub profile or custom skill tags, projecting them against issue embeddings to score compatibility 0–100.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono text-render-indigo flex items-center gap-1.5 font-semibold">
              <span>GSAP Interactive Visualizer</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group rounded-3xl border border-[#222842] bg-[#0e101d]/90 p-7 transition-all duration-300 hover:border-render-violet/50 hover:bg-[#131627] hover:shadow-glow-violet flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-render-violet/20 border border-render-violet/40 flex items-center justify-center text-render-violet mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Maintainer Feedback Loop</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Maintainers can correct or calibrate any label with one click. Corrections persist and tune future classifications, compounding accuracy.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono text-render-violet flex items-center gap-1.5 font-semibold">
              <span>Self-Calibrating Pipeline</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT'S BUILT PIPELINE (From Pitch Deck Page 4) */}
      <section className="py-16 bg-[#06070c] border-t border-[#222842]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-mono text-render-cyan uppercase tracking-widest font-bold">Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">How It&apos;s Built</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-[#0e101d] border border-[#222842] hover:border-render-cyan/50 transition-all relative overflow-hidden">
              <span className="text-2xl font-mono font-bold text-render-cyan block mb-2">01</span>
              <h4 className="font-bold text-sm text-white mb-1">GitHub API</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingests issues, PR discussions, and metadata from connected repos via REST &amp; GraphQL.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-[#0e101d] border border-[#222842] hover:border-render-indigo/50 transition-all relative overflow-hidden">
              <span className="text-2xl font-mono font-bold text-render-indigo block mb-2">02</span>
              <h4 className="font-bold text-sm text-white mb-1">Text Analysis</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sanitizes issue bodies, extracts technical keywords, and normalizes stack taxonomy.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-[#0e101d] border border-[#222842] hover:border-render-violet/50 transition-all relative overflow-hidden">
              <span className="text-2xl font-mono font-bold text-render-violet block mb-2">03</span>
              <h4 className="font-bold text-sm text-white mb-1">AI Classifier</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates difficulty, skill area, and effort with microsecond triage execution.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-[#0e101d] border border-[#222842] hover:border-render-pink/50 transition-all relative overflow-hidden">
              <span className="text-2xl font-mono font-bold text-render-pink block mb-2">04</span>
              <h4 className="font-bold text-sm text-white mb-1">Match Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ranks candidate issues against contributor skills, experience, and past contribution graph.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA (Render-style Gradient Container) */}
      <section className="py-16 max-w-5xl mx-auto px-4 text-center">
        <div className="rounded-3xl border border-render-cyan/30 bg-gradient-to-b from-[#14172a] via-[#0e101d] to-[#08090f] p-10 sm:p-14 shadow-glow-render relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-render-cyan via-render-indigo to-render-violet" />
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Start matching your skills right now
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            Skip the noise of scrolling through hundreds of stagnant issues. Let Contrib Compass steer you directly to issues you can solve today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/match"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-render-cyan via-render-indigo to-render-violet hover:opacity-90 text-slate-950 font-black text-sm shadow-glow-render transition-all active:scale-95"
            >
              Launch Smart Matcher
            </Link>
            <Link
              href="/maintainer"
              className="px-6 py-3.5 rounded-xl bg-[#08090f] hover:bg-[#131627] text-white font-medium text-sm border border-[#222842] transition-all hover:border-render-cyan/40"
            >
              Maintainer Feedback Studio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
