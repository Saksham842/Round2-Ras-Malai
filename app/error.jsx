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
      <div className="max-w-md w-full rounded-2xl border border-rose-500/30 bg-[#0c1520] p-8 shadow-2xl backdrop-blur-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something unexpected happened</h2>
        <p className="text-xs text-slate-400 mb-6 font-mono leading-relaxed">
          {error?.message || "An isolated component failure occurred. You can safely retry or return home."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-compass-500 hover:bg-compass-400 text-slate-950 font-semibold text-xs transition-all shadow-glow-teal"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
