"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import { User, Sparkles, ExternalLink, ArrowRight, Zap, Award, CheckCircle2, GitPullRequest } from "lucide-react";

// Safe isomorphic layout effect for Next.js SSR
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function GSAPMatchVisualizer({ matches = [], contributor, onSelectIssue }) {
  const containerRef = useRef(null);
  const contributorCardRef = useRef(null);
  const issuesListRef = useRef(null);
  const beamSvgRef = useRef(null);
  const [animatedScores, setAnimatedScores] = useState({});

  useIsomorphicLayoutEffect(() => {
    if (!matches || matches.length === 0 || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Initial State Setup
      gsap.set(contributorCardRef.current, { opacity: 0, x: -40, scale: 0.95 });
      const issueCards = issuesListRef.current.querySelectorAll(".match-card");
      gsap.set(issueCards, { opacity: 0, x: 40, scale: 0.95 });

      const progressBars = issuesListRef.current.querySelectorAll(".score-bar-fill");
      gsap.set(progressBars, { width: "0%" });

      const beamLines = beamSvgRef.current ? beamSvgRef.current.querySelectorAll(".laser-beam") : [];
      if (beamLines.length > 0) {
        gsap.set(beamLines, { strokeDashoffset: 1000, opacity: 0 });
      }

      // Master Timeline under 2.5 seconds total
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          // Subtle high-score celebratory confetti
          if (matches[0]?.score >= 90) {
            try {
              confetti({
                particleCount: 35,
                spread: 60,
                origin: { y: 0.6 },
                colors: ["#14b8a6", "#06b6d4", "#10b981", "#ffffff"],
              });
            } catch (e) {
              // ignore if blocked
            }
          }
        },
      });

      // 2. Animate Contributor Node
      tl.to(contributorCardRef.current, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.45,
      });

      // 3. Stagger Issue Cards Reveal
      tl.to(
        issueCards,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.12,
        },
        "-=0.15"
      );

      // 4. Laser Scanning Pulse / Beam connecting contributor to issues
      if (beamLines.length > 0) {
        tl.to(
          beamLines,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.inOut",
          },
          "-=0.35"
        );
      }

      // 5. Animate Score Bars Filling and Percentage Numbers
      matches.forEach((item, idx) => {
        const bar = issueCards[idx]?.querySelector(".score-bar-fill");
        const targetScore = item.score || 85;

        if (bar) {
          tl.to(
            bar,
            {
              width: `${targetScore}%`,
              duration: 0.7,
              ease: "power2.out",
            },
            `-=${idx === 0 ? 0.3 : 0.55}`
          );
        }

        // Animate counter object
        const scoreCounterObj = { val: 0 };
        tl.to(
          scoreCounterObj,
          {
            val: targetScore,
            duration: 0.7,
            ease: "power2.out",
            onUpdate: () => {
              setAnimatedScores((prev) => ({
                ...prev,
                [item.issue.id]: Math.round(scoreCounterObj.val),
              }));
            },
          },
          "<"
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [matches]);

  if (!matches || matches.length === 0) return null;

  return (
    <div ref={containerRef} className="relative w-full my-8">
      {/* Visualizer Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-compass-500/20 border border-compass-500/40 flex items-center justify-center text-compass-400">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Neural Match Engine <span className="text-xs font-mono font-normal text-compass-400">GSAP Beam Stream</span>
            </h2>
            <p className="text-xs text-slate-400">
              Multi-factor matching across repository issues weighted against contributor skill graph
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {matches.length} Top Issues Synthesized
        </span>
      </div>

      {/* Main Split Grid: Contributor on Left, Issues on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* LEFT COLUMN: Contributor Profile Node */}
        <div
          ref={contributorCardRef}
          className="lg:col-span-4 rounded-2xl border border-compass-500/30 bg-gradient-to-b from-[#0c1825] to-[#060c14] p-6 shadow-glow-teal relative overflow-hidden"
        >
          {/* Subtle Ambient Radial */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-compass-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              {contributor?.avatar_url ? (
                <img
                  src={contributor.avatar_url}
                  alt={contributor.name || contributor.login}
                  className="w-16 h-16 rounded-2xl border-2 border-compass-400 object-cover shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-compass-700 border border-compass-400 flex items-center justify-center text-xl font-bold text-white">
                  {(contributor?.login || "C").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-[#0c1825] rounded-full" />
            </div>

            <div>
              <h3 className="font-bold text-base text-white">{contributor?.name || contributor?.login || "Contributor"}</h3>
              <p className="text-xs font-mono text-compass-400">@{contributor?.login || "contributor"}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
                Ready for Assignment
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1.5">Profile Bio / Focus</span>
              <p className="text-slate-300 text-xs leading-relaxed">
                {contributor?.bio || "Open source developer exploring targeted first-issue contributions."}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1.5">Active Skills Matched</span>
              <div className="flex flex-wrap gap-1.5">
                {(contributor?.skills || ["React", "TypeScript", "Next.js", "Tailwind"]).map((sk) => (
                  <span
                    key={sk}
                    className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-compass-500/15 text-compass-300 border border-compass-500/30"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Match Algorithm</span>
              <span className="text-cyan-400">Semantic & Skill Graph</span>
            </div>
          </div>

          {/* Connection Anchor Node for scanning laser illusion */}
          <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-compass-400 border-4 border-[#0c1825] shadow-glow-teal items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </div>
        </div>

        {/* RIGHT COLUMN: Ranked Matched Issues */}
        <div ref={issuesListRef} className="lg:col-span-8 space-y-4 relative">
          {matches.map((item, index) => {
            const currentScore = animatedScores[item.issue.id] ?? item.score;
            const isTopMatch = index === 0;

            return (
              <div
                key={item.issue.id}
                className={`match-card relative rounded-2xl border p-5 backdrop-blur-md transition-all duration-200 ${
                  isTopMatch
                    ? "bg-gradient-to-r from-[#0c1c2b] to-[#09141f] border-compass-400/50 shadow-glow-teal"
                    : "bg-[#09111b]/90 border-white/10 hover:border-compass-500/40"
                }`}
              >
                {/* Rank Badge & Match Score Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                        isTopMatch
                          ? "bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      #{index + 1}
                    </span>

                    <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                      <GitPullRequest className="w-3.5 h-3.5" />
                      {item.issue.repoName || "repo"} #{item.issue.number || item.issue.id}
                    </span>

                    {isTopMatch && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Award className="w-3 h-3" /> Best Fit
                      </span>
                    )}
                  </div>

                  {/* Percentage Score & Gauge */}
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-2xl font-black font-mono tracking-tight text-white">
                        {currentScore}
                      </span>
                      <span className="text-xs font-mono text-compass-400 font-bold">%</span>
                      <span className="text-[10px] uppercase font-mono text-slate-400 ml-1">Match</span>
                    </div>
                  </div>
                </div>

                {/* Animated Score Progress Bar */}
                <div className="w-full bg-slate-900/80 h-2 rounded-full overflow-hidden mb-3 border border-white/5">
                  <div
                    className={`score-bar-fill h-full rounded-full transition-all duration-75 ${
                      isTopMatch
                        ? "bg-gradient-to-r from-compass-400 via-emerald-400 to-cyan-300"
                        : "bg-gradient-to-r from-compass-600 to-compass-400"
                    }`}
                    style={{ width: "0%" }}
                  />
                </div>

                {/* Issue Title */}
                <h4 className="font-semibold text-base text-white mb-2 leading-snug">
                  {item.issue.title}
                </h4>

                {/* Match Reason Deep Dive */}
                <div className="bg-[#050a0f]/60 rounded-xl p-3 border border-white/5 mb-3 text-xs space-y-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-compass-300 font-medium mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-compass-400" />
                      <span>Neural Matching Insight</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      {item.matchReason || "Strong overlap with your demonstrated skill portfolio."}
                    </p>
                  </div>

                  {item.issue.labels?.summary && (
                    <div className="pt-2 border-t border-white/5 flex items-start gap-1.5 text-[11px] text-slate-400">
                      <span className="font-mono text-compass-400/90 font-semibold uppercase tracking-wider text-[9px] shrink-0 mt-0.5">AI Summary:</span>
                      <p className="text-slate-300 line-clamp-2">{item.issue.labels.summary}</p>
                    </div>
                  )}
                </div>

                {/* Bottom Tags and Action */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.issue.labels?.difficulty && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {item.issue.labels.difficulty}
                      </span>
                    )}
                    {item.issue.labels?.skillArea && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-cyan-300 border border-slate-700/50">
                        {item.issue.labels.skillArea}
                      </span>
                    )}
                    {item.issue.labels?.effort && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/50 text-slate-400 border border-slate-700/30">
                        {item.issue.labels.effort}
                      </span>
                    )}
                  </div>

                  <a
                    href={item.issue.url || `https://github.com/search?q=${encodeURIComponent(item.issue.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-compass-400 hover:text-white transition-colors group/btn"
                  >
                    <span>Claim & Start Working</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
