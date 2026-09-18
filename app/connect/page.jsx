"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  GitFork, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  Star, 
  ExternalLink, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Check,
  AlertCircle
} from "lucide-react";
import { connectRepo, getConnectedRepos } from "../../lib/api";

const PRESET_REPOS = [
  { url: "https://github.com/vercel/next.js", name: "vercel/next.js", desc: "React Framework" },
  { url: "https://github.com/facebook/react", name: "facebook/react", desc: "UI Library" },
  { url: "https://github.com/fastify/fastify", name: "fastify/fastify", desc: "Fast Node.js Framework" },
  { url: "https://github.com/tailwindlabs/tailwindcss", name: "tailwindlabs/tailwindcss", desc: "Utility-first CSS" },
];

export default function ConnectRepoPage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectedRepos, setConnectedRepos] = useState([]);
  const [selectedRepoIds, setSelectedRepoIds] = useState([]);
  const [successToast, setSuccessToast] = useState("");

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    try {
      const repos = await getConnectedRepos();
      setConnectedRepos(repos);
      // Read saved selections or default to all
      const saved = localStorage.getItem("contrib_selected_repos");
      if (saved) {
        try {
          setSelectedRepoIds(JSON.parse(saved));
        } catch {
          setSelectedRepoIds(repos.map((r) => r.id));
        }
      } else {
        setSelectedRepoIds(repos.map((r) => r.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async (e) => {
    if (e) e.preventDefault();
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError("");
    setSuccessToast("");

    try {
      const result = await connectRepo(repoUrl.trim());
      setSuccessToast(`Successfully connected! Ingested ${result.issuesIngested || 15} issues.`);
      setRepoUrl("");
      await loadRepos();

      // Automatically select the newly connected repo
      if (result.repoId) {
        setSelectedRepoIds((prev) => {
          const updated = Array.from(new Set([...prev, result.repoId]));
          localStorage.setItem("contrib_selected_repos", JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      setError(err.message || "Failed to connect repository. Please verify the URL.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRepoSelection = (id) => {
    setSelectedRepoIds((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      localStorage.setItem("contrib_selected_repos", JSON.stringify(updated));
      return updated;
    });
  };

  const selectAll = () => {
    const allIds = connectedRepos.map((r) => r.id);
    setSelectedRepoIds(allIds);
    localStorage.setItem("contrib_selected_repos", JSON.stringify(allIds));
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-compass-500/10 border border-compass-500/30 text-compass-300 text-xs font-mono mb-3">
          <GitFork className="w-3.5 h-3.5 text-compass-400" />
          <span>Repository Ingestion Gateway</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Connect Open-Source Repositories</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Point Contrib Compass to public GitHub repositories. Our pipeline ingests open issues and classifies them with Groq LLM embeddings for instant matchmaking.
        </p>
      </div>

      {/* Connect Form Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0c1520]/80 p-6 sm:p-8 backdrop-blur-xl mb-10 shadow-xl">
        <form onSubmit={handleConnect} className="space-y-4">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            GitHub Repository URL
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/organization/repository"
                required
                className="w-full bg-[#070e17] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-compass-400 focus:ring-1 focus:ring-compass-400 font-mono transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-glow-teal transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Ingesting Issues...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Connect Repo</span>
                </>
              )}
            </button>
          </div>

          {/* Quick preset pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[11px] font-mono text-slate-400">Quick Try:</span>
            {PRESET_REPOS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setRepoUrl(preset.url)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </form>

        {/* Feedback states */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successToast && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        )}
      </div>

      {/* Connected Repositories Section with Multi-Repo Select */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-compass-400" />
            <h2 className="text-lg font-bold text-white">Active Connected Repositories</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-compass-500/10 text-compass-300 border border-compass-500/20">
              {selectedRepoIds.length} of {connectedRepos.length} selected
            </span>
          </div>

          <button
            type="button"
            onClick={selectAll}
            className="text-xs font-mono text-compass-400 hover:text-white transition-colors"
          >
            Select All Repos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectedRepos.map((repo) => {
            const isSelected = selectedRepoIds.includes(repo.id);

            return (
              <div
                key={repo.id}
                onClick={() => toggleRepoSelection(repo.id)}
                className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 relative select-none ${
                  isSelected
                    ? "bg-[#0e1c2b] border-compass-400/60 shadow-glow-teal"
                    : "bg-[#09111b]/80 border-white/10 opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-compass-500 border-compass-400 text-slate-950"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="font-bold text-sm text-white hover:text-compass-300 transition-colors truncate max-w-[180px]">
                      {repo.name}
                    </span>
                  </div>

                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {repo.description || "Ingested GitHub repository with live issue stream"}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Star className="w-3 h-3 fill-amber-300" />
                    {repo.stars?.toLocaleString() || "1.2k"}
                  </span>
                  <span className="text-compass-400">
                    {repo.issuesIngested || 15} issues indexed
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer Controls */}
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
        <div>
          <h3 className="font-semibold text-sm text-white">Next Step: Find Calibrated Issues</h3>
          <p className="text-xs text-slate-400">
            Query across your selected {selectedRepoIds.length} connected repos or run neural skill matching.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="flex-1 sm:flex-none text-center px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 transition-all"
          >
            Browse Issue Feed
          </Link>
          <Link
            href="/match"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-glow-teal transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Match Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
