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
      <header className="sticky top-0 z-50 w-full border-b border-[#222842] bg-[#08090f]/85 backdrop-blur-2xl transition-all shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo with Render.com signature cyan, indigo & violet */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-render-cyan via-render-indigo to-render-violet p-0.5 transition-all duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#0d101a] rounded-[6px] flex items-center justify-center">
              <Compass className="w-4.5 h-4.5 text-render-cyan group-hover:rotate-45 transition-all duration-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-render-cyan rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-render-cyan rounded-full" />
          </div>

          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-wider text-white flex items-center gap-1.5 font-sans">
              CONTRIB <span className="bg-gradient-to-r from-render-cyan via-render-indigo to-render-violet bg-clip-text text-transparent">COMPASS</span>
            </span>
            <span className="text-[9px] font-mono text-slate-400 tracking-wider uppercase">
              AI OSS MATCHING • RENDER CLOUD UI
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0e101d] border border-[#232742] p-1 rounded-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#181d33] text-render-cyan border border-render-cyan/40 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-render-cyan" : "text-slate-500"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Demo / Live Toggle Chip for judges & presentation */}
          <button
            onClick={toggleMock}
            title="Click to toggle between Simulated Mock Fixtures and Real Backend API"
            className={`hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-mono border transition-all ${
              mockActive
                ? "bg-[#121526] border-amber-500/40 text-amber-300 hover:border-amber-400/60"
                : "bg-[#121526] border-[#232742] text-slate-300 hover:border-render-cyan/50 hover:text-white"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${mockActive ? "bg-amber-400" : "bg-render-cyan animate-pulse"}`} />
            <span className="tracking-wide font-medium">{mockActive ? "MODE: DEMO FIXTURES" : "MODE: LIVE BACKEND"}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="flex items-center gap-2">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.login}
                    className="w-7 h-7 rounded-md border border-[#232742] object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-md bg-render-indigo flex items-center justify-center text-xs font-bold text-white">
                    {(user.login || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-medium text-white truncate max-w-[100px] leading-tight">
                    {user.name || user.login}
                  </span>
                  <span className="text-[10px] text-render-cyan font-mono">
                    @{user.login}
                  </span>
                </div>
              </div>

              {/* Settings / API Keys button */}
              <button
                onClick={() => setShowSettings(true)}
                title="API Keys & Settings"
                className="relative p-1.5 rounded-md text-slate-400 hover:text-render-cyan hover:bg-[#121526] border border-transparent hover:border-[#232742] transition-colors"
              >
                <Settings className="w-4 h-4" />
                {hasKeys && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-render-cyan rounded-full" />
                )}
              </button>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-[#121526] border border-transparent hover:border-[#232742] transition-colors"
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
                className="relative p-1.5 rounded-md text-slate-400 hover:text-render-cyan hover:bg-[#121526] border border-transparent hover:border-[#232742] transition-colors"
              >
                <Settings className="w-4 h-4" />
                {hasKeys && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-render-cyan rounded-full" />
                )}
              </button>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-render-cyan to-render-indigo hover:opacity-95 text-slate-950 font-bold text-xs transition-all active:scale-95"
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
