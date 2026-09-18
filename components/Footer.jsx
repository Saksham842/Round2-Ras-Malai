import Link from "next/link";
import { Compass, Github, Sparkles, ExternalLink, Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#03070b] text-slate-400 text-xs py-10 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/5">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-compass-400" />
              <span className="font-bold text-sm tracking-wide text-white">CONTRIB COMPASS</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-compass-500/10 text-compass-300 border border-compass-500/20">
                v1.0 • Round 2 Pitch
              </span>
            </div>
            <p className="text-slate-400 max-w-md text-xs leading-relaxed">
              AI-powered contributor matching for open-source projects. Eliminates the 60%+ first-timer drop-off by automatically triaging issues by difficulty, skill area, and effort using embeddings & Groq LLMs.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400/80">
              <Cpu className="w-3.5 h-3.5" />
              <span>Stack: Next.js + Tailwind + GSAP + Groq LLM + Sentence Transformers</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-1.5">
              <li><Link href="/dashboard" className="hover:text-compass-400 transition-colors">Issue Feed</Link></li>
              <li><Link href="/match" className="hover:text-compass-400 transition-colors">Smart Matchmaker</Link></li>
              <li><Link href="/connect" className="hover:text-compass-400 transition-colors">Connect Repos</Link></li>
              <li><Link href="/maintainer" className="hover:text-compass-400 transition-colors">Maintainer Studio</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Pitch Scope</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>Auto-Triage with Confidence</li>
              <li>Real-time GSAP Scanning</li>
              <li>Multi-repo Aggregation</li>
              <li>Self-Improving Model Feedback</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 Contrib Compass Team Ras Malai. Building for open source, in the open.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              API Gateway Healthy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
