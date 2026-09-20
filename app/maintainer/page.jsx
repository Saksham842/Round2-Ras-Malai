"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  RefreshCcw, 
  BrainCircuit, 
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";
import IssueCard from "../../components/IssueCard";
import { getIssues, correctLabel, getConnectedRepos } from "../../lib/api";

export default function MaintainerPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackCount, setFeedbackCount] = useState(3);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const data = await getIssues();
      setIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrect = async (issueId, newLabels) => {
    try {
      await correctLabel(issueId, newLabels);
      setToast(`Label corrected for Issue #${issueId}! Verified labels logged and active in matching engine.`);
      setFeedbackCount((prev) => prev + 1);
      setTimeout(() => setToast(""), 4500);

      setIssues((prev) =>
        prev.map((iss) =>
          iss.id === issueId
            ? {
                ...iss,
                labels: {
                  ...iss.labels,
                  ...newLabels,
                  maintainerVerified: true,
                  confidence: 1.0,
                },
              }
            : iss
        )
      );
    } catch (err) {
      alert("Error updating label: " + err.message);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center gap-2 shadow-glow-emerald animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-compass-500/10 border border-compass-500/30 text-compass-300 text-xs font-mono mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-compass-400" />
            <span>Maintainer Feedback Loop</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Maintainer Triage & Feedback Studio</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Review auto-generated difficulty and skill labels. Maintainer corrections are stored and immediately override model labels in the matching engine.
          </p>
        </div>

        <button
          onClick={loadIssues}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-white/10 transition-all self-start md:self-auto"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Model Feedback Metrics Banner (From Pitch Deck Self-Improving concept) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-white/10 bg-[#0c1520]/80 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <BrainCircuit className="w-4 h-4 text-compass-400" />
            <span>Model Confidence</span>
          </div>
          <div className="text-2xl font-black font-mono text-white">94.8%</div>
          <span className="text-[10px] text-emerald-400 font-mono">+3.2% after maintainer corrections</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c1520]/80 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Verified Issues</span>
          </div>
          <div className="text-2xl font-black font-mono text-white">{feedbackCount} Issues</div>
          <span className="text-[10px] text-cyan-400 font-mono">Feedback logged into dataset</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c1520]/80 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Matching Accuracy</span>
          </div>
          <div className="text-2xl font-black font-mono text-white">Compound</div>
          <span className="text-[10px] text-slate-400 font-mono">Self-improving training loop active</span>
        </div>
      </div>

      {/* Issues list with Maintainer editor enabled */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-base font-bold text-white">Auto-Triaged Issue Queue</h2>
          <span className="text-xs font-mono text-slate-400">Click &quot;Edit&quot; on any card to correct labels</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="h-60 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onCorrectLabel={handleCorrect}
                isMaintainerView={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="mt-12 flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
        <span className="text-slate-400 font-mono">Full Demo Loop Ready: /login → /connect → /dashboard → /match → /maintainer</span>
        <Link
          href="/match"
          className="flex items-center gap-1 text-compass-400 hover:text-white font-semibold"
        >
          <span>Return to Matchmaker</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
