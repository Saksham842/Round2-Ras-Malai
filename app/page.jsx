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
import StripeMeshGradient from "../components/StripeMeshGradient";
import StripeDevShowcase from "../components/StripeDevShowcase";
import { MOCK_MATCH_RESULTS } from "../lib/mockData";

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

  // GSAP Animation Refs
  const pageContainerRef = useRef(null);
  const heroRef = useRef(null);
  const badgeRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const ctaBarRef = useRef(null);
  const launcherRef = useRef(null);
  const showcaseRef = useRef(null);
  const proofBarRef = useRef(null);
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

  // GSAP + ScrollTrigger Orchestration
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Hero Stagger Entrance
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTl
        .fromTo(
          badgeRef.current,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 }
        )
        .fromTo(
          headingRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.4"
        )
        .fromTo(
          descRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          "-=0.5"
        )
        .fromTo(
          ctaBarRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          "-=0.5"
        )
        .fromTo(
          launcherRef.current,
          { y: 25, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8 },
          "-=0.4"
        )
        .fromTo(
          showcaseRef.current,
          { x: 30, opacity: 0, scale: 0.96 },
          { x: 0, opacity: 1, scale: 1, duration: 0.9 },
          "-=0.6"
        );

      // 2. Parallax Scrub on Hero Showcase
      if (showcaseRef.current && heroRef.current) {
        gsap.to(showcaseRef.current, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
          y: 70,
          rotationZ: -1.5,
          scale: 1.02,
          ease: "none",
        });
      }

      // 3. Telemetry Counters Animation
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

      // 4. Feature Cards Stagger
      if (featuresRef.current) {
        gsap.fromTo(
          ".stripe-feature-card",
          { y: 40, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // 5. Developer Showcase Entrance
      if (devShowcaseRef.current) {
        gsap.fromTo(
          devShowcaseRef.current,
          { y: 45, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: devShowcaseRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // 6. Bottom CTA Entrance
      if (bottomCtaRef.current) {
        gsap.fromTo(
          bottomCtaRef.current,
          { y: 35, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bottomCtaRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, pageContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageContainerRef} className="relative w-full overflow-hidden bg-[#070913] text-slate-100">
      
      {/* Stripe Signature Animated Liquid Mesh Gradient Background */}
      <div className="absolute top-0 left-0 right-0 h-[880px] overflow-hidden pointer-events-none z-0">
        <StripeMeshGradient className="opacity-90" />
        {/* Subtle Stripe diagonal sweep overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070913]/60 to-[#070913]" />
      </div>

      {/* HERO SECTION */}
      <section ref={heroRef} className="relative z-10 pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Stripe Typography & Action Console */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Pill Announcement Badge (Stripe style) */}
            <div ref={badgeRef}>
              <Link
                href="/match"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-slate-200 shadow-sm transition-all group"
              >
                <span className="w-2 h-2 rounded-full bg-[#00d4b6] animate-pulse" />
                <span>Introducing Contrib Compass 2.0</span>
                <span className="text-[#635bff] font-semibold flex items-center group-hover:translate-x-0.5 transition-transform">
                  Explore <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
                </span>
              </Link>
            </div>

            {/* Iconic Stripe Bold Headline */}
            <h1
              ref={headingRef}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]"
            >
              Neural infrastructure{" "}
              <span className="stripe-gradient-text block mt-1">for open source.</span>
            </h1>

            {/* Stripe Descriptive Value Proposition */}
            <p
              ref={descRef}
              className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl"
            >
              Millions of developer hours are lost triaging stagnant issues. Contrib Compass automatically classifies difficulty, effort, and skills via Groq LLM and projects 768-D vector embeddings to match contributors in seconds.
            </p>

            {/* Double Action Button Bar */}
            <div ref={ctaBarRef} className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/match"
                className="stripe-btn-primary px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Start matching now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/connect"
                className="stripe-btn-secondary px-5 py-3 rounded-full text-sm font-medium flex items-center gap-1.5"
              >
                <span>Connect a repository</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Stripe Interactive Launchpad Console */}
            <div ref={launcherRef} className="pt-4">
              <div className="stripe-glass-card rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("username");
                        setInputVal("Saksham842");
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        activeTab === "username"
                          ? "bg-[#635bff] text-white shadow-sm"
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
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        activeTab === "repo"
                          ? "bg-[#635bff] text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Repository URL
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-[#00d4b6] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00d4b6]" />
                    Instant Evaluation
                  </span>
                </div>

                <form onSubmit={handleLaunch} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder={
                        activeTab === "username"
                          ? "Enter GitHub user (e.g. Saksham842, shadcn)"
                          : "Enter repo (e.g. vercel/next.js)"
                      }
                      className="w-full h-11 bg-[#060814] border border-white/10 rounded-xl px-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#635bff] font-mono transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="h-11 px-5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>Run Query</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Instant Persona Chips */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-mono">
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
                          className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] transition-all"
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
                          className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] transition-all"
                        >
                          {r.name}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stripe Interactive Product Showcase */}
          <div ref={showcaseRef} className="lg:col-span-6 relative">
            <div className="stripe-glass-card rounded-3xl p-5 sm:p-6 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-4 relative overflow-hidden">
              
              {/* Top Telemetry Header Bar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00d4b6]" />
                    <span className="absolute w-2.5 h-2.5 rounded-full bg-[#00d4b6] animate-ping" />
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
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#635bff]/20 hover:bg-[#635bff]/30 text-xs font-mono text-white border border-[#635bff]/40 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-[#00d4b6]" />
                    <span>Next Sample</span>
                  </button>
                </div>
              </div>

              {/* The Live Interactive Issue Card */}
              <IssueCard
                issue={activeIssueSample.issue}
                score={activeIssueSample.score}
                matchReason={activeIssueSample.matchReason}
              />

              {/* Neural Vector Telemetry & Proof Strip */}
              <div className="rounded-2xl bg-[#060814] p-4 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#635bff]" />
                    <span>Neural Projection:</span>
                  </span>
                  <span className="text-[#00d4b6] font-semibold">
                    Cosine Similarity 0.943 • 768-D
                  </span>
                </div>

                {/* Simulated Neural Match Bars */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Skill Vector Match (Next.js / TypeScript)</span>
                    <span className="text-white font-mono font-medium">{activeIssueSample.score || 94}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#00d4b6] to-[#635bff] rounded-full transition-all duration-700 ease-out" 
                      style={{ width: `${activeIssueSample.score || 94}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-[#00d4b6]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Eval Benchmark: 94.3% Agreement</span>
                  </span>
                  <span className="text-slate-500">Groq LPU: 312ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ECOSYSTEM PARTNERS RIBBON (Stripe Logo Banner) */}
      <section className="py-8 border-y border-white/5 bg-[#050711]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-mono uppercase tracking-widest text-slate-400 mb-6 font-semibold">
            Trained and calibrated for modern open source stacks
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-80">
            {ECOSYSTEM_LOGOS.map((item) => (
              <div key={item.name} className="flex items-center gap-2 group cursor-default">
                <div className="w-2 h-2 rounded-full bg-[#635bff] group-hover:scale-125 transition-transform" />
                <span className="font-bold text-sm text-slate-200 tracking-tight group-hover:text-white transition-colors">
                  {item.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 border border-white/10 px-1.5 py-0.5 rounded-md">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STRIPE TELEMETRY PROOF BAR */}
      <section ref={proofBarRef} className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="stripe-glass-card p-6 rounded-2xl border border-white/10 text-center">
            <span
              ref={counter1Ref}
              className="text-4xl sm:text-5xl font-extrabold text-white block tracking-tight mb-1"
            >
              94.3%
            </span>
            <span className="text-xs font-semibold text-[#00d4b6] uppercase tracking-wider block font-mono">
              Triage Agreement
            </span>
            <p className="text-[11px] text-slate-400 mt-2">vs 65.7% heuristic baseline (N=35 in /eval)</p>
          </div>

          <div className="stripe-glass-card p-6 rounded-2xl border border-white/10 text-center">
            <span
              ref={counter2Ref}
              className="text-4xl sm:text-5xl font-extrabold text-[#635bff] block tracking-tight mb-1"
            >
              &lt; 350ms
            </span>
            <span className="text-xs font-semibold text-[#635bff] uppercase tracking-wider block font-mono">
              Groq LLM Latency
            </span>
            <p className="text-[11px] text-slate-400 mt-2">llama-3.3-70b-versatile LPU</p>
          </div>

          <div className="stripe-glass-card p-6 rounded-2xl border border-white/10 text-center">
            <span
              ref={counter3Ref}
              className="text-4xl sm:text-5xl font-extrabold text-[#ff5b79] block tracking-tight mb-1"
            >
              768-D
            </span>
            <span className="text-xs font-semibold text-[#ff5b79] uppercase tracking-wider block font-mono">
              Vector Space
            </span>
            <p className="text-[11px] text-slate-400 mt-2">Sentence-Transformers embeddings</p>
          </div>

          <div className="stripe-glass-card p-6 rounded-2xl border border-white/10 text-center">
            <span
              ref={counter4Ref}
              className="text-4xl sm:text-5xl font-extrabold text-[#ffa154] block tracking-tight mb-1"
            >
              100%
            </span>
            <span className="text-xs font-semibold text-[#ffa154] uppercase tracking-wider block font-mono">
              Self-Improving
            </span>
            <p className="text-[11px] text-slate-400 mt-2">Maintainer human-in-the-loop overrides</p>
          </div>
        </div>
      </section>

      {/* STRIPE MODULAR SUITE FEATURES */}
      <section ref={featuresRef} className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#635bff]">
            Unified Open Source Platform
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
          <div className="stripe-feature-card stripe-glass-card rounded-2xl p-7 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#635bff]/20 border border-[#635bff]/40 flex items-center justify-center text-[#635bff] mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">Automated Issue Radar</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Connect your repository to immediately parse issues, sanitize markdown, and classify difficulty (Easy, Intermediate, Advanced) and estimated effort.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#00d4b6]">
              <span>Groq LPU Triaging</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="stripe-feature-card stripe-glass-card rounded-2xl p-7 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#ff5b79]/20 border border-[#ff5b79]/40 flex items-center justify-center text-[#ff5b79] mb-6">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">Neural Skill Matching</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Extract competencies from your GitHub profile or custom skill tags, projecting them against 768-D issue vectors to compute precise 0–100 compatibility scores.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#ff5b79]">
              <span>Vector Similarity Engine</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="stripe-feature-card stripe-glass-card rounded-2xl p-7 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#00d4b6]/20 border border-[#00d4b6]/40 flex items-center justify-center text-[#00d4b6] mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">Maintainer Feedback Studio</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Maintainers can correct or calibrate any label with one click. Corrections persist and tune future classifications, compounding accuracy over time.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#00d4b6]">
              <span>Self-Calibrating Pipeline</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* STRIPE DEVELOPER INTERACTIVE CODE SANDBOX */}
      <section ref={devShowcaseRef} className="py-20 bg-[#050711] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d4b6]">
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
                  <div className="w-5 h-5 rounded-full bg-[#635bff]/20 flex items-center justify-center text-[#635bff]">
                    ✓
                  </div>
                  <span>Deterministic error shapes with structured error codes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#00d4b6]/20 flex items-center justify-center text-[#00d4b6]">
                    ✓
                  </div>
                  <span>In-memory 60s cache TTL to respect GitHub API limits</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#ff5b79]/20 flex items-center justify-center text-[#ff5b79]">
                    ✓
                  </div>
                  <span>Deployable on Render, Vercel, or custom Docker containers</span>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/maintainer"
                  className="stripe-btn-secondary px-5 py-2.5 rounded-full text-xs font-semibold inline-flex items-center gap-2"
                >
                  <span>Explore Developer Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <StripeDevShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* STRIPE BOTTOM HORIZON CTA */}
      <section ref={bottomCtaRef} className="py-24 max-w-5xl mx-auto px-4 text-center relative z-10">
        <div className="stripe-glass-card rounded-3xl p-10 sm:p-14 border border-white/10 shadow-[0_20px_60px_rgba(99,91,255,0.2)] relative overflow-hidden">
          {/* Vibrant Stripe top beam */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00d4b6] via-[#635bff] to-[#ff5b79]" />

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Ready to find your next open-source contribution?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Join thousands of developers using AI-powered matching to make impactful contributions across GitHub.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/match"
              className="stripe-btn-primary px-7 py-3.5 rounded-full text-sm font-semibold shadow-xl flex items-center gap-2"
            >
              <span>Get started for free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="stripe-btn-secondary px-6 py-3.5 rounded-full text-sm font-medium"
            >
              Browse live issues
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
