import Link from "next/link";
import { Bot, Sparkles, Github, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070b12] py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Interview<span className="text-indigo-400">IQ</span>
              </span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              AI-Powered Career & Mock Interview Platform designed for candidates striving for excellence.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-300 border border-slate-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Step 1: Project Foundation Complete
              </span>
            </div>
          </div>

          {/* Planned Features */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Features
            </h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link
                  href="/features/resume-analyzer"
                  className="hover:text-indigo-300 transition-colors"
                >
                  AI Resume Analyzer (Step 2)
                </Link>
              </li>
              <li>
                <Link
                  href="/features/job-description-matcher"
                  className="hover:text-indigo-300 transition-colors"
                >
                  Job Description Matcher (Step 2)
                </Link>
              </li>
              <li>
                <Link
                  href="/mock-interview"
                  className="hover:text-indigo-300 transition-colors"
                >
                  AI Mock Interview Engine (Step 3)
                </Link>
              </li>
              <li>
                <Link
                  href="/features/answer-evaluation-feedback"
                  className="hover:text-indigo-300 transition-colors"
                >
                  Answer Evaluation & Feedback (Step 4)
                </Link>
              </li>
              <li>
                <Link
                  href="/features/performance-dashboard"
                  className="hover:text-indigo-300 transition-colors"
                >
                  Performance Dashboard (Step 5)
                </Link>
              </li>
              <li>
                <Link
                  href="/features/career-roadmap"
                  className="hover:text-indigo-300 transition-colors"
                >
                  Personalized Career Roadmap (Step 6)
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Technology Stack
            </h4>
            <ul className="mt-4 space-y-2 text-xs text-slate-400">
              <li>Next.js (App Router)</li>
              <li>JavaScript (ES6+)</li>
              <li>React & Tailwind CSS</li>
              <li>ESLint Architecture</li>
              <li>Lucide Icons</li>
              <li>
                <Link
                  href="/ai-test"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Gemini AI Test Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Guidelines */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Step 1 Highlights
            </h4>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Clean modular architecture, modern SaaS design system, zero mock AI fake endpoints, and responsive mobile-ready layout.
            </p>
            <div className="mt-4 text-xs text-slate-500">
              Next Step: Step 2 — AI Resume Analyzer & Job Description Matcher.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 InterviewIQ. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with modern React & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
