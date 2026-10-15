"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  X,
  ShieldCheck,
  Briefcase,
  Layers,
  Award,
  TrendingUp,
  FileCheck2,
  Copy,
  Check,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFiles = e.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      validateAndSelectFile(droppedFiles[0]);
    }
  };

  const handleFileInputChange = (e) => {
    setError(null);
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      validateAndSelectFile(selectedFiles[0]);
    }
  };

  const validateAndSelectFile = (candidateFile) => {
    if (!candidateFile.name.toLowerCase().endsWith(".pdf")) {
      setError({
        title: "Unsupported File Format",
        message: "Please upload a valid PDF (.pdf) file. Other document formats (e.g., DOCX, TXT, images) are not supported.",
      });
      return;
    }

    if (candidateFile.size > MAX_FILE_SIZE_BYTES) {
      setError({
        title: "File Exceeds 5 MB Limit",
        message: `Your file size is ${formatFileSize(candidateFile.size)}. Please upload a resume under 5 MB.`,
      });
      return;
    }

    if (candidateFile.size === 0) {
      setError({
        title: "Empty File",
        message: "The selected file is empty (0 bytes). Please select a valid PDF file.",
      });
      return;
    }

    setFile(candidateFile);
    setError(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError({
        title: "No File Selected",
        message: "Please select or drop a PDF resume file to analyze.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep("Reading PDF document in memory...");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      setLoadingStep("Extracting readable resume text & validating structure...");

      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw {
          status: response.status,
          code: data.code,
          message: data.error || "Failed to analyze resume.",
        };
      }

      setResult(data.data);
    } catch (err) {
      const isScanned =
        err.code === "NO_EXTRACTABLE_TEXT" ||
        (err.message && err.message.toLowerCase().includes("scanned"));

      const isQuota =
        err.status === 429 ||
        err.code === "RATE_LIMITED" ||
        (err.message && err.message.toLowerCase().includes("quota"));

      const isServiceBusy =
        err.status === 503 ||
        err.code === "SERVICE_UNAVAILABLE" ||
        (err.message && err.message.toLowerCase().includes("high demand"));

      const isSetup =
        err.status === 503 &&
        (err.message && err.message.toLowerCase().includes("configured"));

      setError({
        title: isScanned
          ? "Scanned / Image-Only Resume Detected"
          : isQuota
          ? "API Rate Limit Exceeded"
          : isServiceBusy
          ? "AI Service Busy"
          : isSetup
          ? "API Configuration Required"
          : "Analysis Failed",
        message: err.message || "An unexpected error occurred while communicating with the AI service.",
      });
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-indigo-400" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span>Step 3 • AI Resume Intelligence</span>
            </span>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            AI Resume Analyzer
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Upload your PDF resume to receive evidence-based competency categorization, executive profile summary, and quantifiable bullet rewrites powered by Gemini.
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-8 max-w-3xl mx-auto rounded-2xl border border-rose-500/30 bg-rose-950/40 p-5 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-rose-200">{error.title}</h3>
                <p className="mt-1 text-xs text-rose-300/90 leading-relaxed">{error.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-white transition-colors p-1"
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {!result ? (
          /* UPLOAD & CONTROLS SECTION */
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Upload Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 backdrop-blur-xl ${
                isDragging
                  ? "border-indigo-400 bg-indigo-950/40 shadow-2xl shadow-indigo-500/20 scale-[1.01]"
                  : "border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 hover:bg-slate-900/80"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="resume-file-input"
                accept=".pdf,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {!file ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-inner">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Drag and drop your PDF resume here
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 max-w-sm">
                    Accepted format: <strong className="text-slate-200">PDF only</strong> • Maximum file size: <strong className="text-slate-200">5 MB</strong>
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      id="browse-files-btn"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Browse Files</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
                    <FileCheck2 className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Resume Loaded
                  </span>
                  <h3 className="mt-1 text-base font-bold text-white break-all max-w-md">
                    {file.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatFileSize(file.size)}
                  </p>

                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="button"
                      id="replace-file-btn"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-4 py-2 text-xs font-medium text-slate-200 transition-colors"
                    >
                      Replace File
                    </button>
                    <button
                      type="button"
                      id="remove-file-btn"
                      onClick={handleRemoveFile}
                      className="rounded-xl border border-rose-500/30 bg-rose-950/30 hover:bg-rose-900/40 px-4 py-2 text-xs font-medium text-rose-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy Notice Banner */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Privacy & In-Memory Processing: </span>
                Your resume text is extracted in memory and sent securely to Google Gemini for one-time analysis. Uploaded files are <strong className="text-slate-300">never saved to disk or persistent databases</strong> by this prototype. Please avoid uploading sensitive identification (e.g. SSN or passport details) you do not wish to share with AI providers.
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                id="analyze-resume-btn"
                disabled={!file || isLoading}
                onClick={handleAnalyze}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold shadow-xl transition-all ${
                  !file || isLoading
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-indigo-300" />
                    <span>{loadingStep || "Analyzing Resume..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-indigo-300" />
                    <span>Analyze Resume with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* RESULTS SECTION */
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Results Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Analysis Completed
                  </span>
                </div>
                <h2 className="mt-1 text-2xl font-extrabold text-white">
                  Resume Intelligence Report
                </h2>
                {result.documentMetadata?.filename && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Analyzed document: <span className="text-slate-200 font-mono">{result.documentMetadata.filename}</span>
                    {result.documentMetadata.pageCount && ` • ${result.documentMetadata.pageCount} page(s)`}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  id="analyze-another-btn"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Analyze Another Resume</span>
                </button>
                <Link
                  href="/job-matcher"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all"
                >
                  <span>Compare with Job Description</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Profile Summary Card */}
            <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-6 backdrop-blur-md shadow-lg shadow-indigo-950/20">
              <div className="flex items-center gap-2.5 mb-3">
                <Briefcase className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Executive Candidate Summary
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                {result.summary}
              </p>
            </div>

            {/* Categorized Skills Grid */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
              <div className="flex items-center gap-2.5 mb-6">
                <Layers className="h-5 w-5 text-violet-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Demonstrated Competencies by Category
                  </h3>
                  <p className="text-xs text-slate-400">
                    Grouped by technical domain with verified evidence from supplied resume
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {result.skills?.map((categoryGroup, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3">
                        {categoryGroup.category}
                      </h4>
                      <div className="space-y-2">
                        {categoryGroup.items?.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="rounded-lg bg-slate-900/80 p-2 border border-slate-800/80 text-xs"
                          >
                            <span className="font-semibold text-white">
                              {item.name}
                            </span>
                            {item.evidence && (
                              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                                {item.evidence}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Highlights & Project Highlights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Experience Highlights */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">
                    Demonstrated Experience & Impact
                  </h3>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 leading-relaxed flex-1">
                  {result.experienceHighlights?.map((exp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Project Highlights */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-violet-400" />
                  <h3 className="text-base font-bold text-white">
                    Key Projects & Technical Initiatives
                  </h3>
                </div>
                <div className="space-y-4 flex-1">
                  {result.projectHighlights?.map((proj, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 text-xs"
                    >
                      <h4 className="font-bold text-white text-sm">
                        {proj.title}
                      </h4>
                      <p className="text-slate-300 mt-1 leading-relaxed">
                        {proj.description}
                      </p>
                      {proj.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {proj.technologies.map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              className="rounded-md bg-indigo-950/70 border border-indigo-800/60 px-2 py-0.5 text-[10px] font-mono text-indigo-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths & Improvements Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                  <h3 className="text-base font-bold text-white">
                    Evidence-Based Strengths
                  </h3>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {result.strengths?.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practical Improvements */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4 text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="text-base font-bold text-white">
                    High-Priority Improvement Areas
                  </h3>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {result.improvements?.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bullet Point Suggestions */}
            {result.bulletSuggestions?.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Clearer, Stronger Bullet-Point Rewrites
                    </h3>
                    <p className="text-xs text-slate-400">
                      Suggested rewrites based strictly on your demonstrated experience, structured with strong action verbs and quantified impact.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {result.bulletSuggestions.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-indigo-500/30"
                    >
                      {bullet.original && (
                        <div className="mb-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Current demonstrated responsibility
                          </span>
                          <p className="text-xs text-slate-400 italic mt-0.5">
                            &ldquo;{bullet.original}&rdquo;
                          </p>
                        </div>
                      )}

                      <div className="rounded-lg bg-indigo-950/30 border border-indigo-500/20 p-3 mt-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                              Suggested Action Rewrite
                            </span>
                            <p className="text-xs font-medium text-white mt-1 leading-relaxed">
                              {bullet.suggested}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bullet.suggested, idx)}
                            className="p-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-800 text-indigo-300 hover:text-white transition-colors shrink-0"
                            title="Copy rewrite to clipboard"
                          >
                            {copiedIndex === idx ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {bullet.rationale && (
                        <p className="text-[11px] text-slate-400 mt-2">
                          <span className="font-semibold text-slate-300">Rationale: </span>
                          {bullet.rationale}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-5 py-2.5 text-xs font-semibold text-white transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Upload Another Resume</span>
              </button>

              <Link
                href="/job-matcher"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <span>Continue to Job Description Matcher</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
