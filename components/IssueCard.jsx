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

  // Modern developer badge styling (Render / Linear style)
  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return "bg-cyan-950/40 text-cyan-300 border-cyan-800/60";
      case "intermediate":
        return "bg-amber-950/40 text-amber-300 border-amber-800/60";
      case "advanced":
        return "bg-rose-950/40 text-rose-300 border-rose-800/60";
      default:
        return "bg-slate-800/50 text-slate-300 border-slate-700/50";
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

  // SVG Radial Ring calculation (radius 18, circumference ~113.1)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = displayScore ? circumference - (displayScore / 100) * circumference : circumference;

  return (
    <div className="group relative rounded-xl border border-[#232742] bg-[#0e101d] p-5 transition-all duration-200 hover:border-render-cyan/50 hover:bg-[#121526] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between">
      <div>
        {/* Top meta row with Repo, Number and Radial Score Meter */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-mono text-render-cyan bg-[#141729] border border-[#2b3052] px-2.5 py-1 rounded-md">
              <GitPullRequest className="w-3.5 h-3.5 text-render-cyan" />
              <span className="font-semibold text-slate-200">{issue.repoName || "repo"}</span>
              <span className="text-render-cyan">#{issue.number || issue.id}</span>
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
              <div className="flex items-center gap-2 bg-[#08090f] px-2.5 py-1 rounded-lg border border-[#232742]" title={`Match Compatibility: ${displayScore}%`}>
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
                      stroke="url(#radialGradientRender)"
                      strokeWidth="3.5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                    <defs>
                      <linearGradient id="radialGradientRender" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00e5ff" />
                        <stop offset="60%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute text-[10px] font-mono font-bold text-white">
                    {displayScore}
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Match</span>
                  <span className="text-[11px] font-mono font-bold text-render-cyan">{displayScore}%</span>
                </div>
              </div>
            )}

            {/* Direct Open GitHub Icon */}
            <a
              href={issue.url || `https://github.com/search?q=${encodeURIComponent(issue.title)}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-render-cyan hover:bg-[#191c33] p-1.5 rounded-md transition-all border border-transparent hover:border-[#2b3052]"
              title="Open Issue on GitHub"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Issue Title */}
        <h3 className="font-semibold text-base text-white group-hover:text-render-cyan transition-colors leading-snug mb-2 font-sans">
          {issue.title}
        </h3>

        {/* Issue Body preview */}
        <p className="text-xs text-slate-400 line-clamp-3 mb-3 leading-relaxed font-sans">
          {issue.body || "No additional description provided in the GitHub issue."}
        </p>

        {/* AI Triage Summary Callout (Render codebox style) */}
        {issue.labels?.summary && (
          <div className="mb-3 p-3 rounded-lg bg-[#121526] border border-[#232742] text-xs text-slate-300 flex items-start gap-2.5">
            <div className="p-1 rounded bg-[#1c2138] border border-[#2b3052] text-render-cyan shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] text-render-cyan uppercase tracking-wider font-semibold">
                  AI Triage Summary
                </span>
                <span className="text-[9px] font-mono text-slate-400 px-1.5 py-0.2 rounded bg-[#1c2138] border border-[#2b3052]">
                  Groq LLM
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed font-sans">
                {issue.labels.summary}
              </p>
            </div>
          </div>
        )}

        {/* Why this matches you - AI Match Insight Callout */}
        {(matchReason || issue.matchReason) && (
          <div className="mb-3 p-3 rounded-lg bg-[#14162e] border border-render-indigo/30 flex items-start gap-2.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-render-indigo shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-render-indigo">
                Match Rationale
              </span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {matchReason || issue.matchReason}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tags Section / Inline Editor */}
      <div className="pt-3 border-t border-[#1e2238] mt-auto">
        {issue.labels === null ? (
          /* Graceful classifying state */
          <div className="flex items-center justify-between bg-[#121526] border border-[#232742] px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-render-cyan font-mono">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Auto-triage in progress with Groq LLM...</span>
            </div>
          </div>
        ) : isEditing ? (
          /* Maintainer Inline Editor */
          <div className="space-y-3 bg-[#08090f] p-3 rounded-lg border border-render-cyan/40">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-[#121526] border border-[#232742] rounded-md px-2 py-1.5 text-white text-xs focus:border-render-cyan outline-none font-mono"
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
                  className="w-full bg-[#121526] border border-[#232742] rounded-md px-2 py-1.5 text-white text-xs focus:border-render-cyan outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Effort</label>
                <input
                  type="text"
                  value={effort}
                  onChange={(e) => setEffort(e.target.value)}
                  className="w-full bg-[#121526] border border-[#232742] rounded-md px-2 py-1.5 text-white text-xs focus:border-render-cyan outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-md font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1 bg-render-cyan text-slate-950 font-bold rounded-md text-xs transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Save
              </button>
            </div>
          </div>
        ) : (
          /* Normal Label Badges (Crisp modern tags, no bubbly pills) */
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Difficulty Badge */}
              <span
                className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded-md border ${getDifficultyBadge(
                  issue.labels?.difficulty
                )}`}
              >
                {issue.labels?.difficulty || "Unrated"}
              </span>

              {/* Skill Area */}
              {issue.labels?.skillArea && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#141729] text-render-cyan border border-[#252b47] flex items-center gap-1">
                  <Tag className="w-3 h-3 text-render-cyan" />
                  {issue.labels.skillArea}
                </span>
              )}

              {/* Effort */}
              {issue.labels?.effort && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#141729] text-slate-400 border border-[#252b47] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {issue.labels.effort}
                </span>
              )}

              {/* Maintainer Verification */}
              {issue.labels?.maintainerVerified && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-render-indigo/15 text-render-indigo border border-render-indigo/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {isMaintainerView && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#141729] hover:bg-[#1a1f36] text-[11px] font-mono text-slate-300 hover:text-white border border-[#252b47] transition-colors"
                  title="Calibrate this label"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Calibrate</span>
                </button>
              )}

              <a
                href={issue.url || `https://github.com/search?q=${encodeURIComponent(issue.title)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#141729] hover:bg-[#1c223c] text-[11px] font-mono text-slate-300 hover:text-render-cyan border border-[#252b47] hover:border-render-cyan/40 transition-all"
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
