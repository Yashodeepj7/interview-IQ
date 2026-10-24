"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  BookOpen,
  CornerDownRight,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function EvaluationReportView({
  evaluation,
  sessionSettings,
  onViewTranscript,
}) {
  const [copied, setCopied] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState(() => {
    // Expand all answered questions by default
    const initial = {};
    evaluation?.questionEvaluations?.forEach((q) => {
      initial[q.questionId] = true;
    });
    return initial;
  });

  const toggleQuestion = (id) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyReport = () => {
    if (!evaluation) return;

    let text = `# InterviewIQ AI Evaluation Report\n`;
    text += `Role: ${sessionSettings?.role} (${sessionSettings?.experience})\n`;
    text += `Format: ${sessionSettings?.type} | Difficulty: ${sessionSettings?.difficulty}\n`;
    text += `Overall Competency Score: ${evaluation.overallScore}/100\n`;
    text += `Evaluation ID: ${evaluation.evaluationId}\n\n`;

    text += `## Scoring Explanation\n${evaluation.scoringExplanation}\n\n`;
    text += `## Executive Summary\n${evaluation.summary}\n\n`;

    text += `## Observed Strengths\n`;
    evaluation.strengths?.forEach((s) => {
      text += `- ${s}\n`;
    });
    text += `\n## Priority Areas for Growth\n`;
    evaluation.improvementAreas?.forEach((i) => {
      text += `- ${i}\n`;
    });

    text += `\n## Actionable Practice Recommendations\n`;
    evaluation.recommendations?.forEach((r) => {
      text += `- ${r}\n`;
    });

    text += `\n## Question-by-Question Analysis\n\n`;
    evaluation.questionEvaluations?.forEach((q, idx) => {
      text += `### Q${idx + 1}: ${q.questionText} [${q.category}]\n`;
      text += `Status: ${q.answered ? `Answered (Score: ${q.score}/100)` : "Skipped (Excluded from score)"}\n`;
      text += `Your Response: ${q.candidateAnswer || "[Skipped - No answer provided]"}\n`;
      text += `Feedback: ${q.feedback}\n`;
      if (q.strengths?.length) {
        text += `Strengths: ${q.strengths.join(", ")}\n`;
      }
      if (q.improvements?.length) {
        text += `Improvements: ${q.improvements.join(", ")}\n`;
      }
      if (q.starBreakdown) {
        text += `STAR Analysis:\n`;
        text += `  - Situation: ${q.starBreakdown.situation?.present ? "✓" : "✗"} ${q.starBreakdown.situation?.feedback || ""}\n`;
        text += `  - Task: ${q.starBreakdown.task?.present ? "✓" : "✗"} ${q.starBreakdown.task?.feedback || ""}\n`;
        text += `  - Action: ${q.starBreakdown.action?.present ? "✓" : "✗"} ${q.starBreakdown.action?.feedback || ""}\n`;
        text += `  - Result: ${q.starBreakdown.result?.present ? "✓" : "✗"} ${q.starBreakdown.result?.feedback || ""}\n`;
      }
      if (q.technicalRubric) {
        text += `Technical Rubric:\n`;
        text += `  - Correctness: ${q.technicalRubric.correctness?.score}/100 (${q.technicalRubric.correctness?.feedback || ""})\n`;
        text += `  - Depth: ${q.technicalRubric.depth?.score}/100 (${q.technicalRubric.depth?.feedback || ""})\n`;
        text += `  - Clarity: ${q.technicalRubric.clarity?.score}/100 (${q.technicalRubric.clarity?.feedback || ""})\n`;
      }
      text += `Suggested Model Answer:\n${q.suggestedAnswer}\n\n`;
      text += `--------------------------------------------------\n\n`;
    });

    text += `Disclaimer: ${evaluation.disclaimer}\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return "text-slate-500 dark:text-slate-400";
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 65) return "text-indigo-600 dark:text-indigo-400";
    return "text-amber-600 dark:text-amber-400";
  };

  const getScoreBadgeBg = (score) => {
    if (score === null || score === undefined) return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    if (score >= 80) return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30";
    if (score >= 65) return "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30";
    return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30";
  };

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs dark:border-indigo-500/30 dark:bg-slate-900/80 dark:shadow-2xl dark:shadow-indigo-950/40 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                Evaluation Complete
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {evaluation.evaluationId}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl tracking-tight">
              AI Answer Evaluation & Feedback Report
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Multi-dimensional competency assessment for {sessionSettings?.role} ({sessionSettings?.experience})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400">Report Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Copy Full Report</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onViewTranscript}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-indigo-300 dark:hover:text-white transition-colors"
            >
              <span>View Raw Transcript</span>
            </button>
          </div>
        </div>

        {/* Score & Key Metrics Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-2xl bg-slate-50 border border-slate-200 p-6 mb-8 dark:bg-slate-950/70 dark:border-slate-800">
          {/* Overall Score Meter */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold mb-2">
              Overall Competency Score
            </div>
            <div className={`text-5xl font-black tracking-tight ${getScoreColor(evaluation.overallScore)}`}>
              {evaluation.overallScore !== null ? evaluation.overallScore : "N/A"}
              <span className="text-2xl font-normal text-slate-400 dark:text-slate-600">/100</span>
            </div>
            <div className="mt-3">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${getScoreBadgeBg(evaluation.overallScore)}`}>
                {evaluation.overallScore >= 85
                  ? "Distinguished Candidate"
                  : evaluation.overallScore >= 70
                  ? "Interview Ready"
                  : "Practice Recommended"}
              </span>
            </div>
          </div>

          {/* Scoring Explanation & Completion Metrics */}
          <div className="md:col-span-8 space-y-3">
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80 dark:bg-slate-900/60 dark:border-slate-800/80">
              <strong className="text-indigo-700 dark:text-indigo-300">Scoring Methodology: </strong>
              {evaluation.scoringExplanation}
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="rounded-lg bg-white px-3 py-1.5 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                Total Questions: <strong className="text-slate-900 dark:text-white">{evaluation.metrics?.totalQuestions}</strong>
              </div>
              <div className="rounded-lg bg-white px-3 py-1.5 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                Answered: <strong className="text-emerald-600 dark:text-emerald-400">{evaluation.metrics?.answeredCount}</strong>
              </div>
              <div className="rounded-lg bg-white px-3 py-1.5 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                Skipped: <strong className="text-slate-600 dark:text-slate-400">{evaluation.metrics?.unansweredCount}</strong>
              </div>
              <div className="rounded-lg bg-white px-3 py-1.5 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                Difficulty: <strong className="text-indigo-700 dark:text-violet-300">{sessionSettings?.difficulty}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Executive Performance Summary</span>
          </h2>
          <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 text-sm text-slate-800 leading-relaxed font-sans dark:bg-slate-950/60 dark:border-slate-800 dark:text-slate-200">
            {evaluation.summary}
          </div>
        </div>

        {/* 2-Column: Strengths & Improvement Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <div className="rounded-2xl bg-emerald-50/50 p-5 border border-emerald-200/80 dark:bg-slate-950/60 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Observed Strengths</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {evaluation.strengths?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvement Areas */}
          <div className="rounded-2xl bg-amber-50/50 p-5 border border-amber-200/80 dark:bg-slate-950/60 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Priority Areas for Growth</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {evaluation.improvementAreas?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="mb-10 rounded-2xl bg-indigo-50/40 p-5 border border-indigo-200/80 dark:bg-slate-950/60 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-400 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Actionable Practice & Revision Recommendations</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            {evaluation.recommendations?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-600/30 dark:text-indigo-300 shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Question-by-Question Deep Dive */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Question-by-Question Rubric Evaluation</span>
            </h2>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {evaluation.questionEvaluations?.length} Questions Analyzed
            </span>
          </div>

          {evaluation.questionEvaluations?.map((qEval, index) => {
            const isExpanded = expandedQuestions[qEval.questionId];

            return (
              <div
                key={qEval.questionId}
                className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800/90 dark:bg-slate-950/80 overflow-hidden transition-all"
              >
                {/* Question Accordion Header */}
                <div
                  onClick={() => toggleQuestion(qEval.questionId)}
                  className="p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700 border border-indigo-200 dark:bg-indigo-600/20 dark:text-indigo-300 dark:border-indigo-500/30">
                      Q{index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {qEval.questionText}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                          {qEval.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {qEval.answered ? (
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold border ${getScoreBadgeBg(qEval.score)}`}>
                        Score: {qEval.score}/100
                      </span>
                    ) : (
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800">
                        Skipped • Excluded
                      </span>
                    )}

                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 pt-0 space-y-4 border-t border-slate-100 dark:border-slate-800/60">
                    {/* Candidate's Submitted Response */}
                    <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs dark:bg-slate-900/60 dark:border-slate-800">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <CornerDownRight className="h-3 w-3 text-slate-500" />
                        <span>Your Submitted Response:</span>
                      </div>
                      {qEval.answered && qEval.candidateAnswer ? (
                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                          {qEval.candidateAnswer}
                        </p>
                      ) : (
                        <p className="text-amber-600 dark:text-amber-400/90 italic">
                          [No answer provided — Question was skipped]
                        </p>
                      )}
                    </div>

                    {/* Evaluator Feedback */}
                    <div className="rounded-xl bg-indigo-50/70 p-4 border border-indigo-200/80 text-xs dark:bg-slate-900/90 dark:border-slate-800">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Evaluator Feedback</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {qEval.feedback}
                      </p>
                    </div>

                    {/* Specific Strengths & Improvements */}
                    {qEval.answered && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {qEval.strengths?.length > 0 && (
                          <div className="rounded-xl bg-emerald-50/70 p-3 border border-emerald-200 dark:bg-slate-900/50 dark:border-slate-800">
                            <span className="font-semibold text-emerald-800 dark:text-emerald-400 block mb-1.5">
                              Demonstrated Strengths:
                            </span>
                            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                              {qEval.strengths.map((s, idx) => (
                                <li key={idx}>• {s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {qEval.improvements?.length > 0 && (
                          <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200 dark:bg-slate-900/50 dark:border-slate-800">
                            <span className="font-semibold text-amber-800 dark:text-amber-400 block mb-1.5">
                              Areas to Polish:
                            </span>
                            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                              {qEval.improvements.map((imp, idx) => (
                                <li key={idx}>• {imp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Technical Rubric Breakdown (If Technical Question) */}
                    {qEval.technicalRubric && (
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                          Technical Dimension Breakdown
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          {/* Correctness */}
                          <div className="rounded-lg bg-white p-3 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-2xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-slate-800 dark:text-slate-300">Correctness</span>
                              <span className="font-bold text-indigo-600 dark:text-indigo-300">
                                {qEval.technicalRubric.correctness?.score}/100
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                              {qEval.technicalRubric.correctness?.feedback}
                            </p>
                          </div>

                          {/* Depth */}
                          <div className="rounded-lg bg-white p-3 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-2xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-slate-800 dark:text-slate-300">Technical Depth</span>
                              <span className="font-bold text-indigo-600 dark:text-indigo-300">
                                {qEval.technicalRubric.depth?.score}/100
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                              {qEval.technicalRubric.depth?.feedback}
                            </p>
                          </div>

                          {/* Clarity */}
                          <div className="rounded-lg bg-white p-3 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-2xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-slate-800 dark:text-slate-300">Clarity & Pacing</span>
                              <span className="font-bold text-indigo-600 dark:text-indigo-300">
                                {qEval.technicalRubric.clarity?.score}/100
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                              {qEval.technicalRubric.clarity?.feedback}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STAR Framework Breakdown (If Behavioral Question) */}
                    {qEval.starBreakdown && (
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                          <span>STAR Behavioral Structure Analysis</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                          {/* Situation */}
                          <div className="rounded-lg bg-white p-3 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-2xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-800 dark:text-slate-200">Situation</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                qEval.starBreakdown.situation?.present
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
                              }`}>
                                {qEval.starBreakdown.situation?.present ? "✓ Present" : "✗ Missing"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                              {qEval.starBreakdown.situation?.feedback}
                            </p>
                          </div>

                          {/* Task */}
                          <div className="rounded-lg bg-white p-3 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-2xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-800 dark:text-slate-200">Task</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                qEval.starBreakdown.task?.present
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
                              }`}>
                                {qEval.starBreakdown.task?.present ? "✓ Present" : "✗ Missing"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                              {qEval.starBreakdown.task?.feedback}
                            </p>
                          </div>

                          {/* Action */}
                          <div className="rounded-lg bg-white p-3 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-2xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-800 dark:text-slate-200">Action</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                qEval.starBreakdown.action?.present
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
                              }`}>
                                {qEval.starBreakdown.action?.present ? "✓ Present" : "✗ Missing"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                              {qEval.starBreakdown.action?.feedback}
                            </p>
                          </div>

                          {/* Result */}
                          <div className="rounded-lg bg-white p-3 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-2xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-800 dark:text-slate-200">Result</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                qEval.starBreakdown.result?.present
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
                              }`}>
                                {qEval.starBreakdown.result?.present ? "✓ Present" : "✗ Missing"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                              {qEval.starBreakdown.result?.feedback}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Suggested Model Answer */}
                    <div className="rounded-xl bg-indigo-50/60 p-4 border border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/40 text-xs">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Illustrative Model Answer (Benchmark Example)</span>
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                          For Educational Review Only
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans mt-2">
                        {qEval.suggestedAnswer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legal & Educational Disclaimer */}
        <div className="mt-8 rounded-xl bg-slate-100 p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {evaluation.disclaimer}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onViewTranscript}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            ← View Raw Question Transcript
          </button>

          <div className="flex items-center gap-3">
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
