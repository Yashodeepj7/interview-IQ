"use client";

import { useState } from "react";
import {
  Mic,
  Volume2,
  Sparkles,
  BarChart2,
  CheckCircle,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";

export default function InterviewPreview({ onOpenModal }) {
  const [activeTab, setActiveTab] = useState("technical");
  const [isSimulatingAudio, setIsSimulatingAudio] = useState(true);

  const scenarios = {
    technical: {
      role: "Senior Full-Stack Engineer",
      topic: "System Architecture & Database Optimization",
      question:
        "“Could you walk me through an experience where you resolved a database query bottleneck under high production load? What observability metrics guided your decision?”",
      metrics: {
        star: 94,
        clarity: 91,
        pacing: "138 WPM (Optimal)",
        depth: "High",
      },
      aiInsight:
        "Strong breakdown of indexing strategy and replica failover. Recommended follow-up: Explain trade-offs between eventual consistency and latency.",
    },
    behavioral: {
      role: "Engineering Lead / Manager",
      topic: "Conflict Resolution & Stakeholder Alignment",
      question:
        "“Describe a situation where product priorities conflicted sharply with technical debt reduction. How did you negotiate alignment with executive leadership?”",
      metrics: {
        star: 89,
        clarity: 95,
        pacing: "142 WPM (Optimal)",
        depth: "Very High",
      },
      aiInsight:
        "Excellent framing of business ROI versus system reliability. Emphasized quantifiable risk factors clearly.",
    },
    system: {
      role: "Distributed Systems Specialist",
      topic: "Global Real-Time Messaging Architecture",
      question:
        "“How would you design a distributed, fault-tolerant presence and notification service supporting 50 million concurrent active WebSocket connections?”",
      metrics: {
        star: 92,
        clarity: 88,
        pacing: "135 WPM (Optimal)",
        depth: "Exceptional",
      },
      aiInsight:
        "Highlighted horizontal scaling with Redis Pub/Sub clusters and efficient heartbeat connection pruning effectively.",
    },
  };

  const current = scenarios[activeTab];

  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/80 p-4 sm:p-7 backdrop-blur-xl shadow-2xl shadow-indigo-950/40">
      {/* Glow highlight */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-32 w-3/4 rounded-full bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-cyan-500/10 blur-3xl -z-10" />

      {/* Top Console Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-3 w-3 items-center justify-center">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Interactive Preview Shell
            </span>
            <span className="mx-2 text-slate-600">•</span>
            <span className="text-xs font-medium text-emerald-400">
              Voice AI Simulation Active
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-950/70 p-1 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("technical")}
            className={`rounded-lg px-3 py-1 font-medium transition-all ${
              activeTab === "technical"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Technical
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("behavioral")}
            className={`rounded-lg px-3 py-1 font-medium transition-all ${
              activeTab === "behavioral"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Behavioral
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("system")}
            className={`rounded-lg px-3 py-1 font-medium transition-all ${
              activeTab === "system"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            System Design
          </button>
        </div>
      </div>

      {/* Interview Question Box */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Interlocutor & Voice State */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl bg-slate-950/60 p-5 border border-slate-800/80">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Volume2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {current.role}
                  </h4>
                  <p className="text-xs text-slate-400">{current.topic}</p>
                </div>
              </div>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-mono text-slate-300">
                04:18 / 30:00
              </span>
            </div>

            {/* Prompt */}
            <div className="mt-4 rounded-xl bg-slate-900/90 p-4 border border-slate-800 text-slate-200 text-sm leading-relaxed italic">
              {current.question}
            </div>
          </div>

          {/* Voice Waveform Mock Indicator */}
          <div className="mt-6 flex flex-col gap-3 rounded-xl bg-slate-900/60 p-3.5 border border-slate-800/60">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <Mic className="h-3.5 w-3.5 text-indigo-400" />
                Candidate Microphone Input
              </span>
              <button
                type="button"
                onClick={() => setIsSimulatingAudio(!isSimulatingAudio)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                {isSimulatingAudio ? "Pause Waveform" : "Resume Waveform"}
              </button>
            </div>

            <div className="flex h-10 items-center justify-center gap-1.5 px-4">
              <span
                className={`w-1 rounded-full bg-indigo-500 ${
                  isSimulatingAudio ? "voice-wave-1" : "h-3"
                }`}
              />
              <span
                className={`w-1 rounded-full bg-indigo-400 ${
                  isSimulatingAudio ? "voice-wave-2" : "h-4"
                }`}
              />
              <span
                className={`w-1 rounded-full bg-violet-400 ${
                  isSimulatingAudio ? "voice-wave-3" : "h-6"
                }`}
              />
              <span
                className={`w-1 rounded-full bg-indigo-300 ${
                  isSimulatingAudio ? "voice-wave-4" : "h-2"
                }`}
              />
              <span
                className={`w-1 rounded-full bg-purple-400 ${
                  isSimulatingAudio ? "voice-wave-5" : "h-5"
                }`}
              />
              <span
                className={`w-1 rounded-full bg-indigo-500 ${
                  isSimulatingAudio ? "voice-wave-2" : "h-3"
                }`}
              />
              <span
                className={`w-1 rounded-full bg-violet-400 ${
                  isSimulatingAudio ? "voice-wave-3" : "h-7"
                }`}
              />
              <span
                className={`w-1 rounded-full bg-indigo-400 ${
                  isSimulatingAudio ? "voice-wave-1" : "h-4"
                }`}
              />
              <span
                className={`w-1 rounded-full bg-purple-400 ${
                  isSimulatingAudio ? "voice-wave-4" : "h-2"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time AI Metrics HUD */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-slate-950/60 p-5 border border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h4 className="text-sm font-semibold text-white">
                Live AI Response Telemetry
              </h4>
            </div>

            <div className="space-y-3.5">
              {/* Metric 1 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">
                    STAR Framework Alignment
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {current.metrics.star}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${current.metrics.star}%` }}
                  />
                </div>
              </div>

              {/* Metric 2 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">
                    Clarity & Articulation
                  </span>
                  <span className="text-indigo-300 font-semibold">
                    {current.metrics.clarity}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-500"
                    style={{ width: `${current.metrics.clarity}%` }}
                  />
                </div>
              </div>

              {/* Metric 3: Pacing */}
              <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
                <span className="text-xs text-slate-400">Pacing Cadence</span>
                <span className="text-xs font-medium text-slate-200">
                  {current.metrics.pacing}
                </span>
              </div>

              {/* Metric 4: Depth */}
              <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
                <span className="text-xs text-slate-400">Technical Depth</span>
                <span className="text-xs font-semibold text-indigo-400">
                  {current.metrics.depth}
                </span>
              </div>
            </div>

            {/* AI Insight Snippet */}
            <div className="mt-4 rounded-xl bg-indigo-950/30 p-3 border border-indigo-900/50">
              <p className="text-[11px] leading-relaxed text-indigo-200">
                <span className="font-semibold text-indigo-300">
                  AI Coach Insight:{" "}
                </span>
                {current.aiInsight}
              </p>
            </div>
          </div>

          {/* Action trigger */}
          <div className="mt-5 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onOpenModal}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 py-2.5 text-xs font-semibold text-indigo-300 hover:text-white transition-all"
            >
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              <span>Launch Mock Interview Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
