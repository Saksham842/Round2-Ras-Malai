"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X, Key, Github, Cpu, Eye, EyeOff, CheckCircle2, Trash2, ExternalLink
} from "lucide-react";
import {
  getStoredGithubPat, setStoredGithubPat,
  getStoredGroqKey, setStoredGroqKey
} from "../lib/api";

export default function SettingsModal({ onClose }) {
  const [mounted, setMounted] = useState(false);
  const [githubPat, setGithubPat] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [showPat, setShowPat] = useState(false);
  const [showGroq, setShowGroq] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGithubPat(getStoredGithubPat());
    setGroqKey(getStoredGroqKey());
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSave = () => {
    setStoredGithubPat(githubPat.trim());
    setStoredGroqKey(groqKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClear = (type) => {
    if (type === "github") { setGithubPat(""); setStoredGithubPat(""); }
    if (type === "groq") { setGroqKey(""); setStoredGroqKey(""); }
  };

  const hasPat = githubPat.startsWith("ghp_") || githubPat.startsWith("github_pat_");
  const hasGroq = groqKey.startsWith("gsk_");

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      {/* Modal Dialog */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "32rem",
          maxHeight: "calc(100vh - 2.5rem)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-3xl border border-white/15 bg-[#0c1520] shadow-2xl"
      >
        {/* Top glow border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-compass-400 to-transparent" />

        {/* Header - Fixed */}
        <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5 bg-[#0c1520]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-compass-500/15 border border-compass-500/30 flex items-center justify-center">
              <Key className="w-4.5 h-4.5 text-compass-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">API Keys &amp; Settings</h2>
              <p className="text-[11px] text-slate-400 font-mono">Stored locally in your browser only</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body - Scrollable with min-h-0 */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto min-h-0 flex-1 overscroll-contain">
          {/* Privacy notice */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
            🔒 Keys are stored <strong>only in your browser&apos;s localStorage</strong>. They are never retained on the server, only forwarded as headers for your GitHub API queries and Groq AI triage.
          </div>

          {/* GitHub PAT */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
              <Github className="w-3.5 h-3.5 text-slate-400" />
              GitHub Personal Access Token
              {hasPat && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
            </label>
            <div className="relative">
              <input
                type={showPat ? "text" : "password"}
                value={githubPat}
                onChange={(e) => setGithubPat(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#070e17] border border-white/10 rounded-xl px-3 py-2.5 pr-20 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-compass-400 font-mono transition-colors"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPat(!showPat)}
                  className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  title={showPat ? "Hide key" : "Show key"}
                >
                  {showPat ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                {githubPat && (
                  <button
                    type="button"
                    onClick={() => handleClear("github")}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Clear GitHub token"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Needed to fetch real GitHub issues without hitting anonymous rate limits (60/hr → 5,000/hr).{" "}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-compass-400 hover:text-compass-300 inline-flex items-center gap-0.5"
              >
                Generate one <ExternalLink className="w-2.5 h-2.5" />
              </a>{" "}
              (scope: <span className="font-mono text-amber-400">public_repo</span>)
            </p>
          </div>

          {/* Groq API Key */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              Groq API Key
              {hasGroq && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
            </label>
            <div className="relative">
              <input
                type={showGroq ? "text" : "password"}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#070e17] border border-white/10 rounded-xl px-3 py-2.5 pr-20 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-compass-400 font-mono transition-colors"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowGroq(!showGroq)}
                  className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  title={showGroq ? "Hide key" : "Show key"}
                >
                  {showGroq ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                {groqKey && (
                  <button
                    type="button"
                    onClick={() => handleClear("groq")}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Clear Groq key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Powers real-time LLM issue triage with llama-3.1-8b.{" "}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-compass-400 hover:text-compass-300 inline-flex items-center gap-0.5"
              >
                Get one free at console.groq.com <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="shrink-0 px-6 py-4 border-t border-white/5 bg-[#080e16]/90 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950"
            } shadow-glow-teal`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5" />
                <span>Save Keys</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
