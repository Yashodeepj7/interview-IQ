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
} from "lucide-react";
import InterviewPreview from "./InterviewPreview";

const stats = [
  { label: "Mock Interviews", value: "50K+", icon: Mic },
  { label: "Success Rate", value: "94%", icon: TrendingUp },
  { label: "AI Insights/Session", value: "120+", icon: Brain },
];

const trustPoints = [
  "Zero setup required",
  "Technical, Behavioral & System Design",
  "Real-time AI feedback",
];

export default function Hero({ onOpenMockModal }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-24 sm:pb-32">
      {/* Layered background lighting */}
      <div className="hero-glow absolute inset-0 -z-10" />
      <div className="animated-grid absolute inset-0 -z-10 opacity-70 dark:opacity-40" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-indigo-500/10 dark:bg-indigo-600/8 blur-3xl -z-10 float-animation" style={{ animationDelay: "0s" }} />
      <div className="absolute top-40 right-[8%] w-56 h-56 rounded-full bg-violet-500/10 dark:bg-violet-500/10 blur-3xl -z-10 float-animation" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-10 left-[30%] w-80 h-40 rounded-full bg-cyan-500/10 dark:bg-cyan-500/6 blur-3xl -z-10 float-animation" style={{ animationDelay: "1s" }} />

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

          {/* Heading */}
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl sm:leading-[1.08] leading-tight">
            <span className="text-gradient">Ace Every</span>{" "}
            <br className="hidden sm:block" />
            <span className="text-gradient-accent">Interview</span>
            <span className="text-gradient"> with AI</span>
          </h1>

          {/* Subheading */}
          <p className="mt-7 mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            InterviewIQ delivers ultra-realistic voice AI mock interviews with instant{" "}
            <span className="text-slate-900 dark:text-slate-200 font-semibold">STAR-method analysis</span>,{" "}
            <span className="text-slate-900 dark:text-slate-200 font-semibold">ATS resume audits</span>, and{" "}
            <span className="text-slate-900 dark:text-slate-200 font-semibold">personalized coaching</span> — all in real time.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              id="hero-start-mock-btn"
              onClick={onOpenMockModal}
              className="group relative flex w-full sm:w-auto items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-8 py-4 text-base font-semibold text-white active:scale-[0.98] transition-all duration-200 shadow-lg shadow-indigo-600/30"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #9333ea 100%)",
                boxShadow: "0 6px 28px rgba(79,70,229,0.35), 0 1px 0 rgba(255,255,255,0.18) inset",
              }}
            >
              <Mic className="h-4.5 w-4.5 relative z-10" />
              <span className="relative z-10">Start Mock Interview</span>
              <ArrowRight className="h-4 w-4 relative z-10 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-violet-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <Link
              href="#features"
              id="hero-explore-features-btn"
              className="group flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-7 py-4 text-base font-semibold text-slate-800 shadow-xs transition-all dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/8 dark:text-slate-200"
            >
              <PlayCircle className="h-4 w-4 text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors" />
              <span>Explore Features</span>
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-600 dark:text-slate-400 font-medium">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* Stats Row */}
          <div className="mt-12 grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {stats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="stat-card rounded-2xl p-4 text-center border border-slate-200 bg-white shadow-xs dark:border-white/8 dark:bg-[var(--bg-card)]"
              >
                <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mx-auto mb-1.5" />
                <div className="text-xl font-bold text-slate-900 dark:text-white leading-none">{value}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{label}</div>
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
