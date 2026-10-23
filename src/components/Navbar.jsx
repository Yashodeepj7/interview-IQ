"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Bot,
  LogOut,
  LayoutDashboard,
  Mic,
  FileText,
  BarChart3,
  Compass,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const navLinks = [
  { label: "Resume Analyzer", href: "/resume-analyzer", icon: FileText },
  { label: "Mock Interview", href: "/mock-interview", icon: Mic },
  { label: "Performance", href: "/features/performance-dashboard", icon: BarChart3 },
  { label: "Career Roadmap", href: "/features/career-roadmap", icon: Compass },
];

export default function Navbar({ onOpenMockModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const { theme, toggleTheme, mounted } = useTheme();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "navbar-glass shadow-xs dark:shadow-md" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* ── Brand ── */}
        <Link href="/" id="nav-brand-logo" className="flex items-center gap-3 shrink-0 group">
          <div className="logo-icon flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              Interview<span className="text-indigo-600 dark:text-indigo-400">IQ</span>
            </span>
            <p className="text-[10px] text-slate-500 dark:text-white/40 font-normal mt-0.5 hidden sm:block">AI Interview Platform</p>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-white/65 dark:hover:text-white dark:hover:bg-white/5 transition-all duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop Actions ── */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* AI Console */}
          <Link
            href="/ai-test"
            id="nav-ai-test-link"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 hover:text-indigo-900 border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 dark:border-indigo-500/25 dark:text-indigo-300 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 transition-all"
          >
            <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden lg:inline">AI Console</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            type="button"
            id="nav-theme-toggle-btn"
            aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Toggle theme"}
            title={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Toggle theme"}
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition-all active:scale-95"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                id="nav-user-profile-btn"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 dark:text-white/80 dark:hover:text-white dark:border-white/8 dark:bg-white/5 transition-all shadow-xs"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[9px] shrink-0">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <LayoutDashboard className="h-3.5 w-3.5 text-slate-500 dark:text-white/40" />
                <span className="max-w-[90px] truncate">{session?.user?.name || "Dashboard"}</span>
              </Link>
              <button
                type="button"
                id="nav-signout-btn"
                onClick={handleSignOut}
                aria-label="Sign out"
                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 dark:text-white/40 dark:hover:text-rose-400 dark:hover:bg-rose-950/20 dark:border-white/6 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                id="nav-signin-link"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                id="nav-register-link"
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:text-slate-900 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 dark:text-white/80 dark:hover:text-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition-all shadow-xs"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Primary CTA */}
          {onOpenMockModal ? (
            <button
              type="button"
              id="nav-cta-btn"
              onClick={onOpenMockModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-95 active:scale-95 shadow-md shadow-indigo-600/20"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              }}
            >
              <Mic className="h-3.5 w-3.5" />
              Start Interview
            </button>
          ) : (
            <Link
              href="/mock-interview"
              id="nav-cta-link"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-95 active:scale-95 shadow-md shadow-indigo-600/20"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              }}
            >
              <Mic className="h-3.5 w-3.5" />
              Start Interview
            </Link>
          )}
        </div>

        {/* ── Mobile ── */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            type="button"
            id="mobile-theme-toggle-btn"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 transition-all"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          {onOpenMockModal && (
            <button
              type="button"
              onClick={onOpenMockModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
            >
              <Mic className="h-3.5 w-3.5" />
              Interview
            </button>
          )}

          <button
            type="button"
            id="mobile-menu-toggle"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/6 transition-all"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 dark:border-white/10 dark:bg-[#0b0f19]/98 backdrop-blur-2xl px-5 pt-4 pb-6 shadow-xl transition-all">
          <div className="flex flex-col gap-1">
            {isAuthenticated && (
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">
                    {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{session?.user?.name || "Candidate"}</p>
                    <p className="text-xs text-slate-500 dark:text-white/40">{session?.user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                  className="text-xs text-slate-500 hover:text-rose-600 dark:text-white/40 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            )}

            {isAuthenticated && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5 transition-all"
              >
                <LayoutDashboard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Dashboard
              </Link>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/65 dark:hover:text-white dark:hover:bg-white/5 transition-all"
              >
                <link.icon className="h-4 w-4 text-slate-400 dark:text-white/40" />
                {link.label}
              </Link>
            ))}

            <Link
              href="/ai-test"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-white/5 transition-all"
            >
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              AI Test Console
            </Link>

            {/* Theme Toggle option in mobile drawer */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/5 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                {mounted && theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-600" />
                )}
                <span>Theme: {mounted && theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60">
                Switch
              </span>
            </button>

            {!isAuthenticated && (
              <div className="flex gap-2 mt-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 dark:text-white/70 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-indigo-700 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-300 dark:border-indigo-500/25 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <div className="mt-3">
              {onOpenMockModal ? (
                <button
                  type="button"
                  id="mobile-nav-cta-btn"
                  onClick={() => { setMobileMenuOpen(false); onOpenMockModal(); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white shadow-md shadow-indigo-600/25"
                  style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
                >
                  <Mic className="h-4 w-4" />
                  Start Mock Interview
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <Link
                  href="/mock-interview"
                  id="mobile-nav-cta-link"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white shadow-md shadow-indigo-600/25"
                  style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
                >
                  <Mic className="h-4 w-4" />
                  Start Mock Interview
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
