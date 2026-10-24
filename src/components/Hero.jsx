"use client";

import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  CheckCircle,
  PlayCircle,
  Mic,
  Brain,
  TrendingUp,
  Zap,
  Target,
  Layers,
} from "lucide-react";
import InterviewPreview from "./InterviewPreview";

const stats = [
  { label: "Mock Interviews Completed", value: "50K+", icon: Mic, change: "+18% this month" },
  { label: "Hiring Success Rate", value: "94%", icon: TrendingUp, change: "FAANG & Tier-1" },
  { label: "AI Insights Generated", value: "120+", icon: Brain, change: "Per session" },
];

const trustPoints = [
  "Zero setup required",
  "Technical, Behavioral & System Design",
  "Real-time AI feedback & scoring",
];

const targetRoles = [
  "Full-Stack Engineer",
  "System Design",
  "Frontend Lead",
  "Backend / DevOps",
  "Engineering Manager",
];

export default function Hero({ onOpenMockModal }) {
  return (
    <section className="relative overflow-hidden pt-8 pb-20 sm:pt-20 sm:pb-32">
      {/* Layered background lighting */}
      <div className="hero-glow absolute inset-0 -z-10" />
      <div className="animated-grid absolute inset-0 -z-10 opacity-70 dark:opacity-40" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-indigo-500/10 dark:bg-indigo-600/8 blur-3xl -z-10 float-animation" style={{ animationDelay: "0s" }} />
      <div className="absolute top-40 right-[8%] w-56 h-56 rounded-full bg-violet-500/10 dark:bg-violet-500/10 blur-3xl -z-10 float-animation" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-10 left-[30%] w-80 h-40 rounded-full bg-cyan-500/10 dark:bg-cyan-500/6 blur-3xl -z-10 float-animation" style={{ animationDelay: "1s" }} />

      {/* Floating Badge Left */}
      <div className="hidden lg:flex items-center gap-3 absolute top-36 left-4 xl:left-12 float-badge-1 z-20 rounded-2xl p-3.5 bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl shadow-indigo-950/5 dark:shadow-indigo-950/30 backdrop-blur-xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <span>STAR Rubric Graded</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold">96/100</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Objective situational breakdown</p>
        </div>
      </div>

      {/* Floating Badge Right */}
      <div className="hidden lg:flex items-center gap-3 absolute top-48 right-4 xl:right-12 float-badge-2 z-20 rounded-2xl p-3.5 bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl shadow-indigo-950/5 dark:shadow-indigo-950/30 backdrop-blur-xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400">
          <Zap className="h-5 w-5" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <span>Voice Speech AI</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">&lt; 1s conversational latency</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Centered Hero Copy */}
        <div className="mx-auto max-w-4xl text-center">
          {/* Pill Badge */}
          <div className="badge-hero mb-8">
            <span className="relative flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
            </span>
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-800 dark:text-indigo-100">
              Next-Generation AI Interview Platform
            </span>
            <span className="text-slate-400 dark:text-indigo-300/60">•</span>
            <span className="text-indigo-700 dark:text-violet-300 font-bold">Real-Time AI Feedback</span>
          </div>

          {/* Heading with Ambient Glow behind */}
          <div className="relative">
            <div className="absolute inset-0 -top-12 mx-auto h-40 max-w-md bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-cyan-500/15 blur-3xl -z-10 rounded-full" />
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl sm:leading-[1.08] leading-tight">
              <span className="text-gradient">Ace Every</span>{" "}
              <br className="hidden sm:block" />
              <span className="text-gradient-accent">Interview</span>
              <span className="text-gradient"> with AI</span>
            </h1>
          </div>

          {/* Subheading */}
          <p className="mt-7 mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            InterviewIQ delivers ultra-realistic conversational voice AI mock interviews with instant{" "}
            <span className="text-slate-900 dark:text-white font-semibold">STAR-method analysis</span>,{" "}
            <span className="text-slate-900 dark:text-white font-semibold">ATS resume audits</span>, and{" "}
            <span className="text-slate-900 dark:text-white font-semibold">personalized coaching</span> — tailored to modern tech hiring bars.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              id="hero-start-mock-btn"
              onClick={onOpenMockModal}
              className="btn-shimmer group relative flex w-full sm:w-auto items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-8 py-4 text-base font-semibold text-white active:scale-[0.98] transition-all duration-200 shadow-xl shadow-indigo-600/35 hover:shadow-indigo-600/50"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #9333ea 100%)",
                boxShadow: "0 6px 28px rgba(79,70,229,0.35), 0 1px 0 rgba(255,255,255,0.22) inset",
              }}
            >
              <Mic className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Start Mock Interview</span>
              <ArrowRight className="h-4 w-4 relative z-10 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-violet-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <Link
              href="#features"
              id="hero-explore-features-btn"
              className="group flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-7 py-4 text-base font-semibold text-slate-800 shadow-xs transition-all dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/8 dark:text-slate-200"
            >
              <PlayCircle className="h-4.5 w-4.5 text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors" />
              <span>Explore Features</span>
            </Link>
          </div>

          {/* Quick Target Role Chips */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Target className="h-3.5 w-3.5 text-indigo-500" />
              <span>Popular Tracks:</span>
            </span>
            {targetRoles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={onOpenMockModal}
                className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 dark:bg-slate-900/60 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                {role}
              </button>
            ))}
          </div>

          {/* Trust points */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* Stats Row */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto">
            {stats.map(({ label, value, icon: Icon, change }) => (
              <div
                key={label}
                className="stat-card glow-card rounded-2xl p-4 text-center border border-slate-200 bg-white shadow-xs dark:border-white/8 dark:bg-[var(--bg-card)] group hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                    {change}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none text-left">{value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium text-left">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Interactive Preview Shell */}
        <div className="mt-16 sm:mt-24">
          <InterviewPreview onOpenModal={onOpenMockModal} />
        </div>
      </div>
    </section>
  );
}
