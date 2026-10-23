import Link from "next/link";
import { Bot, Sparkles, Mic, FileText, BarChart3, Compass, Brain, ExternalLink } from "lucide-react";

const featureLinks = [
  { label: "AI Resume Analyzer", href: "/resume-analyzer", icon: FileText },
  { label: "Voice Mock Interviewer", href: "/mock-interview", icon: Mic },
  { label: "AI Answer Evaluation", href: "/features/answer-evaluation-feedback", icon: Sparkles },
  { label: "Performance Dashboard", href: "/features/performance-dashboard", icon: BarChart3 },
  { label: "Career Roadmap", href: "/features/career-roadmap", icon: Compass },
  { label: "Real-Time AI Coaching", href: "/mock-interview", icon: Brain },
];

const companyLinks = [
  { label: "About", href: "/" },
  { label: "Blog", href: "/" },
  { label: "Privacy Policy", href: "/" },
  { label: "Terms of Service", href: "/" },
];

const techLinks = [
  { label: "Next.js (App Router)", href: "/" },
  { label: "Google Gemini AI", href: "/" },
  { label: "NextAuth.js", href: "/" },
  { label: "Lucide Icons", href: "/" },
  { label: "AI Test Console", href: "/ai-test" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-200 bg-slate-50/50 dark:border-white/5 dark:bg-transparent pt-16 pb-8 text-slate-600 dark:text-slate-400 overflow-hidden transition-colors duration-200">
      {/* Subtle top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-96 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="logo-icon flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Interview<span className="text-indigo-600 dark:text-indigo-400">IQ</span>
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">AI Interview Platform</p>
              </div>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-xs">
              The most realistic AI-powered interview platform. Practice voice mock interviews, 
              get STAR-graded feedback, and land your dream role.
            </p>

            {/* Status badge */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 dark:bg-slate-900/60 dark:border-white/6 px-3 py-2 text-xs shadow-xs">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500">
                <span className="animate-ping inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-75" />
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">All systems operational</span>
            </div>
          </div>

          {/* Features */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-200 mb-5">
              Features
            </h4>
            <ul className="space-y-3">
              {featureLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors font-medium"
                  >
                    <Icon className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 transition-all -translate-x-1 group-hover:translate-x-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-200 mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-200 mb-5">
              Built With
            </h4>
            <ul className="space-y-3">
              {techLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* AI badge */}
            <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-500/20 dark:bg-gradient-to-br dark:from-indigo-500/8 dark:to-violet-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300">Powered by Gemini</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Real AI. No mock endpoints. Every interview is powered by Google Gemini.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider mt-12 mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <p>© 2026 InterviewIQ. All rights reserved.</p>
          <p>
            Crafted with{" "}
            <span className="text-rose-500">♥</span>{" "}
            using Next.js & Google Gemini AI
          </p>
        </div>
      </div>
    </footer>
  );
}
