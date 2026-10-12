import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function FeatureCard({
  id,
  title,
  description,
  icon: Icon,
  stepNumber,
  category,
  highlights = [],
  slug,
  accentClass = "from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/30",
  iconBg = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
}) {
  return (
    <div
      id={id}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md transition-all duration-300 hover:border-indigo-500/40 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      {/* Top ambient hover accent */}
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl transition-all duration-300 group-hover:bg-indigo-500/20" />

      <div>
        {/* Header with Icon and Badges */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border ${iconBg} shadow-inner transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="h-6 w-6" />
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="rounded-full bg-indigo-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-800/60">
              {stepNumber}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              {category}
            </span>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-indigo-200">
          {title}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-300 line-clamp-3">
          {description}
        </p>

        {/* Feature Highlights */}
        {highlights.length > 0 && (
          <ul className="mt-5 space-y-2 border-t border-slate-800/80 pt-4">
            {highlights.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs text-slate-300"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer Link / Action */}
      <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
        <span className="inline-flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
          Architecture & Roadmap
        </span>
        <Link
          href={`/features/${slug}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/70 text-slate-300 transition-colors hover:bg-indigo-600 hover:text-white"
          aria-label={`View roadmap for ${title}`}
        >
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}
