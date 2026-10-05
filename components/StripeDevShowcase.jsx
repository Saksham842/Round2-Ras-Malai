"use client";

import { useState } from "react";
import { Terminal, Copy, Check, Play, Sparkles, Code2, ArrowRight } from "lucide-react";

export default function StripeDevShowcase() {
  const [activeTab, setActiveTab] = useState("curl"); // "curl" | "node" | "python"
  const [copied, setCopied] = useState(false);
  const [runState, setRunState] = useState("ready"); // "ready" | "loading" | "complete"

  const codeSnippets = {
    curl: `curl https://contrib-compass-api.onrender.com/api/match \\
  -H "Authorization: Bearer session_token_xyz" \\
  -H "Content-Type: application/json" \\
  -d '{
    "skills": ["Next.js", "TypeScript", "TailwindCSS"],
    "githubProfile": "Saksham842"
  }'`,
    node: `import { ContribCompass } from "@contrib/sdk";

const compass = new ContribCompass({ apiKey: process.env.CONTRIB_TOKEN });

const matches = await compass.match({
  skills: ["Next.js", "TypeScript", "TailwindCSS"],
  githubProfile: "Saksham842",
  limit: 5,
});

console.log(matches[0].issue.title, "->", matches[0].score);`,
    python: `from contrib_compass import Client

client = Client(api_key="session_token_xyz")

matches = client.match(
    skills=["Next.js", "TypeScript", "TailwindCSS"],
    github_profile="Saksham842"
)

for m in matches:
    print(f"{m.score}% | {m.issue.title}")`,
  };

  const sampleResponse = `{
  "status": "success",
  "agreement_eval": "94.3%",
  "latency": "312ms",
  "matches": [
    {
      "id": "iss_next_7421",
      "score": 96,
      "repo": "vercel/next.js",
      "title": "Turbopack CSS module resolution under pnpm symlinks",
      "labels": {
        "difficulty": "Intermediate",
        "skillArea": "Frontend / Next.js",
        "effort": "2-4 hrs",
        "confidence": 0.94
      },
      "matchReason": "Strong match with Next.js & Turbopack build system history"
    }
  ]
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setRunState("loading");
    setTimeout(() => {
      setRunState("complete");
    }, 450);
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#080b18] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      {/* Top Stripe Terminal Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0c1022] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2 text-xs font-mono text-slate-400">api.contribcompass.io/v1/match</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Tabs */}
          <div className="flex items-center bg-[#070913] p-0.5 rounded-lg border border-white/5">
            {["curl", "node", "python"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                  activeTab === tab
                    ? "bg-[#635bff] text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={copyCode}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            title="Copy Request"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#00d4b6]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto text-slate-300">
        <pre className="text-slate-300">
          <code>
            {activeTab === "curl" && (
              <>
                <span className="text-[#ff5b79]">curl</span>{" "}
                <span className="text-[#00d4b6]">https://contrib-compass-api.onrender.com/api/match</span>{" "}
                \<br />
                {"  "}<span className="text-[#ffa154]">-H</span>{" "}
                <span className="text-slate-200">&quot;Authorization: Bearer session_token_xyz&quot;</span>{" "}
                \<br />
                {"  "}<span className="text-[#ffa154]">-H</span>{" "}
                <span className="text-slate-200">&quot;Content-Type: application/json&quot;</span>{" "}
                \<br />
                {"  "}<span className="text-[#ffa154]">-d</span>{" "}
                <span className="text-[#79b8ff]">&apos;&#123;</span>
                <br />
                {"    "}<span className="text-[#9cdcfe]">&quot;skills&quot;</span>: [
                <span className="text-[#ce9178]">&quot;Next.js&quot;</span>,{" "}
                <span className="text-[#ce9178]">&quot;TypeScript&quot;</span>,{" "}
                <span className="text-[#ce9178]">&quot;TailwindCSS&quot;</span>],<br />
                {"    "}<span className="text-[#9cdcfe]">&quot;githubProfile&quot;</span>:{" "}
                <span className="text-[#ce9178]">&quot;Saksham842&quot;</span>
                <br />
                {"  "}<span className="text-[#79b8ff]">&#125;&apos;</span>
              </>
            )}
            {activeTab === "node" && (
              <>
                <span className="text-[#ff5b79]">import</span> &#123; ContribCompass &#125;{" "}
                <span className="text-[#ff5b79]">from</span>{" "}
                <span className="text-[#ce9178]">&quot;@contrib/sdk&quot;</span>;<br />
                <br />
                <span className="text-[#635bff]">const</span> compass ={" "}
                <span className="text-[#635bff]">new</span> ContribCompass(&#123; apiKey: process.env.CONTRIB_TOKEN &#125;);<br />
                <br />
                <span className="text-[#635bff]">const</span> matches ={" "}
                <span className="text-[#ff5b79]">await</span> compass.match(&#123;<br />
                {"  "}skills: [<span className="text-[#ce9178]">&quot;Next.js&quot;</span>,{" "}
                <span className="text-[#ce9178]">&quot;TypeScript&quot;</span>],<br />
                {"  "}githubProfile: <span className="text-[#ce9178]">&quot;Saksham842&quot;</span><br />
                &#125;);
              </>
            )}
            {activeTab === "python" && (
              <>
                <span className="text-[#ff5b79]">from</span> contrib_compass{" "}
                <span className="text-[#ff5b79]">import</span> Client<br />
                <br />
                client = Client(api_key=<span className="text-[#ce9178]">&quot;session_token_xyz&quot;</span>)<br />
                matches = client.match(<br />
                {"    "}skills=[<span className="text-[#ce9178]">&quot;Next.js&quot;</span>,{" "}
                <span className="text-[#ce9178]">&quot;TypeScript&quot;</span>],<br />
                {"    "}github_profile=<span className="text-[#ce9178]">&quot;Saksham842&quot;</span><br />
                )
              </>
            )}
          </code>
        </pre>
      </div>

      {/* Interactive Trigger Button Bar */}
      <div className="px-4 py-2.5 bg-[#090d1f] border-t border-white/5 flex items-center justify-between">
        <button
          onClick={handleRun}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#635bff]/20 hover:bg-[#635bff]/30 border border-[#635bff]/40 text-[#635bff] hover:text-white transition-all text-xs font-mono font-semibold"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{runState === "loading" ? "Executing on Groq..." : "Run Test Request"}</span>
        </button>

        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4b6] animate-pulse" />
          <span>768-D Vector Match Response</span>
        </span>
      </div>

      {/* Response Drawer */}
      <div className="p-4 bg-[#050710] border-t border-white/10 font-mono text-[11px] text-slate-400">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#00d4b6] font-bold">200 OK • Groq LLM (312ms)</span>
          <span className="text-slate-500">JSON Output</span>
        </div>
        <pre className="text-slate-300 overflow-x-auto">
          <code>{sampleResponse}</code>
        </pre>
      </div>
    </div>
  );
}
