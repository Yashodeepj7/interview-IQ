"use client";

import { ArrowRight, Sparkles, Mic, CheckCircle, Zap, Star } from "lucide-react";

const proofPoints = [
  { icon: CheckCircle, text: "No credit card required" },
  { icon: Zap, text: "Instant AI feedback" },
  { icon: Star, text: "STAR-method graded" },
];

export default function CTASection({ onOpenMockModal }) {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 dark:border-indigo-500/25 backdrop-blur-2xl text-center shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-950/40">
          {/* Card background */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: `
                radial-gradient(ellipse 80% 70% at 50% -15%, rgba(99, 102, 241, 0.35), transparent 65%),
                linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)
              `,
            }}
          />

          {/* Animated grid inside card */}
          <div className="absolute inset-0 -z-10 animated-grid opacity-35" />

          {/* Top glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-indigo-500/25 blur-3xl -z-10" />

          {/* Floating orb decorations */}
          <div className="absolute top-8 left-8 h-24 w-24 rounded-full bg-violet-500/15 blur-2xl" />
          <div className="absolute bottom-8 right-8 h-24 w-24 rounded-full bg-cyan-500/15 blur-2xl" />

          {/* Content */}
          <div className="relative z-10 px-8 py-16 sm:py-20 sm:px-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-indigo-200 mb-6 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              <span>Step Into Your Next Interview with Unshakable Confidence</span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
              Ready to{" "}
              <span className="bg-gradient-to-r from-indigo-200 via-violet-200 to-white bg-clip-text text-transparent">
                Land Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                Dream Role?
              </span>
            </h2>

            {/* Sub text */}
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Practice with our voice AI, receive instant STAR-graded feedback, eliminate filler words, 
              and arrive at real interviews{" "}
              <span className="text-white font-semibold">fully prepared and confident.</span>
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                id="cta-bottom-start-mock-btn"
                onClick={onOpenMockModal}
                className="btn-shimmer group relative flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-2xl px-10 py-4 text-base font-semibold text-white active:scale-[0.98] transition-all duration-200 shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60"
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)",
                  boxShadow: "0 0 0 1px rgba(99,102,241,0.55), 0 8px 36px rgba(79,70,229,0.45), 0 1px 0 rgba(255,255,255,0.22) inset",
                }}
              >
                <Mic className="h-5 w-5 relative z-10" />
                <span className="relative z-10">Start Your Mock Interview Now</span>
                <ArrowRight className="h-4 w-4 relative z-10 transition-transform group-hover:translate-x-1" />
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-violet-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Social Proof Avatar Stack */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 font-bold text-white text-xs ring-2 ring-indigo-950">
                  AK
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 font-bold text-white text-xs ring-2 ring-indigo-950">
                  SR
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 font-bold text-white text-xs ring-2 ring-indigo-950">
                  ML
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 font-bold text-white text-xs ring-2 ring-indigo-950">
                  JD
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-bold text-white text-xs ring-2 ring-indigo-950">
                  +5k
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-medium">
                Joined by over <span className="font-bold text-white">50,000+ candidates</span> preparing for top engineering roles.
              </p>
            </div>

            {/* Proof points */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium border-t border-indigo-500/20 pt-6">
              {proofPoints.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
