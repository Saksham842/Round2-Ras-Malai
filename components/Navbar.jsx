"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Compass, GitPullRequest, GitFork, Sparkles, Shield, Github, LogOut, CheckCircle2 } from "lucide-react";
import { getStoredUser, isMockMode, setMockMode } from "../lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mockActive, setMockActive] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setMockActive(isMockMode());

    const handleAuthChange = () => {
      setUser(getStoredUser());
      setMockActive(isMockMode());
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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050a0f]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo matching Pitch Deck geometry */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-compass-400 to-compass-700 shadow-glow-teal p-0.5 transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#07131e] rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-compass-400 animate-spin-slow group-hover:rotate-45 transition-transform duration-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>

          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5">
              CONTRIB <span className="text-compass-400">COMPASS</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400/80 tracking-widest uppercase">
              AI OSS MATCHING
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-compass-500/20 text-compass-300 border border-compass-500/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-compass-400" : "text-slate-500"}`} />
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
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
              mockActive
                ? "bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50"
                : "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${mockActive ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
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

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-compass-500 to-emerald-500 hover:from-compass-400 hover:to-emerald-400 text-slate-950 font-semibold text-xs shadow-glow-teal transition-all active:scale-95"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
