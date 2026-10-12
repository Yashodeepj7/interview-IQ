import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  PlayCircle,
  Bot,
  Zap,
} from "lucide-react";
import InterviewPreview from "./InterviewPreview";

export default function Hero({ onOpenMockModal }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Background ambient lighting */}
      <div className="hero-glow absolute inset-0 -z-10" />
      <div className="subtle-grid absolute inset-0 -z-10 opacity-40" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Centered Hero Copy */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Next-Generation Career Intelligence</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Phase 1 Foundation</span>
          </div>

          {/* Heading - EXACTLY “Your AI-Powered Career Coach” */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
            Your AI-Powered <br className="hidden sm:inline" />
            <span className="text-gradient-accent">Career Coach</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-300">
            InterviewIQ empowers you to conquer high-stakes interviews with realistic voice-driven AI simulations, instant STAR method analysis, ATS resume audits, and tailored career roadmaps.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <button
              type="button"
              id="hero-start-mock-btn"
              onClick={onOpenMockModal}
              className="group flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-600/30 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 active:scale-95"
            >
              <span>Start a Mock Interview</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <Link
              href="#features"
              id="hero-explore-features-btn"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-base font-semibold text-slate-200 backdrop-blur-md transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              <PlayCircle className="h-4 w-4 text-slate-400" />
              <span>Explore Features</span>
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Zero setup required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Tailored for tech, product & data</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Sub-2 second AI feedback</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Preview Shell */}
        <div className="mt-14 sm:mt-20">
          <InterviewPreview onOpenModal={onOpenMockModal} />
        </div>
      </div>
    </section>
  );
}
