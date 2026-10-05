import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-lg bg-[#141729] border border-render-cyan/40 flex items-center justify-center text-render-cyan mb-6 shadow-glow-render">
        <Compass className="w-7 h-7 animate-spin-slow" />
      </div>
      <h1 className="text-3xl font-extrabold text-white mb-2 font-mono">404: Coordinate Lost</h1>
      <p className="text-sm text-slate-400 max-w-sm mb-6">
        Contrib Compass could not locate this route in the open-source constellation.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-render-cyan to-render-indigo hover:opacity-95 text-slate-950 font-bold text-xs transition-all active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Orbit</span>
      </Link>
    </div>
  );
}
