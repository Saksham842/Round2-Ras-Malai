"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Compass, GitPullRequest, GitFork, Sparkles, Shield, Github, LogOut, CheckCircle2, Settings, ArrowRight, ChevronRight } from "lucide-react";
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
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#070913]/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Stripe-style Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#635bff] to-[#ff5b79] p-0.5 flex items-center justify-center shadow-[0_2px_12px_rgba(99,91,255,0.4)]">
              <div className="w-full h-full bg-[#080913] rounded-[6px] flex items-center justify-center">
                <Compass className="w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-500" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-base">
              <span>Contrib</span>
              <span className="stripe-gradient-text font-black">Compass</span>
            </div>
          </Link>

          {/* Stripe-style Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white/10 text-white font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls & User Profile */}
          <div className="flex items-center gap-3">
            {/* Demo / Live Toggle Chip */}
            <button
              onClick={toggleMock}
              title="Click to toggle between Demo Fixtures and Live Backend"
              className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono border transition-all ${
                mockActive
                  ? "bg-amber-950/30 border-amber-500/40 text-amber-300"
                  : "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${mockActive ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
              <span>{mockActive ? "FIXTURES" : "LIVE API"}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all text-xs text-white"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.login || "User"}
                      className="w-5 h-5 rounded-full border border-white/20"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#635bff] text-white flex items-center justify-center text-[10px] font-bold">
                      {(user.login || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium hidden sm:inline">@{user.login}</span>
                </Link>

                <button
                  onClick={() => setShowSettings(true)}
                  title="Configure API Keys"
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all relative"
                >
                  <Settings className="w-4 h-4" />
                  {hasKeys && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00d4b6] rounded-full" />
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowSettings(true)}
                  title="Configure API Keys"
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all relative"
                >
                  <Settings className="w-4 h-4" />
                  {hasKeys && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00d4b6] rounded-full" />
                  )}
                </button>

                <Link
                  href="/login"
                  className="text-xs font-medium text-slate-300 hover:text-white px-2 py-1 transition-colors"
                >
                  Sign in
                </Link>

                <Link
                  href="/match"
                  className="stripe-btn-primary px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Start matching</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => {
            setShowSettings(false);
            setHasKeys(!!(getStoredGithubPat() || getStoredGroqKey()));
          }}
        />
      )}
    </>
  );
}
