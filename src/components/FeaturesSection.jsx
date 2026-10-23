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
    id: "feature-resume-analyzer",
    title: "AI Resume Analyzer",
    description:
      "Upload your resume to get rigorous ATS scoring, bullet-point impact audits, and keyword optimization tailored to modern hiring algorithms.",
    icon: FileText,
    category: "Resume Intelligence",
    actionHref: "/resume-analyzer",
    highlights: [
      "Deep ATS compatibility score & parsing test",
      "Action-verb & quantifiable impact metric audit",
      "Benchmark against top candidate profiles",
    ],
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBorder: "border-blue-200 dark:border-blue-500/25",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    glowColor: "rgba(59, 130, 246, 0.12)",
    accentColor: "#3b82f6",
  },
  {
    id: "feature-voice-interviewer",
    title: "Voice AI Mock Interviewer",
    description:
      "Practice speaking with an ultra-responsive conversational voice AI that adapts dynamically, probes specifics, and asks realistic follow-ups.",
    icon: Mic,
    category: "Voice Simulation",
    actionHref: "/mock-interview",
    highlights: [
      "Low-latency voice recognition & speech synthesis",
      "Dynamic follow-up questions tailored to your answers",
      "Technical, Behavioral & Hiring Manager personas",
    ],
    gradient: "from-indigo-500/20 to-violet-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBorder: "border-indigo-200 dark:border-indigo-500/25",
    iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
    glowColor: "rgba(99, 102, 241, 0.14)",
    accentColor: "#6366f1",
    featured: true,
  },
  {
    id: "feature-answer-evaluation",
    title: "AI Answer Evaluation",
    description:
      "Receive objective multi-dimensional feedback breaking down your answers by STAR framework, clarity, delivery speed, and conceptual depth.",
    icon: Sparkles,
    category: "Critique Engine",
    actionHref: "/features/answer-evaluation-feedback",
    highlights: [
      "STAR framework compliance scoring",
      "Pacing, tone & filler word analytics",
      "Actionable model answers & improvement rewrites",
    ],
    gradient: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBorder: "border-violet-200 dark:border-violet-500/25",
    iconBg: "bg-violet-50 dark:bg-violet-500/10",
    glowColor: "rgba(139, 92, 246, 0.12)",
    accentColor: "#8b5cf6",
  },
  {
    id: "feature-performance-dashboard",
    title: "Performance Dashboard",
    description:
      "Monitor your growth with longitudinal score tracking, skill radars, session recordings, and target company readiness ratings.",
    icon: BarChart3,
    category: "Analytics & Trends",
    actionHref: "/features/performance-dashboard",
    highlights: [
      "Competence radar & historical trend curves",
      "Session archive with transcripts & audio",
      "FAANG & Fortune 500 readiness score",
    ],
    gradient: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBorder: "border-amber-200 dark:border-amber-500/25",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    glowColor: "rgba(245, 158, 11, 0.10)",
    accentColor: "#f59e0b",
  },
  {
    id: "feature-career-roadmap",
    title: "Personalized Career Roadmap",
    description:
      "Get a custom phased timeline targeting your position and timeline, highlighting which skills to sharpen and concepts to revise each week.",
    icon: Compass,
    category: "Career Guidance",
    actionHref: "/features/career-roadmap",
    highlights: [
      "Week-by-week curriculum for your weaknesses",
      "Curated practice problems & case studies",
      "Milestone tracking to keep you interview-ready",
    ],
    gradient: "from-cyan-500/20 to-teal-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    iconBorder: "border-cyan-200 dark:border-cyan-500/25",
    iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
    glowColor: "rgba(6, 182, 212, 0.10)",
    accentColor: "#06b6d4",
  },
  {
    id: "feature-ai-coaching",
    title: "Real-Time AI Coaching",
    description:
      "Receive live coaching during your session — the AI detects hesitation, unclear points, and missed STAR elements and guides you instantly.",
    icon: Brain,
    category: "Live Coaching",
    actionHref: "/mock-interview",
    highlights: [
      "Real-time detection of hesitation & filler words",
      "Instant STAR structure guidance mid-answer",
      "Post-session personalized improvement report",
    ],
    gradient: "from-emerald-500/20 to-green-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBorder: "border-emerald-200 dark:border-emerald-500/25",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    glowColor: "rgba(16, 185, 129, 0.10)",
    accentColor: "#10b981",
  },
];

function FeatureCard({ id, title, description, icon: Icon, category, highlights, actionHref, gradient, iconColor, iconBorder, iconBg, glowColor, accentColor, featured }) {
  return (
    <div
      id={id}
      className={`feature-card group relative flex flex-col rounded-2xl p-6 border border-slate-200/90 bg-white shadow-xs hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-white/10 dark:bg-[#131b2e] dark:hover:border-indigo-500/30 ${
        featured ? "ring-2 ring-indigo-500/40" : ""
      }`}
      style={featured ? { boxShadow: `0 0 0 1px rgba(99,102,241,0.25), 0 12px 36px ${glowColor}` } : {}}
    >
      {/* Featured badge with proper headroom */}
      {featured && (
        <div className="absolute -top-3.5 left-6 z-20">
          <span className="badge-ai shadow-sm font-semibold">⭐ Most Popular</span>
        </div>
      )}

      {/* Background gradient accent */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -z-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconBg} ${iconColor} ${iconBorder} shadow-xs group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mt-1">{category}</span>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
          {description}
        </p>

        {/* Highlights */}
        {highlights.length > 0 && (
          <ul className="mt-5 space-y-2 border-t border-slate-100 dark:border-white/5 pt-4 flex-1">
            {highlights.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <CheckCircle2
                  className="h-3.5 w-3.5 shrink-0 mt-0.5 transition-colors"
                  style={{ color: accentColor }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <Link
            href={actionHref}
            className="text-xs font-bold transition-colors hover:underline"
            style={{ color: accentColor }}
          >
            Explore Feature
          </Link>
          <Link
            href={actionHref}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white dark:bg-white/5 dark:text-slate-400 dark:hover:bg-indigo-600 dark:hover:text-white transition-all group-hover:scale-110"
            aria-label={`Open ${title}`}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Section background glow */}
      <div className="absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 justify-center overflow-hidden pointer-events-none">
        <div className="h-[45rem] w-[75rem] rounded-full bg-gradient-to-tr from-indigo-500/10 via-violet-500/8 to-cyan-500/5 blur-3xl dark:from-indigo-900/12 dark:via-violet-900/8 dark:to-cyan-900/5" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs mb-5 dark:border-indigo-500/30 dark:bg-gradient-to-r dark:from-indigo-500/10 dark:to-violet-500/8 dark:text-indigo-300">
            <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
            <span>End-to-End Interview Mastery</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl sm:leading-tight">
            Five Pillars to{" "}
            <span className="text-gradient-accent">Interview Excellence</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            InterviewIQ combines voice AI simulation, real-time coaching, resume intelligence, 
            and data analytics to guide you from prep to offer.
          </p>

          {/* Divider */}
          <div className="section-divider mt-10" />
        </div>

        {/* Feature Cards Grid with top padding for badges */}
        <div className="pt-2 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((feature) => (
            <FeatureCard key={feature.id} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
