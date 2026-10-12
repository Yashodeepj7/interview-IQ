"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trash2,
  FileText,
  AlertCircle,
  Loader2,
  Award,
  BookOpen,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EvaluationReportView from "@/components/EvaluationReportView";

function InterviewDetailContent({ params }) {
  const unwrappedParams = use(params);
  const interviewId = unwrappedParams.id;

  const router = useRouter();
  const { data: session, status } = useSession();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("report"); // "report" | "transcript"
  const [copied, setCopied] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/dashboard/interviews/${interviewId}`);
      return;
    }

    if (status === "authenticated" && interviewId) {
      let active = true;
      fetch(`/api/interviews/${interviewId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!active) return;
          if (data?.success && data.interview) {
            setInterview(data.interview);
            if (!data.interview.evaluation) {
              setActiveTab("transcript");
            }
          } else {
            setError(data?.error || "Interview record not found.");
          }
          setLoading(false);
        })
        .catch(() => {
          if (!active) return;
          setError("Failed to load interview record details.");
          setLoading(false);
        });

      return () => {
        active = false;
      };
    }
  }, [status, interviewId, router]);

  const handleDelete = async () => {
    if (isDeleting || !interviewId) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/interviews/${interviewId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setDeleteError(data.error || "Failed to delete interview record.");
        setIsDeleting(false);
        return;
      }

      router.push("/dashboard/interviews");
    } catch (err) {
      setDeleteError("Network error while deleting record.");
      setIsDeleting(false);
    }
  };

  const handleCopyTranscript = () => {
    if (!interview) return;
    let text = `InterviewIQ Mock Interview Transcript\n`;
    text += `Role: ${interview.settings?.role} (${interview.settings?.experience})\n`;
    text += `Format: ${interview.settings?.type} | Difficulty: ${interview.settings?.difficulty}\n`;
    text += `Date: ${new Date(interview.createdAt).toLocaleDateString()}\n\n`;

    interview.questions?.forEach((q, idx) => {
      text += `Question ${idx + 1} [${q.category}]:\n${q.text}\n\n`;
      text += `Candidate Answer:\n${interview.answers?.[q.id]?.trim() || "[No answer provided]"}\n\n`;
      text += `--------------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || status === "loading") {
    return (
      <div className="relative min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-3" />
            <p className="text-xs text-slate-400">Loading interview details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="relative min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-20 text-center">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 sm:p-12 backdrop-blur-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Interview Not Found</h2>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              {error || "This interview record does not exist or you do not have permission to access it."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/dashboard/interviews"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to History</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasEvaluation = Boolean(interview.evaluation);
  const dateStr = interview.createdAt
    ? new Date(interview.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Saved Session";

  return (
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Top Navigation & Meta Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/interviews"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to History</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400 truncate max-w-[200px]">
              {interview.settings?.role}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 hover:text-rose-200 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Record</span>
            </button>
          </div>
        </div>

        {/* Record Summary Banner */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="rounded-md bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                  {interview.settings?.type || "Mixed"}
                </span>
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                  {interview.settings?.difficulty || "Medium"} Tier
                </span>
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                  {interview.settings?.experience || "General"}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white sm:text-3xl">
                {interview.settings?.role}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  {dateStr}
                </span>
                <span>•</span>
                <span>
                  {interview.answeredCount || 0}/{interview.questions?.length || 5} questions answered
                </span>
              </div>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-3">
              {hasEvaluation ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-5 py-3 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    Overall Score
                  </span>
                  <div className="text-3xl font-black text-emerald-300">
                    {interview.overallScore !== null ? `${interview.overallScore}/100` : "—"}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-700 bg-slate-800/40 px-5 py-3 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </span>
                  <div className="text-sm font-bold text-slate-300">
                    Transcript Only
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              {hasEvaluation && (
                <button
                  type="button"
                  onClick={() => setActiveTab("report")}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === "report"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>Evaluation Report</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("transcript")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === "transcript"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Interview Transcript</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyTranscript}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Transcript</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: AI Evaluation Report (reusing EvaluationReportView) */}
        {activeTab === "report" && hasEvaluation && (
          <EvaluationReportView
            evaluation={interview.evaluation}
            sessionSettings={interview.settings}
            onViewTranscript={() => setActiveTab("transcript")}
          />
        )}

        {/* Tab 2: Transcript View */}
        {activeTab === "transcript" && (
          <div className="space-y-6">
            {!hasEvaluation && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-300 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-semibold">Transcript-Only Session</p>
                  <p className="mt-0.5 text-amber-300/80 leading-relaxed">
                    This interview was saved directly without requesting an AI Gemini evaluation. Your questions and responses are preserved below for self-review.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {interview.questions?.map((q, idx) => {
                const answerText = interview.answers?.[q.id]?.trim();
                const isAnswered = Boolean(answerText && answerText.length >= 5);

                return (
                  <div
                    key={q.id || idx}
                    className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-400">
                          Question {idx + 1}
                        </span>
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                          {q.category}
                        </span>
                      </div>

                      {isAnswered ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Answered</span>
                        </span>
                      ) : (
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500">
                          Skipped
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-white mb-4">
                      {q.text}
                    </h3>

                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Your Submitted Response:
                      </div>
                      {isAnswered ? (
                        <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {answerText}
                        </p>
                      ) : (
                        <p className="text-xs italic text-slate-500">
                          [No answer was recorded for this question]
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl shadow-rose-950/40">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Interview Record?</h3>
                  <p className="text-xs text-slate-400">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to delete this interview record? It will be permanently removed from MongoDB Atlas and your dashboard history.
              </p>

              {deleteError && (
                <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300">
                  {deleteError}
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteError(null);
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Confirm Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function InterviewDetailPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
          <Navbar />
          <main className="flex-1 flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-3" />
              <p className="text-xs text-slate-400">Loading interview details...</p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <InterviewDetailContent params={params} />
    </Suspense>
  );
}
