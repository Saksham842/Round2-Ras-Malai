"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Compass, Github, Sparkles, Loader2, Shield } from "lucide-react";
import { loginWithGithub, getStoredUser } from "../../lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const existing = getStoredUser();
    if (existing) {
      router.push("/connect");
      return;
    }

    // Check for GitHub OAuth callback code in URL
    const code = searchParams.get("code");
    if (code) {
      handleOAuthCallback(code);
    }
  }, [searchParams, router]);

  const handleOAuthCallback = async (code) => {
    setLoading(true);
    setError("");
    try {
      await loginWithGithub(code);
      router.push("/connect");
    } catch (err) {
      setError(err.message || "OAuth exchange failed. Please try demo mode.");
      setLoading(false);
    }
  };

  const handleGithubClick = async () => {
    setLoading(true);
    setError("");

    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (clientId && typeof window !== "undefined") {
      const redirectUri = encodeURIComponent(window.location.origin + "/login");
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user,repo&redirect_uri=${redirectUri}`;
      return;
    }

    try {
      await loginWithGithub();
      router.push("/connect");
    } catch (err) {
      setError(err.message || "Failed to sign in. Falling back to Demo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setDemoLoading(true);
    try {
      await loginWithGithub("demo_code");
      router.push("/connect");
    } catch (err) {
      setError(err.message);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="rounded-3xl border border-white/10 bg-[#0c1520]/90 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl text-center relative overflow-hidden">
        {/* Subtle top laser border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-compass-400 to-transparent" />

        {/* Logo Glyph */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-compass-500/20 to-cyan-500/20 border border-compass-500/40 flex items-center justify-center mx-auto mb-6 shadow-glow-teal">
          <Compass className="w-8 h-8 text-compass-400 animate-spin-slow" />
        </div>

        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">
          Welcome to <span className="text-compass-400">Contrib Compass</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mb-8 leading-relaxed">
          Sign in to discover calibrated open-source issues matched to your verified GitHub skill graph.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs text-left">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {/* Real GitHub OAuth Button */}
          <button
            onClick={handleGithubClick}
            disabled={loading || demoLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-glow-teal transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Github className="w-5 h-5 fill-slate-950" />
            )}
            <span>{loading ? "Connecting to GitHub..." : "Sign in with GitHub"}</span>
          </button>

          {/* Instant Demo Access Button */}
          <button
            onClick={handleDemoSignIn}
            disabled={loading || demoLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 transition-all hover:border-compass-400/40 disabled:opacity-50"
          >
            {demoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-compass-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-compass-400" />
            )}
            <span>Instant Hackathon Demo Sign-in (1-Click)</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Read-only GitHub profile & public repo access</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-compass-500/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={
        <div className="flex items-center gap-3 text-compass-400 font-mono text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Initializing Auth Handshake...</span>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
