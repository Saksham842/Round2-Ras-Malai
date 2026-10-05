"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full rounded-xl border border-[#232742] bg-[#0e101d] p-8 shadow-2xl backdrop-blur-xl">
        <div className="w-12 h-12 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something unexpected happened</h2>
        <p className="text-xs text-slate-400 mb-6 font-mono leading-relaxed">
          {error?.message || "An isolated component failure occurred. You can safely retry or return home."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-render-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-glow-render"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141729] hover:bg-[#1a1f36] text-white font-medium text-xs border border-[#232742] transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
