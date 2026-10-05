"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Compass, GitPullRequest, GitFork, Sparkles, Shield, Github, LogOut, CheckCircle2, Settings } from "lucide-react";
import { getStoredUser, isMockMode, setMockMode, getStoredGithubPat, getStoredGroqKey } from "../lib/api";
import SettingsModal from "./SettingsModal";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mockActive, setMockActive] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [hasKeys, setHasKeys] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setMockActive(isMockMode());
    setHasKeys(!!(getStoredGithubPat() || getStoredGroqKey()));

    const handleAuthChange = () => {
      setUser(getStoredUser());
      setMockActive(isMockMode());
      setHasKeys(!!(getStoredGithubPat() || getStoredGroqKey()));
    };
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("api-mode-change", handleAuthChange);
    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("api-mode-change", handleAuthChange);
    };
  }, [pathname]);

  const navLinks = [
    { href: "/dashboard", label: "Issue Feed", icon: GitPullRequest },
    { href: "/match", label: "Smart Match", icon: Sparkles },
    { href: "/connect", label: "Connect Repos", icon: GitFork },
    { href: "/maintainer", label: "Maintainer Studio", icon: Shield },
  ];

  const toggleMock = () => {
    const next = !mockActive;
    setMockMode(next);
    setMockActive(next);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("contrib_session_token");
      localStorage.removeItem("contrib_user");
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#133549]/60 bg-[#001420]/80 backdrop-blur-2xl transition-all shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo with MongoDB emerald and Render cyan flair */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-mongo-green via-render-cyan to-render-violet p-0.5 shadow-glow-mongo transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow-render">
            <div className="w-full h-full bg-[#001e2b] rounded-[14px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-mongo-green group-hover:text-render-cyan animate-spin-slow group-hover:rotate-45 transition-all duration-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-mongo-green rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-mongo-green rounded-full" />
          </div>

          <div className="flex flex-col">
            <span className="font-black text-lg tracking-wider text-white flex items-center gap-1.5 font-sans">
              CONTRIB <span className="bg-gradient-to-r from-mongo-green to-render-cyan bg-clip-text text-transparent">COMPASS</span>
            </span>
            <span className="text-[9px] font-mono text-render-cyan/80 tracking-widest uppercase">
              AI OSS MATCHING • MONGO &amp; RENDER THEME
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#011627]/60 border border-white/5 p-1 rounded-2xl backdrop-blur-md">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-mongo-green/15 text-mongo-green border border-mongo-green/30 shadow-glow-mongo"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-mongo-green" : "text-slate-500"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-3">
          {/* Demo / Live Toggle Pill for judges & presentation */}
          <button
            onClick={toggleMock}
            title="Click to toggle between Simulated Mock Fixtures and Real Backend API"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border transition-all ${
              mockActive
                ? "bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50"
                : "bg-mongo-spruce/60 border-mongo-green/40 text-mongo-green shadow-glow-mongo hover:bg-mongo-spruce"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${mockActive ? "bg-amber-400" : "bg-mongo-green animate-pulse"}`} />
            <span>{mockActive ? "MODE: DEMO FIXTURES" : "MODE: LIVE BACKEND"}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
              <div className="flex items-center gap-2">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.login}
                    className="w-7 h-7 rounded-full border border-compass-400/40 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-compass-600 flex items-center justify-center text-xs font-bold text-white">
                    {(user.login || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-medium text-white truncate max-w-[100px] leading-tight">
                    {user.name || user.login}
                  </span>
                  <span className="text-[10px] text-compass-400 font-mono">
                    @{user.login}
                  </span>
                </div>
              </div>

              {/* Settings / API Keys button */}
              <button
                onClick={() => setShowSettings(true)}
                title="API Keys & Settings"
                className="relative p-1.5 rounded-lg text-slate-400 hover:text-compass-300 hover:bg-compass-500/10 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {hasKeys && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-[#050a0f]" />
                )}
              </button>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Settings available even when logged out */}
              <button
                onClick={() => setShowSettings(true)}
                title="API Keys & Settings"
                className="relative p-1.5 rounded-lg text-slate-400 hover:text-compass-300 hover:bg-compass-500/10 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {hasKeys && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-[#050a0f]" />
                )}
              </button>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950 font-semibold text-xs shadow-glow-teal transition-all active:scale-95"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>

    {showSettings && (
      <SettingsModal onClose={() => { setShowSettings(false); setHasKeys(!!(getStoredGithubPat() || getStoredGroqKey())); }} />
    )}
  </>
);
}
