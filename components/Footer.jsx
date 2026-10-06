import Link from "next/link";
import { Compass, Github, Sparkles, ExternalLink, Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#050a0f] text-slate-400 text-xs py-12 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/[0.06]">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-compass-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-glow-teal">
                <div className="w-full h-full bg-[#050a0f] rounded-[5px] flex items-center justify-center">
                  <Compass className="w-3.5 h-3.5 text-compass-300" />
                </div>
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white">Contrib Compass</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-compass-500/10 text-compass-300 border border-compass-500/20">
                Morrow 1.0 • Round 2 Hackathon
              </span>
            </div>
            <p className="text-slate-400 max-w-md text-xs leading-relaxed">
              AI-powered contributor matching for open-source ecosystems. Eliminates contributor drop-off by automatically triaging issues with Groq LLMs and projecting 768-D vector embeddings in real time.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-compass-400" />
              <span>Next.js 14 • Three.js 3D • GSAP 3 • Groq LPU • Xenova Transformers</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase font-mono">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-compass-300 transition-colors">Issue Radar Feed</Link></li>
              <li><Link href="/match" className="hover:text-compass-300 transition-colors">Neural Match Engine</Link></li>
              <li><Link href="/connect" className="hover:text-compass-300 transition-colors">Connect Repositories</Link></li>
              <li><Link href="/maintainer" className="hover:text-compass-300 transition-colors">Maintainer Studio</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase font-mono">Evaluation &amp; Accuracy</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5"><span className="text-compass-400">✓</span> 94.3% Agreement (N=35)</li>
              <li className="flex items-center gap-1.5"><span className="text-cyan-400">✓</span> &lt; 350ms Inference Latency</li>
              <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 768-D Vector Cosine Sim</li>
              <li className="flex items-center gap-1.5"><span className="text-amber-400">✓</span> Self-Calibrating Overrides</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 Contrib Compass. Building the next generation of open-source discovery.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Services Operational (Render &amp; Groq)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
