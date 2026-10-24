"use client";

import { useState } from "react";
import {
  Mic,
  Volume2,
  Sparkles,
  Zap,
  Brain,
  TrendingUp,
  Play,
  Pause,
} from "lucide-react";

export default function InterviewPreview({ onOpenModal }) {
  const [activeTab, setActiveTab] = useState("technical");
  const [isSimulatingAudio, setIsSimulatingAudio] = useState(true);

  const scenarios = {
    technical: {
      role: "Senior Full-Stack Engineer",
      company: "FAANG Company",
      topic: "System Architecture & Database Optimization",
      question:
        '"Could you walk me through an experience where you resolved a database query bottleneck under high production load? What observability metrics guided your decision?"',
      metrics: { star: 94, clarity: 91 },
      pacing: "138 WPM",
      pacingLabel: "Optimal",
      depth: "High",
      aiInsight:
        "Strong breakdown of indexing strategy and replica failover. Recommended: Explain trade-offs between eventual consistency and latency.",
      tagColor: "text-blue-700 dark:text-blue-400",
      tagBg: "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20",
    },
    behavioral: {
      role: "Engineering Lead / Manager",
      company: "Series B Startup",
      topic: "Conflict Resolution & Stakeholder Alignment",
      question:
        '"Describe a situation where product priorities conflicted sharply with technical debt reduction. How did you negotiate alignment with executive leadership?"',
      metrics: { star: 89, clarity: 95 },
      pacing: "142 WPM",
      pacingLabel: "Optimal",
      depth: "Very High",
      aiInsight:
        "Excellent framing of business ROI versus system reliability. Emphasized quantifiable risk factors clearly.",
      tagColor: "text-violet-700 dark:text-violet-400",
      tagBg: "bg-violet-50 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/20",
    },
    system: {
      role: "Distributed Systems Specialist",
      company: "Big Tech",
      topic: "Global Real-Time Messaging Architecture",
      question:
        '"How would you design a distributed, fault-tolerant presence and notification service supporting 50 million concurrent active WebSocket connections?"',
      metrics: { star: 92, clarity: 88 },
      pacing: "135 WPM",
      pacingLabel: "Optimal",
      depth: "Exceptional",
      aiInsight:
        "Highlighted horizontal scaling with Redis Pub/Sub clusters and efficient heartbeat connection pruning effectively.",
      tagColor: "text-cyan-700 dark:text-cyan-400",
      tagBg: "bg-cyan-50 border-cyan-200 dark:bg-cyan-500/10 dark:border-cyan-500/20",
    },
  };

  const current = scenarios[activeTab];

  const tabs = [
    { id: "technical", label: "Technical", short: "Tech" },
    { id: "behavioral", label: "Behavioral", short: "Behav" },
    { id: "system", label: "System Design", short: "SD" },
  ];

  return (
    <div className="preview-card relative mx-auto w-full max-w-5xl rounded-3xl p-4 sm:p-6 backdrop-blur-2xl border border-slate-200 bg-white/95 shadow-xl shadow-indigo-100/40 dark:border-white/10 dark:bg-slate-900/90 dark:shadow-2xl">
      {/* Top glow highlight */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-36 w-3/4 rounded-full bg-gradient-to-r from-indigo-500/18 via-violet-500/15 to-cyan-500/10 blur-3xl -z-10" />

      {/* Top Console Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500 shadow-xs" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
              Interactive Preview
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Voice AI Active</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 p-1 border border-slate-200 dark:border-white/10 text-xs">
          {tabs.map(({ id, label, short }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all duration-200 ${
                activeTab === id
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5"
              }`}
            >
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{short}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column: Interview Session */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Interviewer header */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/50 dark:border-white/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/25">
                <Volume2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{current.role}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{current.topic}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${current.tagBg} ${current.tagColor}`}>
                {activeTab === "technical" ? "Technical" : activeTab === "behavioral" ? "Behavioral" : "System Design"}
              </span>
              <span className="rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/6 px-2.5 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                04:18 / 30:00
              </span>
            </div>
          </div>

          {/* Question Box */}
          <div className="relative rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-950/60 dark:border-white/6 p-5 flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">AI Interviewer Prompt</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-500/30 dark:text-indigo-300 font-semibold">
                Voice & Text
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-100 font-medium">
              {current.question}
            </p>

            {/* Candidate Sample Response Stream Preview */}
            <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Live Transcribed Candidate Answer:</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200/60 dark:border-white/5 leading-relaxed">
                &ldquo;Under 40k QPS peak, our read replicas hit 98% CPU saturation. We isolated query patterns with p99 latency logging, identified missing composite indexes on tenant timestamps, and implemented Redis caching for read-heavy user preferences, dropping p99 from 820ms to 42ms.&rdquo;
              </p>
            </div>
          </div>

          {/* Voice Waveform Visualizer */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/40 dark:border-white/5 p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 border border-indigo-200 dark:bg-indigo-600/20 dark:border-indigo-500/20">
                  <Mic className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Conversational Voice Spectrum (16kHz Stream)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulatingAudio(!isSimulatingAudio)}
                className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-bold transition-colors cursor-pointer"
              >
                {isSimulatingAudio ? (
                  <><Pause className="h-3 w-3" /> Live Audio</>
                ) : (
                  <><Play className="h-3 w-3" /> Resume Wave</>
                )}
              </button>
            </div>

            <div className="flex h-12 items-center justify-center gap-1 px-2">
              {[
                { wave: "voice-wave-1", color: "#06b6d4" },
                { wave: "voice-wave-2", color: "#0ea5e9" },
                { wave: "voice-wave-3", color: "#3b82f6" },
                { wave: "voice-wave-4", color: "#6366f1" },
                { wave: "voice-wave-5", color: "#8b5cf6" },
                { wave: "voice-wave-6", color: "#a855f7" },
                { wave: "voice-wave-7", color: "#d946ef" },
                { wave: "voice-wave-8", color: "#8b5cf6" },
                { wave: "voice-wave-9", color: "#6366f1" },
                { wave: "voice-wave-4", color: "#3b82f6" },
                { wave: "voice-wave-2", color: "#0ea5e9" },
                { wave: "voice-wave-1", color: "#06b6d4" },
                { wave: "voice-wave-3", color: "#6366f1" },
                { wave: "voice-wave-5", color: "#8b5cf6" },
                { wave: "voice-wave-7", color: "#a855f7" },
                { wave: "voice-wave-8", color: "#6366f1" },
              ].map(({ wave, color }, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full ${isSimulatingAudio ? wave : "h-2"}`}
                  style={{ backgroundColor: color, minHeight: "6px" }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Metrics HUD */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live AI Response Telemetry</h4>
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "STAR Score", value: current.metrics.star, color: "#10b981", gradient: "from-emerald-500 to-cyan-500" },
              { label: "Clarity", value: current.metrics.clarity, color: "#6366f1", gradient: "from-indigo-500 to-violet-500" },
            ].map(({ label, value, color, gradient }) => (
              <div key={label} className="metric-pill rounded-2xl p-4 text-center border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-[var(--bg-surface)]">
                <div className="text-2xl font-bold" style={{ color }}>{value}%</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">{label}</div>
                <div className="progress-track mt-2">
                  <div
                    className={`progress-fill bg-gradient-to-r ${gradient}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pacing & Depth pills */}
          <div className="grid grid-cols-2 gap-3">
            <div className="metric-pill rounded-xl px-3 py-3 flex flex-col gap-0.5 border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-[var(--bg-surface)]">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">Pacing</span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{current.pacing}</span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{current.pacingLabel}</span>
            </div>
            <div className="metric-pill rounded-xl px-3 py-3 flex flex-col gap-0.5 border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-[var(--bg-surface)]">
              <div className="flex items-center gap-1 mb-1">
                <Brain className="h-3 w-3 text-violet-500 dark:text-violet-400" />
                <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">Depth</span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{current.depth}</span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Technical</span>
            </div>
          </div>

          {/* AI Insight */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 flex-1 dark:border-indigo-500/20 dark:bg-gradient-to-br dark:from-indigo-950/50 dark:to-violet-950/30">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-500/20">
                <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-700 dark:text-indigo-300">AI Coach Insight</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-indigo-200/90 font-medium">
              {current.aiInsight}
            </p>
          </div>

          {/* Launch CTA */}
          <button
            type="button"
            onClick={onOpenModal}
            className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 py-3 text-sm font-semibold text-indigo-700 dark:border-indigo-500/35 dark:bg-gradient-to-r dark:from-indigo-600/20 dark:to-violet-600/15 dark:text-indigo-300 dark:hover:border-indigo-400/50 dark:hover:from-indigo-600/30 dark:hover:to-violet-600/25 dark:hover:text-white transition-all duration-200"
          >
            <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-300 transition-colors" />
            <span>Launch Your Interview Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
