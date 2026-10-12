import {
  FileText,
  Target,
  Mic,
  Sparkles,
  BarChart3,
  Compass,
} from "lucide-react";
import FeatureCard from "./FeatureCard";

const featuresData = [
  {
    id: "feature-resume-analyzer",
    title: "AI Resume Analyzer",
    description:
      "Upload your resume to receive rigorous ATS scoring, bullet-point impact audits, and keyword optimization tailored to modern hiring algorithms.",
    icon: FileText,
    stepNumber: "Step 2",
    category: "Resume Intelligence",
    slug: "resume-analyzer",
    highlights: [
      "Deep ATS compatibility score & parsing test",
      "Action-verb & quantifiable impact metric audit",
      "Benchmark comparison against top candidate profiles",
    ],
    iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    id: "feature-jd-matcher",
    title: "Job Description Matcher",
    description:
      "Paste any target job description alongside your profile to instantly identify critical qualification gaps, missing tech keywords, and strategic talking points.",
    icon: Target,
    stepNumber: "Step 2",
    category: "Target Alignment",
    slug: "job-description-matcher",
    highlights: [
      "Semantic similarity score between resume and JD",
      "High-priority missing skill & requirement alert",
      "Custom interview talking points & defense strategies",
    ],
    iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    id: "feature-voice-interviewer",
    title: "Voice-based AI Mock Interviewer",
    description:
      "Practice speaking out loud with an ultra-responsive, conversational voice AI that adapts dynamically, probes into specifics, and asks realistic follow-ups.",
    icon: Mic,
    stepNumber: "Step 3",
    category: "Voice Simulation",
    slug: "voice-mock-interviewer",
    highlights: [
      "Low-latency voice recognition and speech synthesis",
      "Dynamic follow-up questions tailored to your answers",
      "Specialized personas: Technical, Behavioral, and Hiring Manager",
    ],
    iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  {
    id: "feature-answer-evaluation",
    title: "AI Answer Evaluation & Feedback",
    description:
      "Receive objective, multi-dimensional feedback breaking down your answers by the STAR framework, clarity, delivery speed, and conceptual depth.",
    icon: Sparkles,
    stepNumber: "Step 4",
    category: "Critique Engine",
    slug: "answer-evaluation-feedback",
    highlights: [
      "STAR framework compliance score (Situation, Task, Action, Result)",
      "Pacing, tone, and filler word frequency analytics",
      "Actionable model answers and improvement rewrites",
    ],
    iconBg: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  {
    id: "feature-performance-dashboard",
    title: "Interview Performance Dashboard",
    description:
      "Monitor your growth over time with longitudinal score tracking, skill radars, session recordings, and target company readiness ratings.",
    icon: BarChart3,
    stepNumber: "Step 5",
    category: "Analytics & Trends",
    slug: "performance-dashboard",
    highlights: [
      "Comprehensive competence radar & historical trend curves",
      "Session archive with synchronized transcripts & audio",
      "Aggregated readiness score for FAANG and Fortune 500 roles",
    ],
    iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    id: "feature-career-roadmap",
    title: "Personalized Career Roadmap",
    description:
      "Get a custom, phased timeline tailored to your target position and timeline, highlighting exactly which skills to sharpen and concepts to revise each week.",
    icon: Compass,
    stepNumber: "Step 6",
    category: "Career Guidance",
    slug: "career-roadmap",
    highlights: [
      "Phased week-by-week curriculum targeting your weaknesses",
      "Curated practice problem recommendations & case studies",
      "Milestone tracking to keep you accountable and interview-ready",
    ],
    iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Background radial accent */}
      <div className="absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 justify-center overflow-hidden">
        <div className="h-[40rem] w-[60rem] rounded-full bg-gradient-to-tr from-indigo-900/10 to-violet-900/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <span>End-to-End Career Architecture</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Six Intelligent Pillars for Interview Mastery
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            InterviewIQ combines resume optimization, intelligent voice simulation, and data-driven feedback to guide you from first application to final offer.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((feature) => (
            <FeatureCard key={feature.id} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
