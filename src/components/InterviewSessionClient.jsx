"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Play,
  Pause,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Flag,
  Copy,
  Check,
  Sparkles,
  FileText,
  CornerDownRight,
  Loader2,
  BookOpen,
  ShieldCheck,
  Award,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Keyboard,
  Bookmark,
  BookmarkCheck,
  Database,
  Lock,
  LogIn,
} from "lucide-react";
import { useSession } from "next-auth/react";
import EvaluationReportView from "@/components/EvaluationReportView";
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  mapSpeechRecognitionError,
  appendSpeechTranscript,
} from "@/lib/speech";

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function InterviewSessionClient() {
  const router = useRouter();
  const isMounted = useIsClient();

  const [sessionData, setSessionData] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("interviewiq_active_session");
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [answers, setAnswers] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("interviewiq_session_answers");
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const [timerSeconds, setTimerSeconds] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("interviewiq_active_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed?.questions?.[0]?.expectedDurationSeconds || 120;
        }
      } catch {
        return 120;
      }
    }
    return 120;
  });

  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [transcriptCopied, setTranscriptCopied] = useState(false);

  // Step 5: Voice Interaction States
  const [inputMode, setInputMode] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("interviewiq_active_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.settings?.inputMode === "voice") return "voice";
        }
      } catch {}
    }
    return "typed";
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceError, setVoiceError] = useState(null);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  // Step 4 Evaluation State
  const [evaluation, setEvaluation] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("interviewiq_session_evaluation");
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState(null);
  const [completionViewMode, setCompletionViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("interviewiq_session_evaluation");
        if (stored) return "report";
      } catch {}
    }
    return "choice";
  });

  // Step 6: Authentication & MongoDB Persistence State
  const { data: authSession, status: authStatus } = useSession();
  const isAuthenticated = authStatus === "authenticated" && !!authSession?.user;
  const [showVoiceSessionAuthNotice, setShowVoiceSessionAuthNotice] = useState(false);
  const lastSpokenQuestionIdRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedInterviewId, setSavedInterviewId] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const handleSaveInterview = async () => {
    if (isSaving || !sessionData) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionIdentifier: sessionData.interviewId,
          settings: sessionData.settings,
          questions: sessionData.questions,
          answers: answers,
          evaluation: evaluation || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSaveError(data.error || "Failed to save interview session.");
        setIsSaving(false);
        return;
      }

      setSavedInterviewId(data.interviewId);
    } catch (err) {
      setSaveError("Network error while saving interview session.");
    } finally {
      setIsSaving(false);
    }
  };

  const questions = sessionData?.questions || [];
  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const currentAnswer = currentQ ? answers[currentQ.id] || "" : "";

  // Feature detection
  const hasSTT = isMounted && typeof window !== "undefined" && isSpeechRecognitionSupported(window);
  const hasTTS = isMounted && typeof window !== "undefined" && isSpeechSynthesisSupported(window);

  // Stop Text-to-Speech safely
  const stopReading = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Stop Speech Recognition safely
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    isListeningRef.current = false;
    setIsListening(false);
    setInterimTranscript("");
  };

  // Switch question and reinitialize countdown timer for target question
  const goToQuestion = (targetIndex) => {
    if (targetIndex < 0 || targetIndex >= totalQuestions) return;

    // Clean up voice activities when changing question
    stopListening();
    stopReading();
    setInterimTranscript("");
    setVoiceError(null);
    lastSpokenQuestionIdRef.current = null;

    setCurrentIndex(targetIndex);
    const targetQ = questions[targetIndex];
    setTimerSeconds(targetQ?.expectedDurationSeconds || 120);
    setIsTimerPaused(false);
  };

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      stopListening();
      stopReading();
    };
  }, []);

  // Countdown timer interval
  useEffect(() => {
    if (!sessionData || isCompleted || isTimerPaused) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionData, isCompleted, isTimerPaused]);

  // Save answers to state and sessionStorage
  const handleAnswerChange = (text) => {
    if (!currentQ) return;
    const newAnswers = {
      ...answers,
      [currentQ.id]: text,
    };
    setAnswers(newAnswers);

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("interviewiq_session_answers", JSON.stringify(newAnswers));
      } catch (e) {
        console.error("Failed saving answer:", e);
      }
    }
  };

  // Read question prompt aloud via browser TTS
  const handleReadAloud = (force = false) => {
    if (!hasTTS || !currentQ?.text) return;

    if (isSpeaking && !force) {
      stopReading();
      return;
    }

    // Stop listening before speaking to avoid feedback loop
    if (isListeningRef.current) {
      stopListening();
    }

    stopReading();
    const utterance = new SpeechSynthesisUtterance(currentQ.text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (isListeningRef.current) {
        stopListening();
      }
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      // Hands-free voice: When AI finishes asking the question, automatically start microphone
      if (inputMode === "voice" && hasSTT && !isCompleted) {
        setTimeout(() => {
          if (!isListeningRef.current) {
            startListening();
          }
        }, 350);
      }
    };
    utterance.onerror = (e) => {
      if (e.error !== "canceled" && e.error !== "interrupted") {
        console.warn("TTS notice:", e?.error);
      }
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Automatically start asking question with AI voice when in Voice Mode (no button click needed)
  useEffect(() => {
    if (!isMounted || !sessionData || isCompleted || inputMode !== "voice" || !hasTTS) {
      return;
    }

    // Voice mode requires login: don't auto-speak if unauthenticated
    if (authStatus !== "loading" && !isAuthenticated) {
      return;
    }

    if (!currentQ?.text || !currentQ?.id) return;

    // Avoid duplicate speaking of the same question unless question index changes
    if (lastSpokenQuestionIdRef.current === currentQ.id) return;
    lastSpokenQuestionIdRef.current = currentQ.id;

    stopListening();
    stopReading();

    const autoVoiceTimer = setTimeout(() => {
      handleReadAloud(true);
    }, 400);

    return () => {
      clearTimeout(autoVoiceTimer);
      stopReading();
    };
  }, [
    currentIndex,
    currentQ?.id,
    currentQ?.text,
    inputMode,
    isMounted,
    sessionData,
    isCompleted,
    hasTTS,
    hasSTT,
    authStatus,
    isAuthenticated,
  ]);

  // Start voice dictation via Web Speech API
  const startListening = () => {
    if (typeof window === "undefined") return;

    if (!hasSTT) {
      setVoiceError({
        type: "unsupported",
        title: "Speech Recognition Unavailable",
        message:
          "Speech recognition is not supported in this browser (common in Firefox). Please use Typed Mode or switch to a Chromium-based browser (Chrome, Edge, Brave) or Safari.",
        retryable: false,
      });
      return;
    }

    // Stop TTS if currently reading prompt
    if (isSpeaking) {
      stopReading();
    }

    // Prevent duplicate recognition sessions
    if (isListeningRef.current || recognitionRef.current) {
      return;
    }

    setVoiceError(null);
    setInterimTranscript("");

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event) => {
        let finalChunk = "";
        let interimChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalChunk += item[0].transcript;
          } else {
            interimChunk += item[0].transcript;
          }
        }

        if (finalChunk.trim()) {
          setAnswers((prevAnswers) => {
            const current = prevAnswers[currentQ.id] || "";
            const merged = appendSpeechTranscript(current, finalChunk);

            if (typeof window !== "undefined") {
              try {
                sessionStorage.setItem(
                  "interviewiq_session_answers",
                  JSON.stringify({ ...prevAnswers, [currentQ.id]: merged })
                );
              } catch (e) {
                console.error("Autosave error:", e);
              }
            }
            return { ...prevAnswers, [currentQ.id]: merged };
          });
        }

        setInterimTranscript(interimChunk);
      };

      recognition.onerror = (event) => {
        if (event.error === "aborted") return;

        const mapped = mapSpeechRecognitionError(event.error);
        setVoiceError(mapped);
        isListeningRef.current = false;
        setIsListening(false);
        setInterimTranscript("");
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition startup error:", err);
      setVoiceError({
        type: "init-failed",
        title: "Microphone Initialization Failed",
        message: err?.message || "Could not start speech recognition. Please retry or use Typed Mode.",
        retryable: true,
      });
      isListeningRef.current = false;
      setIsListening(false);
    }
  };

  // Clear answer field with confirmation safety
  const handleClearAnswer = () => {
    handleAnswerChange("");
    setInterimTranscript("");
    setVoiceError(null);
  };

  const answeredCount = questions.filter(
    (q) => answers[q.id] && answers[q.id].trim().length > 0
  ).length;

  const meaningfulAnsweredCount = questions.filter(
    (q) => answers[q.id] && answers[q.id].trim().length >= 5
  ).length;

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const handleCopyTranscript = () => {
    if (!sessionData) return;
    let text = `InterviewIQ Mock Interview Transcript\n`;
    text += `Role: ${sessionData.settings.role} (${sessionData.settings.experience})\n`;
    text += `Format: ${sessionData.settings.type} | Difficulty: ${sessionData.settings.difficulty}\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n\n`;

    questions.forEach((q, idx) => {
      text += `Question ${idx + 1} [${q.category}]:\n${q.text}\n\n`;
      text += `Candidate Answer:\n${answers[q.id]?.trim() || "[No answer provided]"}\n\n`;
      text += `--------------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(text);
    setTranscriptCopied(true);
    setTimeout(() => setTranscriptCopied(false), 2000);
  };

  // Step 4: AI Evaluation API Invocation
  const handleGenerateEvaluation = async () => {
    if (isEvaluating || !sessionData) return;

    if (meaningfulAnsweredCount === 0) {
      setEvalError({
        message: "At least one question must have a meaningful answer (minimum 5 characters) to generate an AI evaluation.",
        details: "Please provide a complete answer for at least one question before requesting feedback.",
      });
      return;
    }

    setIsEvaluating(true);
    setEvalError(null);

    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: sessionData.settings,
          questions: sessionData.questions,
          answers: answers,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setEvalError({
          message: data.error || "Our evaluation servers are currently experiencing heavy traffic and high demand. Please try again after some time.",
          heavyTraffic: true,
        });
        setIsEvaluating(false);
        return;
      }

      setEvaluation(data);
      setCompletionViewMode("report");

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("interviewiq_session_evaluation", JSON.stringify(data));
        } catch (e) {
          console.error("Failed saving evaluation to sessionStorage:", e);
        }
      }
    } catch (err) {
      setEvalError({
        message: "Our evaluation servers are currently experiencing heavy traffic and high demand. Please try again after some time.",
        heavyTraffic: true,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // If loading or mounting
  if (!isMounted) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="mt-4 text-xs text-slate-400">Loading interview session...</p>
      </div>
    );
  }

  // Empty State: No active session found
  if (!sessionData || !questions.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 sm:p-12 backdrop-blur-xl shadow-2xl shadow-indigo-950/40">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">No Active Session Found</h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            You do not have an active interview session in progress, or your previous session has ended.
            Configure a new session to get customized questions tailored to your target role.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/mock-interview"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition-all"
            >
              <span>Configure New Mock Interview</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // COMPLETED INTERVIEW FLOW
  if (isCompleted) {
    // 1. Report View Mode (When evaluation data is available and active)
    if (completionViewMode === "report" && evaluation) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Persistence Action Banner */}
          <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 shadow-xs dark:border-indigo-500/30 dark:bg-slate-900/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 dark:shadow-lg dark:shadow-indigo-950/20">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Interview History & Persistence</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {savedInterviewId
                    ? "This evaluation report is securely saved to your MongoDB Atlas dashboard."
                    : authSession?.user
                    ? "Save this evaluation report to your dashboard to review anytime."
                    : "Sign in to save this evaluation report to your personal dashboard."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {savedInterviewId ? (
                <Link
                  href={`/dashboard/interviews/${savedInterviewId}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40 transition-colors"
                >
                  <BookmarkCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>View in Dashboard</span>
                </Link>
              ) : authSession?.user ? (
                <button
                  type="button"
                  onClick={handleSaveInterview}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving to Atlas...</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>Save to History</span>
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60 dark:hover:text-white transition-colors"
                >
                  <span>Sign In to Save</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>

          {saveError && (
            <div className="mb-6 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-500/40 dark:bg-rose-950/30 dark:text-rose-300 flex items-center justify-between">
              <span>{saveError}</span>
              <button
                type="button"
                onClick={handleSaveInterview}
                className="underline hover:text-rose-950 dark:hover:text-white font-semibold ml-2"
              >
                Retry
              </button>
            </div>
          )}

          <EvaluationReportView
            evaluation={evaluation}
            sessionSettings={sessionData.settings}
            onViewTranscript={() => setCompletionViewMode("transcript")}
          />
        </div>
      );
    }

    // 2. Choice or Transcript Mode
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm dark:border-emerald-500/30 dark:bg-slate-900/80 backdrop-blur-xl dark:shadow-2xl dark:shadow-emerald-950/20">
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                  Interview Session Complete
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Your interview session has concluded. Choose how you would like to proceed.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {evaluation && completionViewMode === "transcript" && (
                <button
                  type="button"
                  onClick={() => setCompletionViewMode("report")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:text-white transition-colors"
                >
                  <Award className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>View AI Report</span>
                </button>
              )}

              {savedInterviewId ? (
                <Link
                  href={`/dashboard/interviews/${savedInterviewId}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40 transition-colors"
                >
                  <BookmarkCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Saved to Dashboard</span>
                </Link>
              ) : authSession?.user ? (
                <button
                  type="button"
                  onClick={handleSaveInterview}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60 dark:hover:text-white transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Save to History</span>
                    </>
                  )}
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleCopyTranscript}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white shadow-2xs transition-colors"
              >
                {transcriptCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Copy Transcript</span>
                  </>
                )}
              </button>
              <Link
                href="/mock-interview"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/30"
              >
                <span>Start Another</span>
                <RotateCcw className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-950/70 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-500 font-bold">
                Answered
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {answeredCount} / {totalQuestions}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-950/70 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-500 font-bold">
                Role
              </div>
              <div className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mt-1 truncate">
                {sessionData.settings.role}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-950/70 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-500 font-bold">
                Format
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {sessionData.settings.type}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-950/70 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-500 font-bold">
                Difficulty
              </div>
              <div className="text-sm font-bold text-violet-700 dark:text-violet-300 mt-1">
                {sessionData.settings.difficulty}
              </div>
            </div>
          </div>

          {/* EVALUATION ACTION CARD / HUB */}
          <div className="mb-8 rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/80 p-6 sm:p-8 relative overflow-hidden shadow-xs dark:border-indigo-500/40 dark:bg-gradient-to-br dark:from-indigo-950/40 dark:via-slate-950/70 dark:to-slate-900/60 dark:shadow-xl dark:shadow-indigo-950/30">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-600/30 dark:text-indigo-400 dark:border-indigo-500/30">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  AI Answer Evaluation & Personalized Feedback
                </h2>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20">
                AI Evaluation Engine
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Get an objective assessment of your answers based on real-world hiring rubrics.
              Receive an overall competency score (0–100), STAR breakdown for behavioral answers,
              technical depth analysis, and illustrative model answers for comparison.
            </p>

            {/* Privacy & Transparency Notice */}
            <div className="mb-6 rounded-xl bg-white/80 p-3.5 border border-slate-200 text-xs text-slate-600 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-slate-900 dark:text-slate-300 font-semibold">Privacy & Data Handling: </strong>
                Submitting your answers to the AI evaluation engine is required to generate this evaluation.
                Evaluation occurs on-demand. When saved, interview transcripts and rubrics are persisted to your MongoDB Atlas history and remain accessible until explicitly deleted from your personal dashboard.
              </p>
            </div>

            {/* Error Message if Evaluation Failed */}
            {evalError && (
              <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-50/90 dark:bg-amber-950/30 p-4 text-xs text-amber-950 dark:text-amber-200 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>High Traffic Demand</span>
                </div>
                <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                  {evalError.message || "Our evaluation servers are currently experiencing heavy traffic and high demand. Please try again after some time."}
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleGenerateEvaluation}
                    disabled={isEvaluating}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Retry AI Evaluation</span>
                  </button>
                </div>
              </div>
            )}

            {/* Zero meaningful answers notice */}
            {meaningfulAnsweredCount === 0 && (
              <div className="mb-6 rounded-xl bg-amber-950/30 p-3.5 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-300">No Answers Provided</p>
                  <p className="mt-0.5 leading-relaxed text-slate-300">
                    You have not submitted any answers with meaningful content (minimum 5 characters).
                    To generate an AI evaluation, return to the interview and attempt at least one question.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {evaluation ? (
                <button
                  type="button"
                  onClick={() => setCompletionViewMode("report")}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95"
                >
                  <Award className="h-4 w-4" />
                  <span>View Existing Evaluation Report ({evaluation.overallScore}/100)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateEvaluation}
                  disabled={isEvaluating || meaningfulAnsweredCount === 0}
                  className="btn-shimmer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Evaluating Answers with AI Intelligence...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-indigo-200" />
                      <span>Generate AI Evaluation & Feedback</span>
                    </>
                  )}
                </button>
              )}

              {completionViewMode !== "transcript" ? (
                <button
                  type="button"
                  onClick={() => setCompletionViewMode("transcript")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white shadow-2xs transition-colors"
                >
                  <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span>Review Raw Transcript Only</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCompletionViewMode("choice")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white shadow-2xs transition-colors"
                >
                  <span>Return to Completion Hub</span>
                </button>
              )}

              {meaningfulAnsweredCount === 0 && (
                <button
                  type="button"
                  onClick={() => setIsCompleted(false)}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-5 py-3 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Return to Interview to Answer</span>
                </button>
              )}
            </div>

            {/* Evaluation Loading State Indicator */}
            {isEvaluating && (
              <div className="mt-5 rounded-2xl bg-indigo-50 border border-indigo-200 p-4 text-xs text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-500/20 dark:text-indigo-200 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Analyzing Your Submissions...</p>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                    Assessing technical accuracy, clarity, depth, and STAR behavioral structure against professional benchmarks.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Transcript Log (Rendered when transcript mode is chosen or viewed) */}
          {completionViewMode === "transcript" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Session Question & Answer Log</span>
                </h2>
                <span className="text-xs text-slate-600 dark:text-slate-500 font-medium">
                  {questions.length} Questions Recorded
                </span>
              </div>

              {questions.map((q, index) => {
                const answerText = answers[q.id]?.trim();
                return (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-slate-200 bg-white shadow-2xs p-5 sm:p-6 dark:border-slate-800/90 dark:bg-slate-950/80"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-[11px] font-bold text-indigo-700 border border-indigo-200 dark:bg-indigo-600/30 dark:text-indigo-300 dark:border-indigo-500/30">
                          Q{index + 1}
                        </span>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                          {q.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Expected ~{q.expectedDurationSeconds}s
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed mb-4">
                      {q.text}
                    </p>

                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-900/90 dark:border-slate-800 text-xs">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <CornerDownRight className="h-3 w-3 text-slate-500" />
                        <span>Your Response:</span>
                      </div>

                      {answerText ? (
                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                          {answerText}
                        </p>
                      ) : (
                        <p className="text-amber-600 dark:text-amber-400/80 italic">
                          [No answer provided for this question]
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              ← Return to Dashboard
            </Link>

            <div className="flex items-center gap-3">
              {evaluation && (
                <button
                  type="button"
                  onClick={() => setCompletionViewMode("report")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:text-white transition-colors"
                >
                  <Award className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>View Evaluation Report</span>
                </button>
              )}
              <Link
                href="/mock-interview"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition-all"
              >
                <span>Configure Another Interview</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE INTERVIEW SESSION
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/mock-interview"
            onClick={() => {
              stopListening();
              stopReading();
            }}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
            title="Leave Session"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {sessionData.settings.role}
              </span>
              <span className="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold">
                {sessionData.settings.difficulty}
              </span>
              <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 px-2 py-0.5 text-[10px] font-medium">
                {inputMode === "voice" ? "Voice Mode" : "Typed Mode"}
              </span>
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span>{sessionData.settings.type} Session • {answeredCount} of {totalQuestions} answered</span>
              {sessionData.settings.topics && (
                <span className="rounded-md bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-500/30 dark:text-indigo-300 max-w-[220px] truncate" title={sessionData.settings.topics}>
                  Focus: {sessionData.settings.topics}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Timer Control Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 border font-mono text-xs transition-colors ${
              timerSeconds <= 20
                ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300"
                : "border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-sm">{formatTime(timerSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsTimerPaused(!isTimerPaused)}
            aria-label={isTimerPaused ? "Resume timer" : "Pause timer"}
            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 p-2 text-slate-700 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white shadow-2xs transition-colors"
          >
            {isTimerPaused ? (
              <Play className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Pause className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              stopListening();
              stopReading();
              setIsFinishModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-rose-950/60 dark:hover:border-rose-500/50 dark:hover:text-rose-200 shadow-2xs transition-colors ml-2"
          >
            <Flag className="h-3 w-3 text-rose-600 dark:text-rose-400" />
            <span>Finish</span>
          </button>
        </div>
      </div>

      {/* Question Progress Indicator Pills */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
          <span>
            Question <strong className="text-slate-900 dark:text-white font-bold">{currentIndex + 1}</strong> of {totalQuestions}
          </span>
          <span className="font-medium">{Math.round(((currentIndex + 1) / totalQuestions) * 100)}% Progress</span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question Pill Jumper */}
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, idx) => {
            const hasAnswer = answers[q.id]?.trim()?.length > 0;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => goToQuestion(idx)}
                className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold border transition-all ${
                  isCurrent
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : hasAnswer
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:text-emerald-300 hover:dark:bg-emerald-900/40"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 shadow-2xs dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-white"
                }`}
              >
                <span>{idx + 1}</span>
                {hasAnswer && !isCurrent && (
                  <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question & Answer Panel */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 backdrop-blur-xl dark:shadow-2xl dark:shadow-indigo-950/40">
        {/* Question Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 px-2.5 py-1 text-xs font-bold">
              {currentQ.category}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              Target: ~{currentQ.expectedDurationSeconds}s
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live AI Voice Speaking Animation Indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-500/30 dark:text-indigo-300 animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-400" />
                </span>
                <span>AI Voice Speaking...</span>
              </div>
            )}

            {/* Read Question Aloud TTS Button (Replay / Pause) */}
            {hasTTS && (
              <button
                type="button"
                onClick={() => handleReadAloud(false)}
                aria-label={isSpeaking ? "Pause AI voice" : "Replay question prompt"}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all ${
                  isSpeaking
                    ? "border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-500/50 dark:bg-amber-950/50 dark:text-amber-300 animate-pulse"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Pause AI Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Replay Voice</span>
                  </>
                )}
              </button>
            )}

            {isTimerPaused && (
              <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold animate-pulse">
                Timer Paused
              </span>
            )}
          </div>
        </div>

        {/* Question Prompt */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.text}
          </h2>
        </div>

        {/* Input Mode Switcher Tabs */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div
            className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 dark:bg-slate-950 dark:border-slate-800"
            role="tablist"
            aria-label="Answer input mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={inputMode === "typed"}
              onClick={() => {
                stopListening();
                stopReading();
                setInputMode("typed");
                setShowVoiceSessionAuthNotice(false);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                inputMode === "typed"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Keyboard className="h-3.5 w-3.5" />
              <span>Typed Mode</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={inputMode === "voice"}
              onClick={() => {
                if (authStatus !== "loading" && !isAuthenticated) {
                  setShowVoiceSessionAuthNotice(true);
                  return;
                }
                stopReading();
                lastSpokenQuestionIdRef.current = null;
                setInputMode("voice");
                setShowVoiceSessionAuthNotice(false);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                inputMode === "voice"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Voice Mode</span>
              {!isAuthenticated && authStatus !== "loading" && (
                <Lock className="h-2.5 w-2.5 text-amber-500 ml-0.5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {inputMode === "voice" && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold">
                Hands-Free AI Voice Active
              </span>
            )}
            {isListening && (
              <span className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold animate-pulse">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>Recording</span>
              </span>
            )}
            <span className="text-xs text-slate-600 dark:text-slate-500 font-mono">
              {currentAnswer.length} characters (Autosaved)
            </span>
          </div>
        </div>

        {/* VOICE MODE AUTHENTICATION GATE (Shown if unauthenticated in Voice Mode) */}
        {((inputMode === "voice" && !isAuthenticated && authStatus !== "loading") || showVoiceSessionAuthNotice) && (
          <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200 shadow-sm transition-all">
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
                    Hands-free voice questions and real-time speech transcription require an authenticated account. Please log in to unlock AI voice, or switch to Typed Mode.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Link
                    href="/login?callbackUrl=/mock-interview/session"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Sign In to Unlock Voice Mode</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      stopListening();
                      stopReading();
                      setInputMode("typed");
                      setShowVoiceSessionAuthNotice(false);
                    }}
                    className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 transition-colors"
                  >
                    Switch to Typed Mode
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VOICE MODE CONTROLLER PANEL (Rendered when Voice Mode is selected) */}
        {inputMode === "voice" && isAuthenticated && (
          <div className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 sm:p-5 space-y-4 dark:border-indigo-500/30 dark:bg-slate-950/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-lg ${
                    isListening
                      ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-500/50 animate-pulse"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      <span>{currentAnswer.length > 0 ? "Resume Speaking" : "Start Speaking"}</span>
                    </>
                  )}
                </button>

                {currentAnswer.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAnswer}
                    disabled={isListening}
                    title="Clear current answer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-40 shadow-2xs transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                {isListening ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </span>
                    <span>Listening... Speak your answer now</span>
                  </div>
                ) : isSpeaking ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500" />
                    </span>
                    <span>AI is asking question with voice...</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-600 dark:text-slate-500 font-medium">
                    Hands-free voice active • Mic will activate when AI finishes speaking
                  </span>
                )}
              </div>
            </div>

            {/* Real-time Interim Speech Detection Bubble */}
            {isListening && interimTranscript && (
              <div className="rounded-xl bg-indigo-100/70 border border-indigo-300/80 p-3 text-xs text-indigo-950 dark:bg-indigo-950/50 dark:border-indigo-500/30 dark:text-indigo-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block mb-1">
                  Live Speech Preview:
                </span>
                <p className="italic font-sans leading-relaxed text-indigo-900 dark:text-indigo-100">
                  &ldquo;{interimTranscript}&rdquo;
                </p>
              </div>
            )}

            {/* Voice Error Banner */}
            {voiceError && (
              <div className="rounded-xl bg-rose-50 border border-rose-300 p-3.5 text-xs text-rose-900 dark:bg-rose-950/30 dark:border-rose-500/40 dark:text-rose-200">
                <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300 mb-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{voiceError.title}</span>
                </div>
                <p className="leading-relaxed text-slate-700 dark:text-slate-300">{voiceError.message}</p>
                {voiceError.retryable && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={startListening}
                      className="rounded-lg bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-[11px] font-bold text-white transition-colors"
                    >
                      Retry Microphone
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceError(null);
                        setInputMode("typed");
                      }}
                      className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                    >
                      Switch to Typed Mode
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Unsupported Browser Warning (e.g. Firefox) */}
            {!hasSTT && (
              <div className="rounded-xl bg-amber-50 border border-amber-300 p-3.5 text-xs text-amber-900 dark:bg-amber-950/30 dark:border-amber-500/40 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Speech Recognition Not Supported in this Browser</span>
                </div>
                <p className="leading-relaxed text-slate-700 dark:text-slate-300 mb-2.5">
                  Your current browser does not support the Web Speech API recognition interface (such as Mozilla Firefox).
                  You can use &ldquo;Read Aloud&rdquo; and type your answers below, or switch to Chrome, Edge, Brave, or Safari for voice input.
                </p>
                <button
                  type="button"
                  onClick={() => setInputMode("typed")}
                  className="rounded-lg bg-amber-600 hover:bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-white transition-colors"
                >
                  Use Typed Mode
                </button>
              </div>
            )}

            {/* Privacy and Transparency Disclosure */}
            <div className="rounded-xl bg-white/80 p-3 border border-slate-200 text-[11px] text-slate-600 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-slate-900 dark:text-slate-300 font-semibold">Voice Privacy Notice: </strong>
                Speech recognition is processed through your browser&apos;s Web Speech API and may use your device or browser vendor&apos;s speech service.
                Raw audio is never saved on our servers. Your transcribed answer remains in your browser until you choose to submit it.
              </p>
            </div>
          </div>
        )}

        {/* Text Answer Input Area (Always available and editable) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="interview-answer-input"
              className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>
                {inputMode === "voice" ? "Recognized Answer (Editable)" : "Your Answer"}
              </span>
            </label>
            <span className="text-[11px] text-slate-600 dark:text-slate-500 font-sans">
              {inputMode === "voice"
                ? "You can type or fix any spoken words directly in this box"
                : "Type your answer clearly with concrete examples"}
            </span>
          </div>

          <textarea
            id="interview-answer-input"
            rows={8}
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={
              inputMode === "voice"
                ? "Click 'Start Speaking' above to dictate your response, or type here directly. You can edit any transcribed text at any time..."
                : "Structure your thoughts clearly. For technical questions, describe edge cases, implementation trade-offs, and scalability. For behavioral questions, follow the STAR approach (Situation, Task, Action, Result)..."
            }
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-y transition-colors font-sans leading-relaxed dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder-slate-500"
          />

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-500">
            <span>
              Spoken answers are never submitted automatically. Review and edit before clicking Next.
            </span>
            <span>{currentAnswer.length} / 4000 max</span>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goToQuestion(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => goToQuestion(currentIndex + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95"
              >
                <span>Next Question</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  stopListening();
                  stopReading();
                  setIsFinishModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-95"
              >
                <span>Finish & Review</span>
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isFinishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsFinishModalOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl z-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 mb-4">
              <Flag className="h-6 w-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Finish Mock Interview?
            </h3>

            <p className="mt-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              You have answered <strong className="text-slate-900 dark:text-white font-bold">{answeredCount}</strong> out of{" "}
              <strong className="text-slate-900 dark:text-white font-bold">{totalQuestions}</strong> questions.
              {answeredCount < totalQuestions && (
                <span className="block mt-1 text-amber-700 dark:text-amber-300 font-medium">
                  {totalQuestions - answeredCount} skipped question(s) will be recorded as unattempted and excluded from your answered-question score.
                </span>
              )}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsFinishModalOpen(false)}
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-white shadow-2xs transition-colors"
              >
                Continue Answering
              </button>

              <button
                type="button"
                onClick={() => {
                  stopListening();
                  stopReading();
                  setIsFinishModalOpen(false);
                  setIsCompleted(true);
                  if (evaluation) {
                    setCompletionViewMode("report");
                  } else {
                    setCompletionViewMode("choice");
                  }
                }}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition-all"
              >
                Confirm & Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
