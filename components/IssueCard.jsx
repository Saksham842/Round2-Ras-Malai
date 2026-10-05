"use client";

import { useState } from "react";
import { ExternalLink, Clock, Tag, Sparkles, Edit3, Check, Loader2, GitPullRequest, ShieldCheck, Zap } from "lucide-react";

export default function IssueCard({ 
  issue, 
  score, 
  matchReason, 
  onCorrectLabel, 
  isMaintainerView = false 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [difficulty, setDifficulty] = useState(issue.labels?.difficulty || "Easy");
  const [skillArea, setSkillArea] = useState(issue.labels?.skillArea || "General");
  const [effort, setEffort] = useState(issue.labels?.effort || "2-4 hrs");
  const [isSaving, setIsSaving] = useState(false);

  // High-contrast glowing neon difficulty badges
  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]";
      case "intermediate":
        return "bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]";
      case "advanced":
        return "bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]";
      default:
        return "bg-slate-700/30 text-slate-300 border-slate-600/30";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onCorrectLabel) {
        await onCorrectLabel(issue.id, { difficulty, skillArea, effort });
      }
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const displayScore = score !== undefined ? score : (issue.matchScore || null);

  // SVG Radial Ring calculation (radius 20, circumference ~125.6)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = displayScore ? circumference - (displayScore / 100) * circumference : circumference;

  return (
    <div className="group relative rounded-3xl border border-[#133549] bg-[#001e2b]/85 p-5 backdrop-blur-xl transition-all duration-300 hover:border-mongo-green/50 hover:bg-[#002738] hover:shadow-glow-mongo flex flex-col justify-between">
      <div>
        {/* Top meta row with Repo, Number and Radial Score Meter */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-mono text-render-cyan bg-[#011627] border border-render-cyan/30 px-2.5 py-1 rounded-full shadow-sm">
              <GitPullRequest className="w-3 h-3 text-render-cyan" />
              <span className="font-semibold">{issue.repoName || "repo"}</span>
              <span className="text-render-cyan/80">#{issue.number || issue.id}</span>
            </span>

            {issue.createdAt && (
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {issue.createdAt}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Radial Match Score Ring if available */}
            {displayScore !== null && (
              <div className="flex items-center gap-2 bg-[#011422] px-2.5 py-1 rounded-xl border border-mongo-green/40 shadow-glow-mongo" title={`AI Compatibility: ${displayScore}%`}>
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 44 44">
                    <circle
                      cx="22"
                      cy="22"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="3.5"
                      className="text-slate-800"
                      fill="transparent"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r={radius}
                      stroke="url(#radialGradient)"
                      strokeWidth="3.5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="radialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00ED64" />
                        <stop offset="100%" stopColor="#00F5FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute text-[10px] font-mono font-bold text-white">
                    {displayScore}
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Match</span>
                  <span className="text-[11px] font-mono font-bold text-mongo-green">{displayScore}%</span>
                </div>
              </div>
            )}

            {/* Direct Open GitHub Icon */}
            <a
              href={issue.url || `https://github.com/search?q=${encodeURIComponent(issue.title)}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-render-cyan hover:bg-white/5 p-1.5 rounded-lg transition-all"
              title="Open Issue on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Issue Title */}
        <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-render-cyan transition-colors leading-snug mb-2 font-sans">
          {issue.title}
        </h3>

        {/* Issue Body preview */}
        <p className="text-xs text-slate-400 line-clamp-3 mb-3.5 leading-relaxed font-sans">
          {issue.body || "No additional description provided in the GitHub issue."}
        </p>

        {/* AI Triage Summary if present */}
        {issue.labels?.summary && (
          <div className="mb-3 p-2.5 rounded-xl bg-compass-950/40 border border-compass-500/25 text-xs text-compass-200 flex items-start gap-2.5 shadow-sm">
            <div className="p-1 rounded-lg bg-compass-500/15 border border-compass-500/30 text-compass-300 shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] text-compass-400 uppercase tracking-wider font-semibold">AI Triage Summary</span>
                <span className="text-[9px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">Groq LLM</span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed font-sans">
                {issue.labels.summary}
              </p>
            </div>
          </div>
        )}

        {/* Why this matches you - AI Match Insight Callout */}
        {(matchReason || issue.matchReason) && (
          <div className="mb-4 p-2.5 rounded-xl bg-compass-950/40 border border-compass-500/25 flex items-start gap-2.5 text-xs text-compass-200">
            <Sparkles className="w-4 h-4 text-compass-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-compass-400">
                AI Match Rationale
              </span>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                {matchReason || issue.matchReason}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tags Section / Inline Editor */}
      <div className="pt-3 border-t border-white/5 mt-auto">
        {issue.labels === null ? (
          /* Null labels handled gracefully with animated pulsing classifying badge */
          <div className="flex items-center justify-between bg-compass-950/30 border border-compass-500/30 px-3.5 py-2.5 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-compass-300 font-mono">
              <Sparkles className="w-4 h-4 text-compass-400 animate-spin-slow" />
              <span>Auto-triage in progress: Classifying with Groq LLM...</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-compass-400 animate-ping" />
          </div>
        ) : isEditing ? (
          /* Maintainer Inline Editor */
          <div className="space-y-3 bg-[#070e17] p-3.5 rounded-xl border border-compass-500/40 shadow-inner">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-[#0c1520] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:border-compass-400 outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Skill Area</label>
                <input
                  type="text"
                  value={skillArea}
                  onChange={(e) => setSkillArea(e.target.value)}
                  className="w-full bg-[#0c1520] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:border-compass-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Effort</label>
                <input
                  type="text"
                  value={effort}
                  onChange={(e) => setEffort(e.target.value)}
                  className="w-full bg-[#0c1520] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:border-compass-400 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save & Train Loop
              </button>
            </div>
          </div>
        ) : (
          /* Normal Label Badges with Neon Polish */
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Neon Difficulty Badge */}
              <span
                className={`text-[11px] font-bold font-mono px-3 py-1 rounded-full border ${getDifficultyBadge(
                  issue.labels?.difficulty
                )}`}
              >
                {issue.labels?.difficulty || "Unrated"}
              </span>

              {/* Skill Area */}
              {issue.labels?.skillArea && (
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800/80 text-cyan-300 border border-slate-700/60 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-cyan-400" />
                  {issue.labels.skillArea}
                </span>
              )}

              {/* Effort / Estimate */}
              {issue.labels?.effort && (
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800/50 text-slate-300 border border-slate-700/40 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {issue.labels.effort}
                </span>
              )}

              {/* Maintainer Verification Badge & Feedback Loop indicator */}
              {issue.labels?.maintainerVerified && (
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-compass-500/20 text-compass-300 border border-compass-500/40 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-compass-400" />
                  <span>Verified by Maintainer</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isMaintainerView && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-compass-300 border border-white/10 transition-colors"
                  title="Correct this label"
                >
                  <Edit3 className="w-3 h-3" />
                  <span className="text-[11px] font-mono">Calibrate</span>
                </button>
              )}

              <a
                href={issue.url || `https://github.com/search?q=${encodeURIComponent(issue.title)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-compass-500/20 text-xs text-slate-300 hover:text-compass-300 border border-white/10 hover:border-compass-500/30 transition-all font-mono"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
