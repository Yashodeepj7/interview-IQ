"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Trash2,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Filter,
  Award,
  BookOpen,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function InterviewHistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "evaluated" | "transcript"

  // Delete modal state
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchInterviews = () => {
    setLoading(true);
    setError(null);
    fetch("/api/interviews")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setInterviews(data.interviews || []);
        } else {
          setError(data?.error || "Failed to load interview history.");
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
      router.push("/login?callbackUrl=/dashboard/interviews");
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
            setError(data?.error || "Failed to load interview history.");
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

  const handleDelete = async (id) => {
    if (!id || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/interviews/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setDeleteError(data.error || "Failed to delete interview record.");
        setIsDeleting(false);
        return;
      }

      // Remove from local list
      setInterviews((prev) => prev.filter((item) => item.id !== id));
      setDeletingId(null);
    } catch (err) {
      setDeleteError("Network error while deleting record.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredInterviews = interviews.filter((item) => {
    if (filter === "evaluated") return item.status === "evaluated";
    if (filter === "transcript") return item.status !== "evaluated";
    return true;
  });

  const getScoreBadge = (score) => {
    if (score === null || score === undefined) {
      return (
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
          Transcript Only
        </span>
      );
    }
    if (score >= 80) {
      return (
        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30">
          {score}/100
        </span>
      );
    }
    if (score >= 65) {
      return (
        <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30">
          {score}/100
        </span>
      );
    }
    return (
      <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30">
        {score}/100
      </span>
    );
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] text-[var(--foreground)] flex flex-col justify-between transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <Link
            href="/mock-interview"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500 transition-all"
          >
            <span>New Mock Session</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Title & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl tracking-tight">
              Interview History
            </h1>
            <p className="mt-1 text-sm font-normal text-slate-600 dark:text-slate-400">
              Browse all saved mock interview sessions and AI evaluation reports.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              All ({interviews.length})
            </button>
            <button
              onClick={() => setFilter("evaluated")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === "evaluated"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Evaluated ({interviews.filter((i) => i.status === "evaluated").length})
            </button>
            <button
              onClick={() => setFilter("transcript")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === "transcript"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Transcript Only ({interviews.filter((i) => i.status !== "evaluated").length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600 dark:text-indigo-400 mb-3" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Loading your interview records...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && !loading && (
          <div
            role="alert"
            className="my-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-300"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Unable to fetch interviews</p>
              <p className="mt-0.5 text-rose-700 dark:text-rose-400/90">{error}</p>
            </div>
            <button
              onClick={fetchInterviews}
              className="rounded-lg bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-800 hover:bg-rose-200 dark:bg-rose-900/50 dark:text-rose-200 dark:hover:bg-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* List of Interviews */}
        {!loading && !error && (
          <div className="mt-8 space-y-3.5">
            {filteredInterviews.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900/40">
                <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No Interviews Found</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  {filter === "all"
                    ? "You haven't saved any mock interview sessions yet."
                    : `No interviews matching the "${filter}" filter.`}
                </p>
                <div className="mt-5">
                  <Link
                    href="/mock-interview"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-xs"
                  >
                    <span>Start Mock Interview</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              filteredInterviews.map((item) => {
                const dateStr = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Saved session";

                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-900/90"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-bold text-sm dark:bg-indigo-950/60 dark:border-indigo-500/20 dark:text-indigo-400">
                        {item.settings?.role?.slice(0, 2).toUpperCase() || "IT"}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {item.settings?.role || "Mock Interview"}
                          </h3>
                          <span className="rounded-md bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-500/30 dark:text-indigo-300">
                            {item.settings?.type || "Mixed"}
                          </span>
                          <span className="rounded-md bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                            {item.settings?.difficulty || "Medium"}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                            {dateStr}
                          </span>
                          <span>•</span>
                          <span>{item.settings?.experience || "General"}</span>
                          <span>•</span>
                          <span>
                            {item.answeredCount || 0} answered, {item.skippedCount || 0} skipped
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getScoreBadge(item.overallScore)}

                      <Link
                        href={`/dashboard/interviews/${item.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 dark:border-indigo-500/40 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 dark:hover:text-white transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeletingId(item.id)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-rose-500/40 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition-colors"
                        title="Delete this interview"
                        aria-label={`Delete interview for ${item.settings?.role || "role"}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-rose-500/30 dark:bg-slate-900 dark:shadow-rose-950/40">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Interview Record?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to delete this mock interview session from your history? The transcript, scores, and AI rubrics will be permanently removed from MongoDB Atlas.
              </p>

              {deleteError && (
                <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300">
                  {deleteError}
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    setDeletingId(null);
                    setDeleteError(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleDelete(deletingId)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/30 hover:bg-rose-500 transition-colors disabled:opacity-50"
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
