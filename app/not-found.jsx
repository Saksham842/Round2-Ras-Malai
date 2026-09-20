import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-compass-500/20 border border-compass-500/30 flex items-center justify-center text-compass-400 mb-6 shadow-glow-teal">
        <Compass className="w-8 h-8 animate-spin-slow" />
      </div>
      <h1 className="text-3xl font-extrabold text-white mb-2 font-mono">404: Coordinate Lost</h1>
      <p className="text-sm text-slate-400 max-w-sm mb-6">
        Contrib Compass could not locate this route in the open-source constellation.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-compass-500 hover:bg-compass-400 text-slate-950 font-semibold text-xs transition-all shadow-glow-teal"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Orbit</span>
      </Link>
    </div>
  );
}
