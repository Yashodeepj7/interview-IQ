"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Layers,
  Clock,
  Gauge,
  Briefcase,
  Sliders,
  CheckCircle2,
  FileText,
  HelpCircle,
  Mic,
  Keyboard,
  Lock,
  LogIn,
} from "lucide-react";
import { useSession } from "next-auth/react";

const ROLE_PRESETS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Java Developer",
  "DevOps Engineer",
];

const EXPERIENCE_OPTIONS = [
  { value: "Fresher", label: "Fresher / Entry Level", desc: "Foundational questions & academic projects" },
  { value: "0–2 years", label: "0–2 Years", desc: "Core implementation & junior workflows" },
  { value: "3–5 years", label: "3–5 Years", desc: "System architecture, trade-offs & scaling" },
  { value: "5+ years", label: "5+ Years", desc: "Staff-level design, leadership & ambiguity" },
];

const TYPE_OPTIONS = [
  { value: "Technical", label: "Technical", desc: "Data structures, frameworks, system design, debugging" },
  { value: "Mixed", label: "Mixed (Recommended)", desc: "Balanced blend of technical mastery & behavioral leadership" },
  { value: "HR/Behavioral", label: "HR / Behavioral", desc: "STAR stories, teamwork, conflict resolution & culture" },
];

const COUNT_OPTIONS = [
  { value: 5, label: "5 Questions", time: "~10-15 mins", tag: "Quick Practice" },
  { value: 10, label: "10 Questions", time: "~25-30 mins", tag: "Standard Round" },
  { value: 15, label: "15 Questions", time: "~40-50 mins", tag: "Deep Simulation" },
];

const DIFFICULTY_OPTIONS = [
  { value: "Easy", label: "Easy", color: "border-emerald-500/40 text-emerald-300" },
  { value: "Medium", label: "Medium", color: "border-indigo-500/40 text-indigo-300" },
  { value: "Hard", label: "Hard", color: "border-rose-500/40 text-rose-300" },
];

export default function MockInterviewSetup() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = authStatus === "authenticated" && !!session?.user;

  const [role, setRole] = useState(ROLE_PRESETS[0]);
  const [customRole, setCustomRole] = useState("");
  const [useCustomRole, setUseCustomRole] = useState(false);
  const [experience, setExperience] = useState("0–2 years");
  const [type, setType] = useState("Mixed");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState("Medium");
  const [topics, setTopics] = useState("");
  const [inputMode, setInputMode] = useState("typed"); // 'typed' or 'voice'
  const [showVoiceAuthPrompt, setShowVoiceAuthPrompt] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeRole = useCustomRole ? customRole.trim() : role;
  const isRoleValid = activeRole.length >= 2 && activeRole.length <= 100;

  async function handleStartInterview(e) {
    e.preventDefault();
    if (!isRoleValid || isLoading) return;

    if (inputMode === "voice" && !isAuthenticated) {
      setShowVoiceAuthPrompt(true);
      setError({
        success: false,
        error: "Sign In Required for Voice Interview",
        details: "Please sign in to start a hands-free AI voice interview with automated speech synthesis.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload = {
      role: activeRole,
      experience,
      type,
      questionCount: Number(questionCount),
      difficulty,
      topics: topics.trim() || undefined,
    };

    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          success: false,
          error: data?.error || "Our interview servers are currently experiencing heavy traffic and high demand. Please try again after some time.",
          heavyTraffic: true,
        });
        setIsLoading(false);
        return;
      }

      // Store in sessionStorage for current browser session (non-sensitive session data only)
      if (typeof window !== "undefined") {
        data.settings.inputMode = inputMode;
        sessionStorage.setItem("interviewiq_active_session", JSON.stringify(data));
        sessionStorage.setItem("interviewiq_session_answers", JSON.stringify({}));
        sessionStorage.removeItem("interviewiq_session_evaluation");
      }

      // Navigate to interactive session
      router.push("/mock-interview/session");
    } catch (err) {
      setError({
        success: false,
        error: "Our interview servers are currently experiencing heavy traffic and high demand. Please try again after some time.",
        heavyTraffic: true,
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Status */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors"
        >
          ← Return to Dashboard
        </Link>
        <span className="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 px-3 py-1 text-xs font-semibold">
          Step 3: AI Mock Interview Engine
        </span>
      </div>

      {/* Page Title */}
      <div className="mb-10 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-600/30 mb-4 ring-1 ring-white/20">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Configure Your Mock Interview
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-normal">
          Customize your role, experience level, and format. Our AI engine will synthesize a realistic, targeted set of questions designed to test your real-world skills.
        </p>
      </div>

      {/* Setup Form Card */}
      <form
        onSubmit={handleStartInterview}
        className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-6 sm:p-10 shadow-xl shadow-indigo-100/30 dark:shadow-2xl dark:shadow-indigo-950/40 space-y-8 transition-colors"
      >
        {/* Field 1: Target Role */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Target Role</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
            {ROLE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setRole(preset);
                  setUseCustomRole(false);
                }}
                className={`rounded-xl px-3 py-2.5 text-xs font-medium border text-left transition-all ${
                  !useCustomRole && role === preset
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold shadow-xs ring-1 ring-indigo-500/30 dark:border-indigo-500 dark:bg-indigo-600/20 dark:text-white"
                    : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUseCustomRole(!useCustomRole)}
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold"
            >
              {useCustomRole ? "Use preset roles" : "+ Or specify a custom role"}
            </button>
          </div>

          {useCustomRole && (
            <div className="mt-3">
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. iOS Engineer, Cloud Solutions Architect, Product Manager..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
              />
              {customRole.trim().length > 0 && customRole.trim().length < 2 && (
                <p className="mt-1 text-xs text-amber-500">Role must be at least 2 characters.</p>
              )}
            </div>
          )}
        </div>

        {/* Field 2: Experience Level */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Experience Level</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setExperience(opt.value)}
                className={`rounded-2xl p-4 border text-left transition-all ${
                  experience === opt.value
                    ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs ring-1 ring-indigo-500/30 dark:border-indigo-500 dark:bg-indigo-600/20 dark:text-white"
                    : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:border-slate-700"
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-200">
                  {opt.label}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Field 3: Interview Type */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Interview Format</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`rounded-2xl p-4 border text-left transition-all ${
                  type === opt.value
                    ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs ring-1 ring-indigo-500/30 dark:border-indigo-500 dark:bg-indigo-600/20 dark:text-white"
                    : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:border-slate-700"
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-200">
                  {opt.label}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Field 4 & 5: Question Count & Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Question Count */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Question Count</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {COUNT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setQuestionCount(opt.value)}
                  className={`rounded-xl p-3 border text-center transition-all ${
                    questionCount === opt.value
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold shadow-xs ring-1 ring-indigo-500/30 dark:border-indigo-500 dark:bg-indigo-600/20 dark:text-white"
                      : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{opt.value}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{opt.time}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Difficulty</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDifficulty(opt.value)}
                  className={`rounded-xl p-3 border text-center transition-all ${
                    difficulty === opt.value
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs ring-1 ring-indigo-500/30 dark:border-indigo-500 dark:bg-indigo-600/20 dark:text-white"
                      : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="text-sm font-semibold">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Tier</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Field 6: Response Mode Preference */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Mic className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Response Mode Preference</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setInputMode("typed");
                setShowVoiceAuthPrompt(false);
              }}
              className={`rounded-2xl p-4 border text-left transition-all ${
                inputMode === "typed"
                  ? "border-indigo-600 bg-indigo-50/90 text-indigo-950 shadow-xs ring-1 ring-indigo-500/30 dark:border-indigo-500 dark:bg-indigo-600/20 dark:text-white"
                  : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <Keyboard className={`h-4 w-4 ${inputMode === "typed" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`} />
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Typed Mode</span>
                {inputMode === "typed" && (
                  <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Standard keyboard input with live character count and autosave. Available for everyone.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setInputMode("voice");
                if (!isAuthenticated) {
                  setShowVoiceAuthPrompt(true);
                } else {
                  setShowVoiceAuthPrompt(false);
                }
              }}
              className={`rounded-2xl p-4 border text-left transition-all ${
                inputMode === "voice"
                  ? "border-indigo-600 bg-indigo-50/90 text-indigo-950 shadow-xs ring-1 ring-indigo-500/30 dark:border-indigo-500 dark:bg-indigo-600/20 dark:text-white"
                  : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <Mic className={`h-4 w-4 ${inputMode === "voice" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`} />
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Voice Mode</span>
                {isAuthenticated ? (
                  <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                    Hands-Free AI Voice
                  </span>
                ) : (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                    <Lock className="h-2.5 w-2.5" />
                    Sign In Required
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Hands-free AI voice automatically asks questions aloud with live speech transcription.
              </p>
            </button>
          </div>

          {/* Voice Authentication Required Banner */}
          {showVoiceAuthPrompt && !isAuthenticated && (
            <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200 shadow-sm transition-all">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Sign In Required for Voice Interview
                    </h4>
                    <p className="mt-0.5 text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                      AI Voice Mode automatically speaks questions aloud and listens for your verbal answers. Please sign in to your account to use voice mode, or choose Typed Mode below.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Link
                      href="/login?callbackUrl=/mock-interview"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Sign In to Unlock Voice Mode</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setInputMode("typed");
                        setShowVoiceAuthPrompt(false);
                      }}
                      className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 transition-colors"
                    >
                      Continue with Typed Mode
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-600 dark:text-slate-500 mt-2">
            In Voice Mode, our AI interviewer speaks each question out loud automatically as soon as it appears — no button clicks required.
          </p>
        </div>

        {/* Field 7: Optional Job Description or Focus Topics */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="interview-topics-textarea"
              className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Specific Topics or Job Description (Optional)</span>
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {topics.length} / 1500
            </span>
          </div>
          <textarea
            id="interview-topics-textarea"
            rows={3}
            value={topics}
            maxLength={1500}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="Paste excerpts from your target job description, or list key concepts you want to practice (e.g. React hooks, microservices, Kafka, Redis caching, executive presentation)..."
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-y transition-colors font-sans dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-50/90 dark:bg-amber-950/30 p-5 text-xs text-amber-950 dark:text-amber-200 shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {error.error?.includes("Sign In Required")
                      ? "Sign In Required for Voice Interview"
                      : "High Traffic Demand"}
                  </h4>
                  <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 px-2.5 py-0.5 text-[10px] font-semibold">
                    Temporary Delay
                  </span>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                  {error.error || "Our interview servers are currently experiencing heavy traffic and high demand. Please try again after some time."}
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="rounded-xl border border-amber-300 bg-white hover:bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-900 dark:border-amber-600 dark:bg-slate-900 dark:text-amber-200 transition-colors"
                  >
                    Dismiss & Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              Configured: {questionCount} questions • {difficulty} • {type} • {inputMode === "voice" ? "Voice Mode" : "Typed Mode"}
            </span>
          </div>

          <button
            type="submit"
            id="start-interview-submit-btn"
            disabled={!isRoleValid || isLoading}
            className="btn-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Generating Your Interview Plan...</span>
              </>
            ) : (
              <>
                <span>Start Mock Interview</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
