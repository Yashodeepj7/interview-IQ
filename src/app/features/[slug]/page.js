import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Code2,
  CheckCircle2,
  Clock,
} from "lucide-react";

const featureDetails = {
  "resume-analyzer": {
    title: "AI Resume Analyzer",
    step: "Step 2",
    status: "Upcoming in Next Step",
    tagline: "High-precision ATS scoring & keyword impact benchmarking",
    description:
      "The AI Resume Analyzer will parse PDF/text resumes, analyze formatting and layout, extract competencies, and evaluate each bullet point against modern recruiter rubrics.",
    plannedFeatures: [
      "Client-side PDF & text resume upload and parsing",
      "Action-verb and quantifiable metric scanner",
      "ATS compatibility checklist and layout diagnostics",
      "Bullet-point rewrite recommendations for maximum impact",
    ],
    technicalHighlights: [
      "Gemini API structured JSON schema generation (in Step 2)",
      "Strict data sanitization & PII protection",
      "Dynamic score visualization meters",
    ],
  },
  "job-description-matcher": {
    title: "Job Description Matcher",
    step: "Step 2",
    status: "Upcoming in Next Step",
    tagline: "Semantic role comparison & critical skill gap analysis",
    description:
      "Compare your resume against any target job posting to find direct keyword matches, semantic overlaps, missing qualifications, and prioritized talking points.",
    plannedFeatures: [
      "Side-by-side comparison interface (Resume vs. Job Description)",
      "Match percentage score and qualification tier breakdown",
      "Must-have vs. Nice-to-have skill differentiation",
      "Automated interview question predictor based on the job description",
    ],
    technicalHighlights: [
      "High-accuracy semantic similarity matching",
      "Real-time text tokenization and diffing",
      "Exportable interview cheat-sheet",
    ],
  },
  "voice-mock-interviewer": {
    title: "Voice-based AI Mock Interviewer",
    step: "Step 3",
    status: "Scheduled for Step 3",
    tagline: "Real-time conversational speech synthesis & dynamic follow-ups",
    description:
      "Experience life-like spoken interview simulations where an AI interviewer adapts in real time, asks follow-up questions, and challenges candidates just like a senior human interviewer.",
    plannedFeatures: [
      "Speech-to-Text (STT) for natural voice answering",
      "Text-to-Speech (TTS) for lifelike interviewer voices",
      "Configurable interviewer personas (Friendly, Neutral, Rigorous)",
      "Live transcription and audio waveform visualization",
    ],
    technicalHighlights: [
      "Low-latency streaming audio processing",
      "Adaptive follow-up prompt trees",
      "Session recording and transcript playback",
    ],
  },
  "answer-evaluation-feedback": {
    title: "AI Answer Evaluation and Feedback",
    step: "Step 4",
    status: "Scheduled for Step 4",
    tagline: "Objective STAR scoring, delivery pacing, and rubric critique",
    description:
      "Deep analytical feedback on candidate responses, examining whether the Situation, Task, Action, and Result are present, along with pacing and vocabulary critique.",
    plannedFeatures: [
      "STAR framework compliance score",
      "Pacing (Words Per Minute) & filler word frequency breakdown",
      "Grammar, vocabulary, and tone evaluation",
      "Actionable model answers showcasing optimal responses",
    ],
    technicalHighlights: [
      "Structured evaluation rubric templates",
      "Detailed sentence-level commentary",
      "Interactive revision comparison diffs",
    ],
  },
  "performance-dashboard": {
    title: "Interview Performance Dashboard",
    step: "Step 5",
    status: "Scheduled for Step 5",
    tagline: "Longitudinal analytics, radar graphs, and readiness tracking",
    description:
      "Visualize your progress across sessions, track improvement over time, and evaluate your readiness for top-tier tech and enterprise roles.",
    plannedFeatures: [
      "Skill competency radar chart across behavioral & technical topics",
      "Session history with audio recordings and transcribed timestamps",
      "Overall interview readiness index score",
      "Target company benchmark comparisons",
    ],
    technicalHighlights: [
      "Persistent session analytics data model",
      "Responsive interactive SVG chart visualizations",
      "Downloadable interview performance PDF summary",
    ],
  },
  "career-roadmap": {
    title: "Personalized Career Roadmap",
    step: "Step 6",
    status: "Scheduled for Step 6",
    tagline: "Milestone-driven prep timelines and accountability paths",
    description:
      "A tailored curriculum generated based on your current interview performance and resume gaps to guide your preparation toward offer day.",
    plannedFeatures: [
      "Week-by-week preparation milestones",
      "Targeted topic practice playlists",
      "Accountability reminders and progress tracking",
      "Milestone completion badges and certificates",
    ],
    technicalHighlights: [
      "Dynamic milestone scheduling engine",
      "Personalized learning resource recommendations",
      "Calendar integration and reminder notifications",
    ],
  },
};

export function generateStaticParams() {
  return [
    { slug: "resume-analyzer" },
    { slug: "job-description-matcher" },
    { slug: "voice-mock-interviewer" },
    { slug: "answer-evaluation-feedback" },
    { slug: "performance-dashboard" },
    { slug: "career-roadmap" },
  ];
}

export default async function FeaturePage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const feature = featureDetails[slug] || {
    title: "Planned Platform Feature",
    step: "Upcoming Step",
    status: "Roadmap Stage",
    tagline: "Architecture and implementation planned for future iteration",
    description:
      "This feature is part of the multi-step InterviewIQ development roadmap. The current foundation stage establishes project scaffolding, component hierarchy, and design system tokens.",
    plannedFeatures: [
      "Clean modular design conforming to Next.js App Router",
      "Tailored UI components built with Tailwind CSS",
      "Step-by-step phased engineering",
    ],
    technicalHighlights: [
      "Safe, modular JavaScript implementation",
      "Strict separation of concerns",
    ],
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
              {feature.step} Milestone
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:py-20 sm:px-6 lg:px-8 w-full flex-1">
        {/* Roadmap Indicator Banner */}
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-indigo-950/20">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                {feature.status}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Step 1 Active — Feature Staged</span>
            </div>
          </div>

          <div className="mt-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {feature.title}
            </h1>
            <p className="mt-2 text-base text-indigo-400 font-medium">
              {feature.tagline}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {feature.description}
            </p>
          </div>

          {/* Planned Deliverables */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-slate-950/60 p-5 border border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-indigo-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Planned Product Capabilities
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {feature.plannedFeatures.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-slate-950/60 p-5 border border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="h-4 w-4 text-violet-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Engineering Architecture
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {feature.technicalHighlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Notice Box */}
          <div className="mt-8 rounded-xl bg-slate-950/80 p-4 border border-indigo-900/40 text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-200">
              Engineering Status Notice:{" "}
            </span>
            As specified in the step-by-step roadmap, Step 1 focuses on scaffolding, component architecture, and the polished landing/dashboard shell. The functional implementation for {feature.title} will be developed in {feature.step}.
          </div>

          <div className="mt-8 pt-5 border-t border-slate-800 flex flex-wrap justify-between items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Dashboard</span>
            </Link>

            {slug === "voice-mock-interviewer" && (
              <Link
                href="/mock-interview"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                <span>Launch Mock Interview Engine</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}

            <span className="text-xs text-slate-400 font-mono">
              interview-iq • v0.1.0
            </span>
          </div>
        </div>
      </main>

      {/* Mini footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-400">
        InterviewIQ AI Platform • Step 1 Project Foundation
      </footer>
    </div>
  );
}
