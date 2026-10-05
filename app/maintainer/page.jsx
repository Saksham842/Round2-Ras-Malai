"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCcw, 
  ArrowRight
} from "lucide-react";
import IssueCard from "../../components/IssueCard";
import { getIssues, correctLabel, getConnectedRepos } from "../../lib/api";

export default function MaintainerPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
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
        <div className="fixed bottom-8 right-8 z-50 p-3 rounded-lg bg-[#121526] border border-render-cyan/40 text-render-cyan text-xs font-mono flex items-center gap-2 shadow-glow-render">
          <CheckCircle2 className="w-4 h-4 text-render-cyan" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#121526] border border-[#232742] text-render-cyan text-xs font-mono mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-render-cyan" />
            <span>Maintainer Feedback Loop</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Maintainer Triage &amp; Feedback Studio</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Review auto-generated difficulty and skill labels. Maintainer corrections are stored and immediately override model labels in the matching engine.
          </p>
        </div>

        <button
          onClick={loadIssues}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#141729] hover:bg-[#1a1f36] text-white font-mono text-xs border border-[#232742] transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Issues list with Maintainer editor enabled */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-base font-bold text-white">Auto-Triaged Issue Queue</h2>
          <span className="text-xs font-mono text-slate-400">Click &quot;Calibrate&quot; on any card to correct labels</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="h-60 rounded-xl bg-white/5 animate-pulse" />
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
      <div className="mt-12 flex items-center justify-between p-5 rounded-xl bg-[#0e101d] border border-[#232742] text-xs">
        <span className="text-slate-400 font-mono">Changes take effect immediately across all contributor match queries.</span>
        <Link
          href="/match"
          className="flex items-center gap-1 text-render-cyan hover:underline font-semibold"
        >
          <span>Return to Matchmaker</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
