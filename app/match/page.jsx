"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, 
  Search, 
  Loader2, 
  Tag, 
  Github, 
  Sliders, 
  AlertCircle, 
  HelpCircle,
  Zap,
  CheckCircle2,
  RefreshCw,
  Award,
  Filter,
  ArrowUpDown,
  UserCheck,
  Code2,
  ExternalLink
} from "lucide-react";
import GSAPMatchVisualizer from "../../components/GSAPMatchVisualizer";
import { getMatches, getStoredUser, getStoredSkills, setStoredSkills, fetchGithubProfileSkills, PERSONA_PROFILES } from "../../lib/api";

const POPULAR_SKILLS = [
  "React", "TypeScript", "Next.js", "Node.js", "Python", "TailwindCSS", "Documentation", "Bug Fixes", "Performance"
];

const PRESET_PERSONAS = [
  { handle: "Saksham842", label: "@Saksham842", desc: "Full Stack & AI" },
  { handle: "shadcn", label: "@shadcn", desc: "UI & Radix" },
  { handle: "leerob", label: "@leerob", desc: "Next.js Core" },
  { handle: "torvalds", label: "@torvalds", desc: "Systems & C" },
];

function MatchContent() {
  const searchParams = useSearchParams();
  const initialUserParam = searchParams.get("user") || "";
  const initialSkillsParam = searchParams.get("skills") || "";

  const [skillsInput, setSkillsInput] = useState(initialSkillsParam || "React, TypeScript, Next.js, Architecture");
  const [githubProfile, setGithubProfile] = useState(initialUserParam || "Saksham842");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanningGithub, setScanningGithub] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [activeContributor, setActiveContributor] = useState(null);
  const [detectedSkills, setDetectedSkills] = useState([]);
  
  // Filter & Sort States
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score"); // score | effort | recent

  useEffect(() => {
    // Initial load: check logged-in user or preset
    const user = getStoredUser();
    const targetHandle = initialUserParam || user?.login || "Saksham842";
    
    setGithubProfile(targetHandle);

    const savedSkills = getStoredSkills();
    const skillsToUse = initialSkillsParam || (savedSkills && savedSkills.length > 0 ? savedSkills.join(", ") : null);
    
    // Automatically trigger initial profile extraction & match for instant wow factor
    handleScanProfile(targetHandle, skillsToUse);
  }, []);

  const handleScanProfile = async (handleToScan, explicitSkills = null) => {
    const handle = (handleToScan || githubProfile).trim();
    if (!handle) return;

    setScanningGithub(true);
    setError("");

    try {
      const profile = await fetchGithubProfileSkills(handle);
      setActiveContributor(profile);

      const skillsToUse = explicitSkills || (profile.skills && profile.skills.length > 0
        ? profile.skills.join(", ")
        : skillsInput);

      setSkillsInput(skillsToUse);
      setDetectedSkills(profile.skills || []);

      await triggerMatch(skillsToUse, profile);
    } catch (err) {
      console.warn("Scan profile warning:", err);
      // Fallback match execution
      await triggerMatch(skillsInput, activeContributor || { login: handle });
    } finally {
      setScanningGithub(false);
    }
  };

  const triggerMatch = async (skillsStr, contributorData = null, repoIds = null) => {
    setLoading(true);
    setError("");
    try {
      const skillsArray = skillsStr.split(",").map((s) => s.trim()).filter(Boolean);
      const handle = contributorData?.login || githubProfile || "contributor";
      
      // Read selected repos from localStorage if not explicitly passed
      const ids = repoIds !== null && repoIds !== undefined
        ? repoIds
        : (() => { try { return JSON.parse(localStorage.getItem("contrib_selected_repos") || "[]"); } catch { return []; } })();

      const results = await getMatches(skillsArray, handle, ids);
      setMatches(results);
      setHasSearched(true);
      
      // Persist skills in localStorage
      setStoredSkills(skillsArray);

      setActiveContributor((prev) => ({
        ...prev,
        ...(contributorData || {}),
        skills: skillsArray,
      }));
    } catch (err) {
      setError(err.message || "Failed to generate matches. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!skillsInput.trim()) return;
    triggerMatch(skillsInput, activeContributor);
  };

  const addSkillChip = (skill) => {
    const current = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (!current.includes(skill)) {
      const updated = [...current, skill].join(", ");
      setSkillsInput(updated);
    }
  };

  const toggleDetectedSkill = (skill) => {
    const current = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
    let updated;
    if (current.includes(skill)) {
      updated = current.filter((s) => s.toLowerCase() !== skill.toLowerCase());
    } else {
      updated = [...current, skill];
    }
    const str = updated.join(", ");
    setSkillsInput(str);
    triggerMatch(str, activeContributor);
  };

  // Filtered & Sorted Matches
  const filteredMatches = matches
    .filter((item) => {
      if (difficultyFilter === "all") return true;
      return item.issue.labels?.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();
    })
    .sort((a, b) => {
      if (sortBy === "score") {
        return (b.score || 0) - (a.score || 0);
      }
      if (sortBy === "effort") {
        const getHours = (str) => {
          if (!str) return 99;
          const match = str.match(/\d+/);
          return match ? parseInt(match[0], 10) : 99;
        };
        return getHours(a.issue.labels?.effort) - getHours(b.issue.labels?.effort);
      }
      return 0;
    });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative bg-[#08090f] text-slate-100">
      {/* Render Signature Atmospheric Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full aurora-orb-cyan opacity-60" />
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full aurora-orb-indigo opacity-60" />
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0e101d] border border-render-cyan/40 text-render-cyan text-xs font-mono mb-3 shadow-glow-render">
          <span className="w-1.5 h-1.5 rounded-full bg-render-cyan animate-pulse" />
          <Sparkles className="w-3.5 h-3.5 text-render-cyan" />
          <span className="font-semibold">AI Neural Vector Matching Engine • Render Cloud</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-sans">
          Calibrated Contributor Matching
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          Groq LLM issue classifications compared with your GitHub developer competencies. Matches ranked 0–100 with explainable AI reasoning.
        </p>
      </div>

      {/* 1-CLICK GITHUB USERNAME SCANNER LAUNCHPAD */}
      <div className="max-w-4xl mx-auto mb-8 relative z-10">
        <div className="rounded-3xl border border-[#222842] bg-[#0e101d]/90 p-6 sm:p-7 backdrop-blur-2xl shadow-glow-indigo relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-render-cyan via-render-indigo to-render-violet" />

          {/* Persona Quick Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <UserCheck className="w-4 h-4 text-render-cyan" />
              <span className="font-semibold">Verified Demo Personas:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_PERSONAS.map((p) => (
                <button
                  key={p.handle}
                  type="button"
                  onClick={() => {
                    setGithubProfile(p.handle);
                    handleScanProfile(p.handle);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-mono border transition-all flex items-center gap-1.5 ${
                    githubProfile.toLowerCase() === p.handle.toLowerCase()
                      ? "bg-render-cyan/20 text-render-cyan border-render-cyan/50 shadow-glow-render"
                      : "bg-[#121626] hover:bg-[#181d33] text-slate-300 hover:text-white border-[#222842]"
                  }`}
                >
                  <span className="font-semibold">{p.label}</span>
                  <span className="text-[10px] text-render-cyan">({p.desc})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transparent Live vs Cached Profile Notice */}
          {activeContributor?.isRateLimited && (
            <div className="mb-4 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>GitHub API rate limit active (60 req/hr). Showing cached profile snapshot for @{activeContributor.login}.</span>
            </div>
          )}

          {activeContributor?.isLive && (
            <div className="mb-4 p-2 rounded-xl bg-[#0f282e] border border-render-emerald/40 text-render-emerald text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-render-emerald" />
              <span>Live GitHub API connection verified ({activeContributor.repoCountAnalyzed || 30} public repositories analyzed).</span>
            </div>
          )}

          {/* GitHub Auto-Skill Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              
              {/* GitHub Profile Input */}
              <div className="md:col-span-4">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-1.5">
                  1. Your GitHub Username
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-render-cyan absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={githubProfile}
                    onChange={(e) => setGithubProfile(e.target.value)}
                    placeholder="e.g. Saksham842 or octocat"
                    className="w-full bg-[#08090f] border border-[#222842] rounded-xl pl-10 pr-24 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-render-cyan focus:shadow-glow-render font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleScanProfile(githubProfile)}
                    disabled={scanningGithub}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-render-cyan/20 hover:bg-render-cyan/30 text-render-cyan border border-render-cyan/40 text-[10px] font-mono font-semibold transition-all disabled:opacity-50"
                  >
                    {scanningGithub ? "Scanning..." : "Scan Repos"}
                  </button>
                </div>
              </div>

              {/* Skills Field */}
              <div className="md:col-span-5">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-1.5">
                  2. Active Skill Graph
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-render-indigo absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="React, Next.js, TypeScript, Node.js..."
                    className="w-full bg-[#08090f] border border-[#222842] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-render-indigo focus:shadow-glow-indigo font-mono transition-all"
                  />
                </div>
              </div>

              {/* Run Matching Action */}
              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={loading || scanningGithub}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-render-cyan via-render-indigo to-render-violet hover:opacity-90 text-slate-950 font-black text-xs shadow-glow-render transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Matching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Find Matches</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Auto-detected Skill Pill Chips with Percentages */}
            {detectedSkills.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-render-cyan" />
                  Auto-detected from GitHub Repos:
                </span>
                {detectedSkills.map((sk) => {
                  const weight = activeContributor?.skillWeights?.[sk] || 85;
                  const isIncluded = skillsInput.toLowerCase().includes(sk.toLowerCase());

                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleDetectedSkill(sk)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all flex items-center gap-1.5 ${
                        isIncluded
                          ? "bg-compass-500/15 text-compass-200 border-compass-500/40 shadow-sm"
                          : "bg-white/5 text-slate-500 border-white/5 line-through opacity-60"
                      }`}
                    >
                      <span>{sk}</span>
                      <span className="text-[10px] font-bold text-cyan-400">{weight}%</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Popular Skills Quick Add */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-slate-400 text-xs">
              <span className="text-[11px] font-mono mr-1">Add Quick:</span>
              {POPULAR_SKILLS.map((sk) => (
                <button
                  key={sk}
                  type="button"
                  onClick={() => addSkillChip(sk)}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-white/5 hover:bg-compass-500/20 hover:text-compass-300 text-slate-400 border border-white/5 transition-all"
                >
                  +{sk}
                </button>
              ))}
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* FILTER & SORT BAR (When results are ready) */}
      {!loading && matches.length > 0 && (
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 mb-6 px-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-compass-400" />
            <span className="text-slate-400">Filter Difficulty:</span>
            {["all", "Easy", "Intermediate", "Advanced"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficultyFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  difficultyFilter.toLowerCase() === lvl.toLowerCase()
                    ? "bg-compass-500/20 text-compass-300 border-compass-500/50"
                    : "bg-white/5 text-slate-400 border-white/5 hover:text-white"
                }`}
              >
                {lvl === "all" ? "All" : lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#070e17] border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs outline-none focus:border-compass-400"
            >
              <option value="score">Highest Match Score (0-100)</option>
              <option value="effort">Quickest Win (Lowest Effort)</option>
            </select>
          </div>
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-[#070e17]/80 p-12 text-center max-w-xl mx-auto backdrop-blur-xl">
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-compass-500/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/40 animate-spin-slow" />
            <div className="w-12 h-12 rounded-full bg-compass-500/20 border border-compass-400 flex items-center justify-center text-compass-300 shadow-glow-teal">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Executing Neural Vector Matching</h3>
          <p className="text-xs text-slate-400 font-mono max-w-md mx-auto leading-relaxed">
            Projecting 768-D sentence-transformer embeddings against GitHub issue difficulty & skill vectors...
          </p>
        </div>
      ) : filteredMatches.length > 0 ? (
        <GSAPMatchVisualizer
          matches={filteredMatches}
          contributor={activeContributor}
        />
      ) : hasSearched ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-[#070e17]/50 p-12 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No matching issues with this filter</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Clear your difficulty filter or add more skills to your profile graph.
          </p>
          <button
            onClick={() => {
              setDifficultyFilter("all");
              setSkillsInput("React, TypeScript, Next.js, Node.js");
              triggerMatch("React, TypeScript, Next.js, Node.js", activeContributor);
            }}
            className="px-4 py-2 rounded-xl bg-compass-500 hover:bg-compass-400 text-slate-950 font-semibold text-xs transition-all shadow-glow-teal"
          >
            Reset Filters
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function MatchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[60vh] text-compass-400 gap-2 font-mono text-xs">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading Contrib Compass Matcher...</span>
        </div>
      }
    >
      <MatchContent />
    </Suspense>
  );
}
