"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Compass, Github, Sparkles, Loader2, Shield, Key, User, Eye, EyeOff, ExternalLink } from "lucide-react";
import { loginWithGithub, loginWithProfile, getStoredUser } from "../../lib/api";

/**
 * Login via GitHub username or PAT — no OAuth app required.
 * Works in any hosted environment without configuring callback URLs.
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  // Profile / PAT login state
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [githubHandle, setGithubHandle] = useState("");
  const [patValue, setPatValue] = useState("");
  const [showPat, setShowPat] = useState(false);

  useEffect(() => {
    // If already logged in, skip to connect page
    const existing = getStoredUser();
    if (existing) {
      router.push("/connect");
      return;
    }

    // Handle GitHub OAuth callback code (only if real OAuth is configured)
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
      setError(err.message || "OAuth exchange failed. Please try signing in with your GitHub username.");
      setLoading(false);
    }
  };

  const handleGithubClick = async () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    // Only redirect to GitHub OAuth if a real client ID is configured
    const hasRealOAuth = clientId && clientId !== "mock_client_id" && clientId.length > 5;

    if (hasRealOAuth && typeof window !== "undefined") {
      setLoading(true);
      const redirectUri = encodeURIComponent(window.location.origin + "/login");
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user,repo&redirect_uri=${redirectUri}`;
      return;
    }

    // No real OAuth app — show the username/PAT form instead
    setShowProfileForm(true);
  };

  const handleProfileLogin = async (e) => {
    e.preventDefault();
    if (!githubHandle.trim() && !patValue.trim()) {
      setError("Enter your GitHub username or a GitHub PAT.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await loginWithProfile(githubHandle.trim(), patValue.trim());
      router.push("/connect");
    } catch (err) {
      setError(err.message || "Could not look up your GitHub profile. Check the username or PAT and try again.");
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
    <div className="w-full max-w-md relative z-10 my-auto">
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
          {!showProfileForm ? (
            <>
              {/* GitHub Sign In Button */}
              <button
                id="github-login-btn"
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
                id="demo-login-btn"
                onClick={handleDemoSignIn}
                disabled={loading || demoLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 transition-all hover:border-compass-400/40 disabled:opacity-50"
              >
                {demoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-compass-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-compass-400" />
                )}
                <span>Instant Demo Sign-in (1-Click)</span>
              </button>
            </>
          ) : (
            /* GitHub Username / PAT form */
            <form onSubmit={handleProfileLogin} className="space-y-3 text-left">
              <div className="p-3 rounded-xl bg-compass-950/30 border border-compass-500/20 text-compass-300 text-[11px] leading-relaxed">
                Enter your <strong>GitHub username</strong> for a public profile login, or paste a{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 inline-flex items-center gap-0.5"
                >
                  GitHub PAT <ExternalLink className="w-2.5 h-2.5" />
                </a>{" "}
                for authenticated access (5,000 req/hr rate limit).
              </div>

              {/* Username field */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  GitHub Username
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={githubHandle}
                    onChange={(e) => setGithubHandle(e.target.value)}
                    placeholder="e.g. torvalds"
                    autoComplete="off"
                    className="w-full bg-[#070e17] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-compass-400 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* PAT field (optional) */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  GitHub PAT <span className="text-slate-600 normal-case">(optional, for rate limits)</span>
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPat ? "text" : "password"}
                    value={patValue}
                    onChange={(e) => setPatValue(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    autoComplete="off"
                    className="w-full bg-[#070e17] border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-compass-400 font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPat(!showPat)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPat ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowProfileForm(false); setError(""); }}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs border border-white/10 transition-all"
                >
                  Back
                </button>
                <button
                  id="profile-login-submit"
                  type="submit"
                  disabled={loading}
                  className="flex-2 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-glow-teal transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
                  <span>{loading ? "Looking up..." : "Sign In"}</span>
                </button>
              </div>

              {/* Always show demo option */}
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={loading || demoLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 transition-all hover:border-compass-400/40 disabled:opacity-50"
              >
                {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-compass-400" /> : <Sparkles className="w-3.5 h-3.5 text-compass-400" />}
                <span>Continue with Demo instead</span>
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Read-only GitHub profile &amp; public repo access</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-10 min-h-[calc(100vh-8rem)] relative">
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
