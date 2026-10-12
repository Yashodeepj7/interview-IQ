"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Bot,
  User,
  LogOut,
  LayoutDashboard,
  History,
} from "lucide-react";

export default function Navbar({ onOpenMockModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated" && Boolean(session?.user);

  const baseNavLinks = [
    { label: "Features", href: "#features" },
    { label: "Mock Interview", href: "/mock-interview" },
    { label: "Resume Analyzer", href: "/features/resume-analyzer" },
    { label: "Performance", href: "/features/performance-dashboard" },
    { label: "Career Roadmap", href: "/features/career-roadmap" },
  ];

  const authNavLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Interviews", href: "/dashboard/interviews" },
    ...baseNavLinks,
  ];

  const linksToRender = isAuthenticated ? authNavLinks : baseNavLinks;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          id="nav-brand-logo"
          className="flex items-center gap-3 transition-opacity hover:opacity-90 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-md shadow-indigo-500/25 ring-1 ring-white/20 transition-transform group-hover:scale-105">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white">
                Interview<span className="text-indigo-400">IQ</span>
              </span>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 ring-1 ring-indigo-500/30">
                AI Platform
              </span>
            </div>
            <span className="text-[11px] text-slate-400 -mt-0.5 hidden sm:inline">
              Career & Mock Interview Suite
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {linksToRender.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/ai-test"
            id="nav-ai-test-link"
            className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white px-3 py-1.5 rounded-xl bg-indigo-950/70 border border-indigo-500/30 hover:border-indigo-500/60 transition-all hover:bg-indigo-900/40"
            title="Verify real Gemini AI Integration"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI Test Console</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                id="nav-user-profile-btn"
                className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-indigo-500/60 transition-colors"
                title="View your Dashboard"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-[10px]">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="max-w-[120px] truncate text-slate-200">
                  {session?.user?.name || "Candidate"}
                </span>
              </Link>
              <button
                type="button"
                id="nav-signout-btn"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                title="Sign out of account"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                id="nav-signin-link"
                className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                id="nav-register-link"
                className="rounded-xl border border-indigo-500/40 bg-indigo-950/40 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          {onOpenMockModal ? (
            <button
              type="button"
              id="nav-cta-btn"
              onClick={onOpenMockModal}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 active:scale-95"
            >
              <span>Start Mock Interview</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : (
            <Link
              href="/mock-interview"
              id="nav-cta-link"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 active:scale-95"
            >
              <span>Start Mock Interview</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            id="mobile-menu-toggle"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-[#090d16]/95 px-4 pt-3 pb-5 backdrop-blur-xl md:hidden">
          <div className="flex flex-col space-y-2">
            {isAuthenticated && (
              <div className="mb-2 pb-2 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">
                    {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {session?.user?.name || "Candidate"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            {linksToRender.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-800/70 hover:text-indigo-300"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/ai-test"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-indigo-300 hover:bg-slate-800/70 hover:text-white flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>AI Test Console (Gemini)</span>
            </Link>

            {!isAuthenticated && (
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center rounded-xl border border-slate-800 bg-slate-900 py-2 text-xs font-semibold text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center rounded-xl border border-indigo-500/40 bg-indigo-950/60 py-2 text-xs font-semibold text-indigo-300"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <div className="pt-3">
              {onOpenMockModal ? (
                <button
                  type="button"
                  id="mobile-nav-cta-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenMockModal();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-indigo-500/25"
                >
                  <span>Start Mock Interview</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  href="/mock-interview"
                  id="mobile-nav-cta-link"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-indigo-500/25"
                >
                  <span>Start Mock Interview</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
