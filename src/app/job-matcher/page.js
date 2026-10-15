"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Target,
  UploadCloud,
  FileCheck2,
  FileText,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  X,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  FileSearch,
  Copy,
  Check,
  Info,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_JD_CHARACTERS = 15000;
const MIN_JD_CHARACTERS = 30;

const SAMPLE_JOB_DESCRIPTION = `Senior Full Stack Engineer (Next.js & Cloud)

About the Role:
We are seeking an experienced Full Stack Engineer to build responsive, accessible web applications and high-throughput APIs. You will collaborate closely with product and design teams to deliver performant features from conception to production.

Key Responsibilities:
- Architect and develop modern user interfaces using Next.js (App Router), React, and Tailwind CSS.
- Design scalable backend microservices, RESTful endpoints, and database schemas with MongoDB / PostgreSQL.
- Integrate cloud AI services and LLM APIs for automated workflow enhancements.
- Implement robust CI/CD pipelines, automated testing (Jest, Playwright), and security best practices.
- Mentor junior engineers and champion clean code standards and comprehensive documentation.

Requirements:
- 4+ years of professional full stack software development experience.
- Deep expertise in JavaScript / TypeScript, Node.js, and modern React architectures.
- Demonstrated hands-on experience with MongoDB or relational databases.
- Familiarity with cloud platforms (AWS, GCP) and containerization with Docker.
- Strong problem-solving aptitude, communication skills, and agile team collaboration.`;

export default function JobMatcherPage() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
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
        message: "Please upload a valid PDF (.pdf) resume. Other document formats are not supported.",
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLoadSampleJD = () => {
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setError(null);
  };

  const handleClearJD = () => {
    setJobDescription("");
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError({
        title: "Resume Required",
        message: "Please upload your PDF resume to compare against the job description.",
      });
      return;
    }

    const trimmedJD = jobDescription.trim();
    if (trimmedJD.length < MIN_JD_CHARACTERS) {
      setError({
        title: "Job Description Too Short",
        message: `Please paste a job description with at least ${MIN_JD_CHARACTERS} characters (received ${trimmedJD.length}).`,
      });
      return;
    }

    if (trimmedJD.length > MAX_JD_CHARACTERS) {
      setError({
        title: "Job Description Too Long",
        message: `Job description exceeds ${MAX_JD_CHARACTERS.toLocaleString()} characters (current: ${trimmedJD.length.toLocaleString()}). Please remove excess copy.`,
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep("Extracting text from resume in memory...");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", trimmedJD);

      setLoadingStep("Evaluating qualifications against target job requirements...");

      const response = await fetch("/api/job-match", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw {
          status: response.status,
          code: data.code,
          message: data.error || "Failed to compare resume and job description.",
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
          : "Match Comparison Failed",
        message: err.message || "An unexpected error occurred during match analysis.",
      });
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
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

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/40 bg-emerald-950/30";
    if (score >= 60) return "text-indigo-400 border-indigo-500/40 bg-indigo-950/30";
    if (score >= 40) return "text-amber-400 border-amber-500/40 bg-amber-950/30";
    return "text-rose-400 border-rose-500/40 bg-rose-950/30";
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
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Target className="h-3 w-3 text-emerald-400" />
              <span>Step 3 • Target Role Alignment</span>
            </span>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Job Description Matcher
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Compare your resume directly against any target role to identify key matching qualifications, missing competency gaps, and truthful interview talking points.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-8 max-w-4xl mx-auto rounded-2xl border border-rose-500/30 bg-rose-950/40 p-5 backdrop-blur-md">
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
          /* COMPARISON INPUT SECTION */
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: PDF Resume Upload */}
              <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      1. Upload Resume (PDF)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Max 5 MB</span>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                    isDragging
                      ? "border-indigo-400 bg-indigo-950/40"
                      : "border-slate-800 bg-slate-950/40 hover:border-indigo-500/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="job-matcher-file-input"
                    accept=".pdf,application/pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {!file ? (
                    <div className="flex flex-col items-center py-6">
                      <UploadCloud className="h-10 w-10 text-indigo-400 mb-3" />
                      <p className="text-xs font-semibold text-white">
                        Drag and drop your PDF resume here
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        PDF only, up to 5 MB
                      </p>
                      <button
                        type="button"
                        id="matcher-browse-btn"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/30"
                      >
                        Browse PDF
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                        <FileCheck2 className="h-6 w-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                        Resume Loaded
                      </span>
                      <h4 className="mt-1 text-xs font-bold text-white break-all max-w-xs">
                        {file.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatFileSize(file.size)}
                      </p>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="rounded-lg border border-rose-500/30 bg-rose-950/20 px-3 py-1.5 text-[11px] font-medium text-rose-300 hover:text-rose-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Job Description Textarea */}
              <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Target className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      2. Paste Job Description
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="load-sample-jd-btn"
                      onClick={handleLoadSampleJD}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
                    >
                      Sample JD
                    </button>
                    {jobDescription && (
                      <button
                        type="button"
                        onClick={handleClearJD}
                        className="text-[11px] text-slate-400 hover:text-white transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <textarea
                    id="job-description-textarea"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description, required qualifications, and core responsibilities here (at least 30 characters)..."
                    rows={10}
                    className="flex-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono leading-relaxed"
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {jobDescription.trim().length < MIN_JD_CHARACTERS ? (
                        <span className="text-amber-400">
                          Minimum {MIN_JD_CHARACTERS} characters required
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Valid length
                        </span>
                      )}
                    </span>
                    <span className={jobDescription.length > MAX_JD_CHARACTERS ? "text-rose-400 font-bold" : ""}>
                      {jobDescription.length.toLocaleString()} / {MAX_JD_CHARACTERS.toLocaleString()} chars
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Notice Banner */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Privacy & Processing: </span>
                Extracted resume text and the pasted job description are sent securely to Google Gemini for one-time comparative analysis. Uploaded documents are <strong className="text-slate-300">not stored on disk or in persistent databases</strong>. Please avoid uploading sensitive personal information you do not have permission to share.
              </div>
            </div>

            {/* Submit Action */}
            <div className="text-center">
              <button
                type="button"
                id="analyze-match-btn"
                disabled={!file || jobDescription.trim().length < MIN_JD_CHARACTERS || isLoading}
                onClick={handleAnalyze}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-10 py-3.5 text-sm font-bold shadow-xl transition-all ${
                  !file || jobDescription.trim().length < MIN_JD_CHARACTERS || isLoading
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-emerald-300" />
                    <span>{loadingStep || "Analyzing Match..."}</span>
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 text-emerald-300" />
                    <span>Analyze Match with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* COMPARISON RESULTS REPORT */
          <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Header Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Match Analysis Ready
                  </span>
                </div>
                <h2 className="mt-1 text-2xl font-extrabold text-white">
                  Role Alignment Report
                </h2>
                {result.metadata?.resumeFilename && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Compared <span className="text-slate-200 font-mono">{result.metadata.resumeFilename}</span> against target job posting
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="matcher-reset-btn"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Start Another Comparison</span>
                </button>
                <Link
                  href="/resume-analyzer"
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/50 px-4 py-2 text-xs font-semibold text-indigo-300 hover:text-white transition-all"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Resume Analyzer</span>
                </Link>
              </div>
            </div>

            {/* Alignment Score Card with Official Disclaimer */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-indigo-950/30">
              <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                {/* Score Dial / Number */}
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={`flex h-28 w-28 items-center justify-center rounded-3xl border-2 ${getScoreColor(
                      result.alignmentScore
                    )} shadow-inner`}
                  >
                    <div className="text-center">
                      <span className="text-4xl font-extrabold tracking-tight">
                        {result.alignmentScore}
                      </span>
                      <span className="text-xs opacity-75 font-bold block">/ 100</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-2">
                    Alignment Score
                  </span>
                </div>

                {/* Score Explanation & Mandated Disclaimer */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  <h3 className="text-lg font-bold text-white">
                    Alignment Breakdown
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {result.scoreExplanation}
                  </p>

                  {/* Mandated Informational Notice */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-start gap-2.5 text-[11px] text-slate-400">
                    <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-300">Heuristic Estimate Notice: </strong>
                      This alignment score is an informational estimate calculated to help guide your interview preparation. It is not an official ATS score, a guarantee of passing candidate screening, or a prediction of employer hiring decisions.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Column Competency Comparison: Matching vs Missing/Unclear */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Matching Skills */}
              <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Demonstrated Matching Skills
                    </h3>
                    <p className="text-xs text-slate-400">
                      Requirements from the job description verified by resume evidence
                    </p>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  {result.matchingSkills?.length > 0 ? (
                    result.matchingSkills.map((match, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-xs"
                      >
                        <span className="font-bold text-emerald-300">
                          {match.skill}
                        </span>
                        {match.evidence && (
                          <p className="text-slate-400 mt-1 leading-snug">
                            {match.evidence}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No explicit skill overlaps detected.
                    </p>
                  )}
                </div>
              </div>

              {/* Missing or Unclear Skills */}
              <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-amber-400">
                  <HelpCircle className="h-5 w-5" />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Missing or Unclear Qualifications
                    </h3>
                    <p className="text-xs text-slate-400">
                      Role requirements absent or lacking quantifiable evidence in resume
                    </p>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  {result.missingOrUnclearSkills?.length > 0 ? (
                    result.missingOrUnclearSkills.map((gap, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-xs"
                      >
                        <span className="font-bold text-amber-300">
                          {gap.skill}
                        </span>
                        {gap.note && (
                          <p className="text-slate-400 mt-1 leading-snug">
                            {gap.note}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      All primary job requirements appear represented.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Evidence Mapping: Requirements linked to Demonstrated Accomplishments */}
            {result.evidence?.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-6">
                  <FileSearch className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Requirement-to-Resume Evidence Map
                    </h3>
                    <p className="text-xs text-slate-400">
                      Direct alignment points to leverage as persuasive interview talking points
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {result.evidence.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                      <div className="border-b md:border-b-0 md:border-r border-slate-800/80 pb-2 md:pb-0 md:pr-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Job Requirement
                        </span>
                        <p className="font-semibold text-slate-200 mt-1 leading-snug">
                          {item.requirement}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          Resume Evidence
                        </span>
                        <p className="text-slate-300 mt-1 leading-snug">
                          {item.resumeMatch}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4 text-indigo-400">
                  <TrendingUp className="h-5 w-5" />
                  <h3 className="text-base font-bold text-white">
                    Actionable Recommendations to Strengthen Alignment
                  </h3>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Resume Bullets to Emphasize Relevant Experience */}
            {result.suggestedResumeBullets?.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Truthful Resume Bullet Adaptations
                    </h3>
                    <p className="text-xs text-slate-400">
                      Ethical ways to emphasize qualifications already evidenced in your resume to directly reflect the target posting&apos;s terminology.
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {result.suggestedResumeBullets.map((bulletItem, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-indigo-500/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-white leading-relaxed">
                            {bulletItem.bullet}
                          </p>
                          {bulletItem.relevance && (
                            <p className="text-[11px] text-indigo-300/80 mt-1.5">
                              <span className="font-bold text-indigo-400">Target Alignment: </span>
                              {bulletItem.relevance}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(bulletItem.bullet, idx)}
                          className="p-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-800 text-indigo-300 hover:text-white transition-colors shrink-0"
                          title="Copy bullet"
                        >
                          {copiedIndex === idx ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
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
                <span>Start New Comparison</span>
              </button>

              <Link
                href="/resume-analyzer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <span>Run General Resume Audit</span>
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
