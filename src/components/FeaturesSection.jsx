"use client";

import { useState } from "react";
import {
  FileText,
  Mic,
  Sparkles,
  BarChart3,
  Compass,
  ArrowUpRight,
  CheckCircle2,
  Brain,
} from "lucide-react";
import Link from "next/link";

const featuresData = [
  {
    id: "feature-voice-interviewer",
    title: "Conversational Voice AI Mock Interviewer",
    description:
      "Practice speaking with an ultra-responsive conversational voice AI that adapts dynamically, probes specifics, and asks realistic follow-ups in real time.",
    icon: Mic,
    category: "Voice Simulation",
    group: "interviews",
    actionHref: "/mock-interview",
    highlights: [
      "Low-latency speech recognition & natural conversational flow",
      "Dynamic follow-up questions tailored to your spoken answers",
      "Technical, Behavioral & Engineering Manager personas",
    ],
    gradient: "from-indigo-500/20 to-violet-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBorder: "border-indigo-200 dark:border-indigo-500/25",
    iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
    glowColor: "rgba(99, 102, 241, 0.16)",
    accentColor: "#6366f1",
    featured: true,
    tag: "Core Capability",
  },
  {
    id: "feature-resume-analyzer",
    title: "AI Resume & ATS Score Analyzer",
    description:
      "Upload your PDF resume to get in-memory ATS scoring, bullet-point impact rewrites, and categorized competency verification against top candidate standards.",
    icon: FileText,
    category: "Resume Intelligence",
    group: "resumes",
    actionHref: "/resume-analyzer",
    highlights: [
      "In-memory PDF text extraction with signature verification",
      "Action-verb & quantifiable impact metric audit",
      "Instant bullet rewrites with one-click clipboard copying",
    ],
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBorder: "border-blue-200 dark:border-blue-500/25",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    glowColor: "rgba(59, 130, 246, 0.12)",
    accentColor: "#3b82f6",
    tag: "Interactive Tool",
  },
  {
    id: "feature-answer-evaluation",
    title: "STAR Framework Evaluation Engine",
    description:
      "Receive objective multi-dimensional feedback breaking down your answers by STAR methodology, technical depth, delivery pacing, and model answer comparison.",
    icon: Sparkles,
    category: "Critique Engine",
    group: "interviews",
    actionHref: "/mock-interview",
    highlights: [
      "STAR framework compliance scoring (Situation, Task, Action, Result)",
      "Technical rubric breakdown with strength & growth area audits",
      "Exemplary illustrative model answers for self-review",
    ],
    gradient: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBorder: "border-violet-200 dark:border-violet-500/25",
    iconBg: "bg-violet-50 dark:bg-violet-500/10",
    glowColor: "rgba(139, 92, 246, 0.12)",
    accentColor: "#8b5cf6",
    tag: "Instant Feedback",
  },
  {
    id: "feature-performance-dashboard",
    title: "Candidate Performance Hub",
    description:
      "Monitor your interview journey with longitudinal score tracking, question histories, archived session transcripts, and readiness ratings.",
    icon: BarChart3,
    category: "Analytics & History",
    group: "analytics",
    actionHref: "/dashboard",
    highlights: [
      "Longitudinal score history persisted to personal dashboard",
      "Individual question transcripts and feedback reviews",
      "One-click PDF reports & self-review archives",
    ],
    gradient: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBorder: "border-amber-200 dark:border-amber-500/25",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    glowColor: "rgba(245, 158, 11, 0.10)",
    accentColor: "#f59e0b",
    tag: "Dashboard",
  },
  {
    id: "feature-career-roadmap",
    title: "Continuous Feedback & Readiness",
    description:
      "Target specific roles and seniority tiers, tracking which areas need reinforcement and practicing repeatedly with zero session limits.",
    icon: Compass,
    category: "Growth & Readiness",
    group: "analytics",
    actionHref: "/features/career-roadmap",
    highlights: [
      "Tailored interview difficulty options (Easy, Medium, Hard)",
      "Mixed formats: Technical depth, Behavioral STAR, and HR fit",
      "Immediate re-attempts to build muscle memory",
    ],
    gradient: "from-cyan-500/20 to-blue-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    iconBorder: "border-cyan-200 dark:border-cyan-500/25",
    iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
    glowColor: "rgba(6, 182, 212, 0.12)",
    accentColor: "#06b6d4",
    tag: "Career Track",
  },
];

const categoryTabs = [
  { id: "all", label: "All Capabilities" },
  { id: "interviews", label: "Voice & Interviews" },
  { id: "resumes", label: "Resume Intelligence" },
  { id: "analytics", label: "Analytics & History" },
];

function FeatureCard({
  id,
  title,
  description,
  icon: Icon,
  category,
  highlights,
  actionHref,
  gradient,
  iconColor,
  iconBorder,
  iconBg,
  glowColor,
  accentColor,
  featured,
  tag,
}) {
  return (
    <div
      id={id}
      className={`feature-card glow-card group relative flex flex-col rounded-3xl p-6 sm:p-7 border border-slate-200/90 bg-white shadow-xs hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-white/10 dark:bg-[#131b2e] dark:hover:border-indigo-500/30 transition-all duration-300 ${
        featured ? "ring-2 ring-indigo-500/40" : ""
      }`}
      style={featured ? { boxShadow: `0 0 0 1px rgba(99,102,241,0.25), 0 12px 36px ${glowColor}` } : {}}
    >
      {/* Featured badge with proper headroom */}
      {featured && (
        <div className="absolute -top-3.5 left-6 z-20">
          <span className="badge-ai shadow-sm font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
            <span>Most Popular</span>
          </span>
        </div>
      )}

      {/* Background gradient accent */}
      <div
        className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl -z-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${iconBg} ${iconColor} ${iconBorder} shadow-xs group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 border border-slate-200/60 dark:border-white/5">
            {tag || category}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
          {description}
        </p>

        {/* Highlights */}
        {highlights.length > 0 && (
          <ul className="mt-5 space-y-2.5 border-t border-slate-100 dark:border-white/5 pt-4 flex-1">
            {highlights.map((item, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <CheckCircle2
                  className="h-4 w-4 shrink-0 mt-0.5 transition-colors"
                  style={{ color: accentColor }}
                />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <Link
            href={actionHref}
            className="text-xs font-bold transition-all hover:translate-x-0.5 inline-flex items-center gap-1"
            style={{ color: accentColor }}
          >
            <span>Launch Feature</span>
          </Link>
          <Link
            href={actionHref}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white dark:bg-white/5 dark:text-slate-400 dark:hover:bg-indigo-600 dark:hover:text-white transition-all group-hover:scale-110 shadow-2xs"
            aria-label={`Open ${title}`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredFeatures =
    activeTab === "all"
      ? featuresData
      : featuresData.filter((item) => item.group === activeTab);

  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Section background glow */}
      <div className="absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 justify-center overflow-hidden pointer-events-none">
        <div className="h-[45rem] w-[75rem] rounded-full bg-gradient-to-tr from-indigo-500/10 via-violet-500/8 to-cyan-500/5 blur-3xl dark:from-indigo-900/12 dark:via-violet-900/8 dark:to-cyan-900/5" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs mb-5 dark:border-indigo-500/30 dark:bg-gradient-to-r dark:from-indigo-500/10 dark:to-violet-500/8 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>End-to-End Interview Mastery</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl sm:leading-tight">
            Five Pillars to{" "}
            <span className="text-gradient-accent">Interview Excellence</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal">
            InterviewIQ combines real-time conversational voice AI, STAR methodology scoring, and resume ATS auditing to give you an unfair hiring advantage.
          </p>

          {/* Interactive Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                    : "bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-indigo-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="section-divider mt-12" />
        </div>

        {/* Feature Cards Grid with top padding for badges */}
        <div className="pt-2 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFeatures.map((feature) => (
            <FeatureCard key={feature.id} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
