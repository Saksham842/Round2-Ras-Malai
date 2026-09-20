"use client";

import Link from "next/link";
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
  Loader2
} from "lucide-react";

// Dynamically import 3D Three.js canvas with ssr: false for rock-solid SSR & hydration
const CompassCanvas3D = dynamic(() => import("../components/CompassCanvas3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-compass-400 gap-2">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="text-xs font-mono">Initializing 3D WebGL Compass...</span>
    </div>
  ),
});

export default function HomePage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid cyber-grid-radial opacity-60 pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text / CTAs */}
          <motion.div 
            className="lg:col-span-7 space-y-6 text-left"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Hackathon Pill */}
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-compass-500/10 border border-compass-500/30 text-compass-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-compass-400" />
              <span>Morrow 1.0 • Round 2 Hackathon Project</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeIn} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              CONTRIB <span className="bg-gradient-to-r from-compass-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">COMPASS</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg sm:text-xl text-slate-300 font-light max-w-2xl leading-relaxed">
              AI-powered contributor matching for open-source projects. Connects developers to the right issue — <span className="text-white font-medium">automatically</span>.
            </motion.p>

            {/* Feature Checkpoints */}
            <motion.div variants={fadeIn} className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-slate-300">
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
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/match"
                className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-glow-teal transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Smart Matcher</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            </motion.div>
          </motion.div>

          {/* Right: 3D Holographic Compass */}
          <motion.div 
            className="lg:col-span-5 relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="w-full max-w-[440px] aspect-square relative flex items-center justify-center">
              <CompassCanvas3D className="w-full h-full" />
              <div className="absolute -bottom-2 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-compass-400/70 bg-black/60 px-3 py-1 rounded-full border border-compass-500/20">
                  Interactive 3D WebGL Compass • Move Mouse to Tilt
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM SECTION (From Pitch Deck Page 2) */}
      <section className="relative py-16 border-y border-white/5 bg-[#070e17]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-rose-400 uppercase tracking-widest">The Core Problem</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              New contributors face a wall of noise.
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Hundreds of open issues across dozens of repos, no sense of difficulty, no sense of which skills are needed — so most first-timers never open a PR at all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Stat Card 1 */}
            <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-[#0d9488]/20 to-[#042f2e]/40 p-8 flex flex-col justify-center backdrop-blur-md shadow-glow-teal">
              <span className="text-5xl sm:text-6xl font-black font-mono text-white mb-2">
                60%+
              </span>
              <p className="text-sm sm:text-base text-teal-100 font-medium leading-relaxed">
                of first-time open source contributors drop off before their first merged PR due to discovery friction.
              </p>
            </div>

            {/* Stat Card 2 */}
            <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-[#0f766e]/20 to-[#042f2e]/40 p-8 flex flex-col justify-center backdrop-blur-md">
              <span className="text-5xl sm:text-6xl font-black font-mono text-white mb-2">
                HOURS
              </span>
              <p className="text-sm sm:text-base text-teal-100 font-medium leading-relaxed">
                lost weekly by maintainers manually triaging, categorizing, and hand-labeling issues that go stale within weeks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION TRIFECTA SECTION (From Pitch Deck Page 3) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono text-compass-400 uppercase tracking-widest">The Solution</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            Contrib Compass connects contributors to the right issue — automatically.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1 */}
          <div className="group rounded-2xl border border-white/10 bg-[#0a131e] p-7 transition-all duration-300 hover:border-compass-500/50 hover:bg-[#0e1c2c] hover:shadow-glow-teal flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-compass-500/20 border border-compass-500/40 flex items-center justify-center text-compass-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Auto-Triage</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Embeddings + Groq LLM classify every open issue by difficulty, skill area, and estimated effort — zero manual labeling required.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-compass-300">
              <span>Groq llama-3.3-70b</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="group rounded-2xl border border-compass-500/40 bg-[#0c1825] p-7 transition-all duration-300 hover:border-compass-400 hover:bg-[#102030] shadow-glow-teal flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Matching</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Matches a contributor&apos;s skills or GitHub profile to ranked issues across multiple open source repositories at once.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-cyan-300">
              <span>Weighted Multi-Repo Match</span>
            </div>
          </div>

          {/* Col 3 */}
          <div className="group rounded-2xl border border-white/10 bg-[#0a131e] p-7 transition-all duration-300 hover:border-compass-500/50 hover:bg-[#0e1c2c] hover:shadow-glow-teal flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Self-Improving</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Maintainer corrections and label adjustments update the issue knowledge base, ensuring match accuracy and triage fidelity stay sharp.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-emerald-300">
              <span>Active Feedback Loop</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT'S BUILT PIPELINE (From Pitch Deck Page 4) */}
      <section className="py-16 bg-[#04080d] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">How It&apos;s Built</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-[#09111b] border border-white/10 relative overflow-hidden">
              <span className="text-2xl font-mono font-bold text-compass-500 block mb-2">01</span>
              <h4 className="font-bold text-sm text-white mb-1">GitHub API</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingests issues, PR discussions, and metadata from connected repos via REST &amp; GraphQL.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-[#09111b] border border-white/10 relative overflow-hidden">
              <span className="text-2xl font-mono font-bold text-cyan-400 block mb-2">02</span>
              <h4 className="font-bold text-sm text-white mb-1">Text Analysis</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sanitizes issue bodies, extracts technical keywords, and normalizes stack taxonomy.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-[#09111b] border border-white/10 relative overflow-hidden">
              <span className="text-2xl font-mono font-bold text-emerald-400 block mb-2">03</span>
              <h4 className="font-bold text-sm text-white mb-1">AI Classifier</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates difficulty, skill area, and effort with microsecond triage execution.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-[#09111b] border border-white/10 relative overflow-hidden">
              <span className="text-2xl font-mono font-bold text-amber-400 block mb-2">04</span>
              <h4 className="font-bold text-sm text-white mb-1">Match Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ranks candidate issues against contributor skills, experience, and past contribution graph.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-16 max-w-5xl mx-auto px-4 text-center">
        <div className="rounded-3xl border border-compass-500/30 bg-gradient-to-b from-[#0e1d2c] to-[#070e17] p-10 sm:p-14 shadow-glow-teal relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to find your next open-source contribution?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8">
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
              href="/connect"
              className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm border border-white/10 transition-all"
            >
              Connect Your Repo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
