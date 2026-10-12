"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInterviews = () => {
    setLoading(true);
    setError(null);
    fetch("/api/interviews")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setInterviews(data.interviews || []);
        } else {
          setError(data?.error || "Failed to load your interviews.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Network or server connection error.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard");
      return;
    }

    if (status === "authenticated") {
      let active = true;
      fetch("/api/interviews")
        .then((res) => res.json())
        .then((data) => {
          if (!active) return;
          if (data?.success) {
            setInterviews(data.interviews || []);
          } else {
            setError(data?.error || "Failed to load your interviews.");
          }
          setLoading(false);
        })
        .catch(() => {
          if (!active) return;
          setError("Network or server connection error.");
          setLoading(false);
        });

      return () => {
        active = false;
      };
    }
  }, [status, router]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="relative min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-3" />
            <p className="text-sm text-slate-400">Loading your interview dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate statistics from loaded interviews
  const totalSaved = interviews.length;
  const evaluatedInterviews = interviews.filter(
    (item) => item.status === "evaluated" && typeof item.overallScore === "number"
  );
  const evaluatedCount = evaluatedInterviews.length;

  // Average score strictly calculated across evaluated records only
  const averageScore = evaluatedCount > 0
    ? Math.round(
        evaluatedInterviews.reduce((sum, item) => sum + item.overallScore, 0) /
          evaluatedCount
      )
    : null;

  const totalQuestionsAnswered = interviews.reduce(
    (sum, item) => sum + (Number(item.answeredCount) || 0),
    0
  );

  const recentInterviews = interviews.slice(0, 5);

  const getScoreBadge = (score) => {
    if (score === null || score === undefined) {
      return (
        <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-400 border border-slate-700">
          Unevaluated
        </span>
      );
    }
    if (score >= 80) {
      return (
        <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
          {score}/100
        </span>
      );
    }
    if (score >= 65) {
      return (
        <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
          {score}/100
        </span>
      );
    }
    return (
      <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30">
        {score}/100
      </span>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30">
                Personal Career Portal
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {session?.user?.name || "Candidate"}
              </span>
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Review your interview history, track AI scoring trends, and sharpen your skills.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/mock-interview"
              id="dashboard-start-interview-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Start New Mock Interview</span>
            </Link>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="my-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs text-rose-300"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Unable to fetch interviews</p>
              <p className="mt-0.5 text-rose-400/90">{error}</p>
            </div>
            <button
              onClick={fetchInterviews}
              className="rounded-lg bg-rose-900/50 px-2.5 py-1 text-[11px] font-semibold text-rose-200 hover:bg-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Saved */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Saved Interviews</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-white">{totalSaved}</p>
            <p className="mt-1 text-[11px] text-slate-500">Persistent sessions in MongoDB</p>
          </div>

          {/* Evaluated Count */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">AI Evaluated</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-white">{evaluatedCount}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {totalSaved - evaluatedCount} transcript-only
            </p>
          </div>

          {/* Average Score */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Average AI Score</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-white">
              {averageScore !== null ? `${averageScore}%` : "—"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {evaluatedCount > 0 ? "Across evaluated sessions" : "No evaluations yet"}
            </p>
          </div>

          {/* Practiced Questions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Questions Answered</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-white">{totalQuestionsAnswered}</p>
            <p className="mt-1 text-[11px] text-slate-500">Total prompts tackled</p>
          </div>
        </div>

        {/* Recent Interviews Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400" />
              <span>Recent Mock Interviews</span>
            </h2>
            {totalSaved > 0 && (
              <Link
                href="/dashboard/interviews"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <span>View All ({totalSaved})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {totalSaved === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 sm:p-12 text-center backdrop-blur-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-4">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-white">No Interview History Yet</h3>
              <p className="mt-2 text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Take your first AI mock interview session with tailored questions, speech dictation, and comprehensive rubrics.
              </p>
              <div className="mt-6">
                <Link
                  href="/mock-interview"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition-all"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Start Your First Interview</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInterviews.map((item) => {
                const dateStr = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently";

                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-slate-700 hover:bg-slate-900/90"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 font-bold text-xs">
                        {item.settings?.role?.slice(0, 2).toUpperCase() || "IT"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {item.settings?.role || "Interview Session"}
                          </span>
                          <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                            {item.settings?.type || "Mixed"}
                          </span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            {dateStr}
                          </span>
                          <span>•</span>
                          <span>{item.settings?.experience || "General"}</span>
                          <span>•</span>
                          <span>
                            {item.answeredCount || 0}/{item.settings?.questionCount || 5} answered
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getScoreBadge(item.overallScore)}
                      <Link
                        href={`/dashboard/interviews/${item.id}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-800/50 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
