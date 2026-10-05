"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GitPullRequest, 
  Filter, 
  Search, 
  RefreshCcw, 
  Sparkles, 
  Layers, 
  FolderOpen, 
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2
} from "lucide-react";
import IssueCard from "../../components/IssueCard";
import { getIssues, getConnectedRepos, correctLabel } from "../../lib/api";

export default function DashboardPage() {
  const [issues, setIssues] = useState([]);
  const [repos, setRepos] = useState([]);
  const [selectedRepoFilter, setSelectedRepoFilter] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Load repos
      const connected = await getConnectedRepos();
      setRepos(connected);

      // 2. Read selected repos from localStorage if any
      let repoQuery = null;
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("contrib_selected_repos");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.length > 0) {
              repoQuery = parsed;
            }
          } catch (e) {
            // ignore
          }
        }
      }

      // 3. Fetch issues
      const data = await getIssues(repoQuery);
      setIssues(data);
    } catch (err) {
      setError(err.message || "Failed to load issues. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectLabel = async (issueId, newLabels) => {
    try {
      const res = await correctLabel(issueId, newLabels);
      setToastMessage("Issue labels updated & training feedback recorded!");
      setTimeout(() => setToastMessage(""), 4000);
      // Update locally
      setIssues((prev) =>
        prev.map((iss) =>
          iss.id === issueId
            ? { ...iss, labels: { ...iss.labels, ...newLabels, maintainerVerified: true } }
            : iss
        )
      );
    } catch (err) {
      alert("Failed to update label: " + err.message);
    }
  };

  // Filter issues by repo, difficulty, and search query
  const filteredIssues = issues.filter((iss) => {
    if (selectedRepoFilter !== "all" && iss.repoId !== selectedRepoFilter) {
      return false;
    }
    if (selectedDifficulty !== "all") {
      if (!iss.labels) return false;
      if (iss.labels.difficulty?.toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = iss.title.toLowerCase().includes(q);
      const matchBody = iss.body?.toLowerCase().includes(q);
      const matchSkill = iss.labels?.skillArea?.toLowerCase().includes(q);
      if (!matchTitle && !matchBody && !matchSkill) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 bg-[#08090f] text-slate-100">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 p-3 rounded-lg bg-[#121526] border border-render-cyan/40 text-render-cyan text-xs font-mono flex items-center gap-2 shadow-glow-render">
          <CheckCircle className="w-4 h-4 text-render-cyan" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#121526] border border-[#232742] text-render-cyan text-xs font-mono mb-2">
            <GitPullRequest className="w-3.5 h-3.5 text-render-cyan" />
            <span>AI Triage Feed</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-sans">Classified Open-Source Issues</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time feed classified by difficulty, required skill area, and estimated effort using Groq LLMs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121526] hover:bg-[#181d33] text-slate-300 font-mono text-xs border border-[#232742] hover:border-slate-500 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Issues</span>
          </button>

          <Link
            href="/match"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-render-cyan via-render-indigo to-render-violet hover:opacity-90 text-slate-950 font-bold text-xs shadow-glow-render transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Match My Skills</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-[#232742] bg-[#0e101d] p-3 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or skill (e.g. React, Docs)..."
            className="w-full bg-[#08090f] border border-[#232742] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-render-cyan font-mono transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Repo Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Layers className="w-3.5 h-3.5 text-render-cyan" />
            <select
              value={selectedRepoFilter}
              onChange={(e) => setSelectedRepoFilter(e.target.value)}
              className="bg-[#08090f] border border-[#232742] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-render-cyan cursor-pointer font-mono"
            >
              <option value="all">All Connected Repos</option>
              {repos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Filter className="w-3.5 h-3.5 text-render-indigo" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-[#08090f] border border-[#232742] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-render-indigo cursor-pointer font-mono"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy (Beginner)</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state with retry */}
      {error && (
        <div className="mb-8 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-md text-xs font-mono"
          >
            Retry Call
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#232742] bg-[#0e101d] p-6 animate-pulse space-y-4"
            >
              <div className="h-4 bg-white/10 rounded w-1/3" />
              <div className="h-6 bg-white/10 rounded w-4/5" />
              <div className="h-14 bg-white/5 rounded w-full" />
              <div className="flex gap-2 pt-2">
                <div className="h-5 bg-white/10 rounded w-16" />
                <div className="h-5 bg-white/10 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredIssues.length === 0 ? (
        /* Empty state */
        <div className="rounded-xl border border-dashed border-[#232742] bg-[#0e101d] p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-lg bg-[#141729] border border-[#232742] flex items-center justify-center mx-auto mb-4 text-slate-500">
            <FolderOpen className="w-6 h-6 text-render-cyan/80" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No issues found matching your filters</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Try adjusting your difficulty or repository filters, or connect a new GitHub repository to ingest more open issues.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSelectedDifficulty("all");
                setSelectedRepoFilter("all");
                setSearchQuery("");
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#141729] hover:bg-[#1a1f36] text-white font-mono text-xs border border-[#232742] transition-colors"
            >
              Reset Filters
            </button>
            <Link
              href="/connect"
              className="px-3.5 py-1.5 rounded-lg bg-render-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-glow-render"
            >
              Connect More Repos
            </Link>
          </div>
        </div>
      ) : (
        /* Issues Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onCorrectLabel={handleCorrectLabel}
              isMaintainerView={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
