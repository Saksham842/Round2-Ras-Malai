"use client";

import { useState, useEffect } from "react";
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
  RefreshCw
} from "lucide-react";
import GSAPMatchVisualizer from "../../components/GSAPMatchVisualizer";
import { getMatches, getStoredUser } from "../../lib/api";

const POPULAR_SKILLS = [
  "React", "TypeScript", "Next.js", "Node.js", "Python", "TailwindCSS", "Documentation", "Bug Fixes", "Performance"
];

export default function MatchPage() {
  const [skillsInput, setSkillsInput] = useState("React, TypeScript, Next.js, Architecture");
  const [githubProfile, setGithubProfile] = useState("alexcontributor");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [activeContributor, setActiveContributor] = useState(null);

  useEffect(() => {
    // Read logged-in user if present
    const user = getStoredUser();
    if (user) {
      setGithubProfile(user.login || "alexcontributor");
      if (user.skills && user.skills.length > 0) {
        setSkillsInput(user.skills.join(", "));
      }
      setActiveContributor(user);
    } else {
      setActiveContributor({
        login: "alexcontributor",
        name: "Alex Rivera",
        avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
        bio: "Frontend craftsman & Open Source contributor.",
        skills: ["React", "TypeScript", "Next.js", "TailwindCSS"]
      });
    }

    // Run initial match out of the box so the page loads with vivid visualizer ready
    triggerMatch("React, TypeScript, Next.js, Architecture", user?.login || "alexcontributor");
  }, []);

  const triggerMatch = async (skillsStr, handle) => {
    setLoading(true);
    setError("");
    try {
      const skillsArray = skillsStr.split(",").map((s) => s.trim()).filter(Boolean);
      const results = await getMatches(skillsArray, handle);
      setMatches(results);
      setHasSearched(true);
      setActiveContributor((prev) => ({
        ...prev,
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
    triggerMatch(skillsInput, githubProfile);
  };

  const addSkillChip = (skill) => {
    const current = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (!current.includes(skill)) {
      const updated = [...current, skill].join(", ");
      setSkillsInput(updated);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-compass-500/10 border border-compass-500/30 text-compass-300 text-xs font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5 text-compass-400" />
          <span>AI Neural Matching Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Find Your Calibrated Open-Source Match
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          Our sentence-transformer embeddings compare your technical competencies against thousands of open GitHub issues, ranking them by difficulty, skill synergy, and effort.
        </p>
      </div>

      {/* Skills Input Control Panel */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="rounded-3xl border border-white/10 bg-[#0c1520]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Subtle Top Glow Border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* GitHub Profile Field */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-1.5">
                  GitHub Profile
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={githubProfile}
                    onChange={(e) => setGithubProfile(e.target.value)}
                    placeholder="github_handle"
                    className="w-full bg-[#070e17] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-compass-400 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Skills Field */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-1.5">
                  Skills & Frameworks (Comma separated)
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="e.g. React, Next.js, TypeScript, Tailwind, GraphQL"
                    className="w-full bg-[#070e17] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-compass-400 font-mono transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Quick Skill Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-mono text-slate-400 mr-1">Quick Add:</span>
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

            {/* Submit Match Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-glow-teal transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Neural Match...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Calculate Neural Matches</span>
                  </>
                )}
              </button>
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

      {/* MATCH RESULTS SECTION */}
      {loading ? (
        /* Futuristic scanning radar loader */
        <div className="rounded-3xl border border-white/10 bg-[#070e17]/80 p-12 text-center max-w-xl mx-auto backdrop-blur-xl">
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            {/* Outer spinning radar circle */}
            <div className="absolute inset-0 rounded-full border border-compass-500/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/40 animate-spin-slow" />
            <div className="w-12 h-12 rounded-full bg-compass-500/20 border border-compass-400 flex items-center justify-center text-compass-300 shadow-glow-teal">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Executing Issue Match Engine</h3>
          <p className="text-xs text-slate-400 font-mono max-w-md mx-auto leading-relaxed">
            Analyzing developer skills and evaluating active open repository issues...
          </p>
        </div>
      ) : matches.length > 0 ? (
        /* GSAP Match Visualizer component */
        <GSAPMatchVisualizer
          matches={matches}
          contributor={activeContributor}
        />
      ) : hasSearched ? (
        /* Empty State as requested in Phase 4 */
        <div className="rounded-3xl border border-dashed border-white/10 bg-[#070e17]/50 p-12 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No matches found</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Try broadening your skills or connect more repositories with different tech stacks.
          </p>
          <button
            onClick={() => {
              setSkillsInput("React, TypeScript, Next.js, Node.js");
              triggerMatch("React, TypeScript, Next.js, Node.js", githubProfile);
            }}
            className="px-4 py-2 rounded-xl bg-compass-500 hover:bg-compass-400 text-slate-950 font-semibold text-xs transition-all shadow-glow-teal"
          >
            Load Recommended Skills
          </button>
        </div>
      ) : null}
    </div>
  );
}
