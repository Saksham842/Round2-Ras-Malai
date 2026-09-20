"use client";

import { useState } from "react";
import { ExternalLink, Clock, Tag, Sparkles, Edit3, Check, Loader2, GitPullRequest } from "lucide-react";
import { truncate } from "../lib/utils";

export default function IssueCard({ issue, onCorrectLabel, isMaintainerView = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [difficulty, setDifficulty] = useState(issue.labels?.difficulty || "Easy");
  const [skillArea, setSkillArea] = useState(issue.labels?.skillArea || "General");
  const [effort, setEffort] = useState(issue.labels?.effort || "2-4 hrs");
  const [isSaving, setIsSaving] = useState(false);

  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "intermediate":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "advanced":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
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

  return (
    <div className="group relative rounded-2xl border border-white/10 bg-[#0c1520]/80 p-5 backdrop-blur-md transition-all duration-300 hover:border-compass-500/40 hover:bg-[#111d2b]/90 hover:shadow-glow-teal flex flex-col justify-between">
      <div>
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
            <GitPullRequest className="w-3 h-3 text-cyan-400" />
            {issue.repoName || "repo"} #{issue.number || issue.id}
          </span>

          <div className="flex items-center gap-2">
            {issue.createdAt && (
              <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {issue.createdAt}
              </span>
            )}
            <a
              href={issue.url || `https://github.com/search?q=${encodeURIComponent(issue.title)}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-compass-400 transition-colors p-1"
              title="View on GitHub"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Issue Title */}
        <h3 className="font-semibold text-base text-white group-hover:text-compass-200 transition-colors leading-snug mb-2">
          {issue.title}
        </h3>

        {/* Issue Body */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed font-sans">
          {issue.body || "No additional description provided in the GitHub issue."}
        </p>

        {/* AI Triage Summary */}
        {issue.labels?.summary && (
          <div className="mb-3.5 p-3 rounded-xl bg-compass-950/40 border border-compass-500/25 text-xs text-compass-200 flex items-start gap-2.5 shadow-sm">
            <div className="p-1 rounded-lg bg-compass-500/15 border border-compass-500/30 text-compass-300 shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] text-compass-400 uppercase tracking-wider font-semibold">AI Triage Summary</span>
                <span className="text-[9px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">Groq LLaMA 3.1</span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed font-sans">{issue.labels.summary}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tags Section / Inline Editor */}
      <div className="pt-3 border-t border-white/5 mt-auto">
        {issue.labels === null ? (
          /* Null labels handled gracefully with animated pulsing classifying badge */
          <div className="flex items-center justify-between bg-compass-950/30 border border-compass-500/30 px-3 py-2 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-compass-300 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-compass-400 animate-spin-slow" />
              <span>Auto-triage in progress: Classifying with Groq LLM...</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-compass-400 animate-ping" />
          </div>
        ) : isEditing ? (
          /* Maintainer Inline Editor */
          <div className="space-y-3 bg-[#070e17] p-3 rounded-xl border border-compass-500/30">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-[#0c1520] border border-white/10 rounded px-2 py-1 text-white text-xs focus:border-compass-400 outline-none"
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
                  className="w-full bg-[#0c1520] border border-white/10 rounded px-2 py-1 text-white text-xs focus:border-compass-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Effort</label>
                <input
                  type="text"
                  value={effort}
                  onChange={(e) => setEffort(e.target.value)}
                  className="w-full bg-[#0c1520] border border-white/10 rounded px-2 py-1 text-white text-xs focus:border-compass-400 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1 bg-compass-500 hover:bg-compass-400 text-slate-950 font-semibold rounded text-xs transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Save & Train
              </button>
            </div>
          </div>
        ) : (
          /* Normal Label Badges */
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`text-[11px] font-medium font-mono px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(
                  issue.labels.difficulty
                )}`}
              >
                {issue.labels.difficulty || "Unrated"}
              </span>

              {issue.labels.skillArea && (
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800/60 text-cyan-300 border border-slate-700/40 flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5 text-cyan-400" />
                  {issue.labels.skillArea}
                </span>
              )}

              {issue.labels.effort && (
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800/40 text-slate-400 border border-slate-700/30">
                  {issue.labels.effort}
                </span>
              )}

              {issue.labels.maintainerVerified && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-compass-500/20 text-compass-300 border border-compass-500/40">
                  ✓ Verified
                </span>
              )}
            </div>

            {isMaintainerView && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-compass-300 transition-colors p-1"
                title="Correct this label"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Edit</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
