import { ArrowRight, Sparkles, Bot, ShieldCheck } from "lucide-react";

export default function CTASection({ onOpenMockModal }) {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 via-slate-900/80 to-slate-950 p-8 sm:p-14 text-center backdrop-blur-xl shadow-2xl shadow-indigo-950/30">
          {/* Ambient glow in card */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-indigo-500/20 blur-3xl -z-10" />

          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Step into Your Next Interview with Unshakable Confidence</span>
          </div>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Ready to Ace Your Dream Role?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-300">
            Practice realistic mock interviews, eliminate filler words, refine your STAR stories, and receive instant AI feedback before talking to real interviewers.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              id="cta-bottom-start-mock-btn"
              onClick={onOpenMockModal}
              className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 active:scale-95"
            >
              <span>Start Your Mock Interview Now</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <p className="mt-5 text-xs text-slate-400">
            No credit card required • Instant AI feedback • Interactive practice
          </p>
        </div>
      </div>
    </section>
  );
}
