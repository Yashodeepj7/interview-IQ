"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Sparkles,
  Send,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Cpu,
  Layers,
  RefreshCw,
  Zap,
  Info,
  Loader2,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

const SAMPLE_PROMPTS = [
  {
    label: "JavaScript Event Loop",
    text: "Explain how JavaScript's event loop works with microtasks and macrotasks. Give a brief scenario showing the execution order of synchronous code, setTimeout, and Promise.then().",
  },
  {
    label: "STAR Behavioral Answer",
    text: "Provide a concise STAR framework answer for a Senior Software Engineer answering: 'Tell me about a time you had to resolve a high-severity production outage under time pressure.'",
  },
  {
    label: "System Design Trade-offs",
    text: "What are the primary latency and consistency trade-offs between optimistic locking and pessimistic locking in a distributed transaction system?",
  },
];

export default function AITestClient() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPTS[0].text);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);
  const [providerStatus, setProviderStatus] = useState(null);

  // Fetch real-time provider configuration status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/ai/test");
      if (res.ok) {
        const data = await res.json();
        setProviderStatus(data);
      }
    } catch {
      // Ignore background status fetch error
    }
  }

  const trimmedLength = prompt.trim().length;
  const isInputValid = trimmedLength >= 3 && trimmedLength <= 1000;

  async function handleGenerate(e) {
    e?.preventDefault();
    if (!isInputValid || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);
    setLatencyMs(null);

    const startTime = performance.now();

    try {
      const res = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await res.json();
      const endTime = performance.now();
      setLatencyMs(Math.round(endTime - startTime));

      if (!res.ok) {
        setError(data);
      } else {
        setResponse(data);
        // Refresh provider status to update lastExecution telemetry
        fetchStatus();
      }
    } catch (err) {
      setError({
        success: false,
        error: "Network error occurred while contacting the server.",
        details: err?.message || "Please verify your server is running.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setPrompt(SAMPLE_PROMPTS[0].text);
    setResponse(null);
    setError(null);
    setLatencyMs(null);
  }

  function handleCopy() {
    if (!response?.text) return;
    navigator.clipboard.writeText(response.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Dual Provider Status */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to InterviewIQ Home</span>
        </Link>

        {/* Dual AI Engine Indicator */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Gemini Primary status */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
              providerStatus?.geminiConfigured
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-slate-800 bg-slate-900/60 text-slate-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                providerStatus?.geminiConfigured ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
              }`}
            />
            <span>Gemini: {providerStatus?.geminiConfigured ? "Active" : "Not Set"}</span>
          </div>

          {/* Groq Fallback status */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
              providerStatus?.groqConfigured
                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border-slate-800 bg-slate-900/60 text-slate-400"
            }`}
          >
            <RefreshCw className="h-3 w-3 text-amber-400" />
            <span>Groq Fallback: {providerStatus?.groqConfigured ? "Ready" : "Not Set"}</span>
          </div>

          {providerStatus?.fallbackForced && (
            <div className="flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-300 animate-pulse">
              <span>TEST SIMULATOR FORCED</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-600/30 mb-4">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          AI Connection & Failover Test
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
          Verify resilient dual-provider AI integration with Google Gemini as primary and Groq
          as zero-downtime automatic fallback when Gemini free quota or tokens are exhausted.
        </p>
      </div>

      {/* Test Console Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-indigo-950/40">
        <form onSubmit={handleGenerate}>
          {/* Quick Scenario Chips */}
          <div className="mb-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Sample Prompts
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => setPrompt(sample.text)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    prompt === sample.text
                      ? "border border-indigo-500 bg-indigo-600/20 text-indigo-200"
                      : "border border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Input */}
          <div className="relative">
            <label
              htmlFor="ai-test-prompt-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
            >
              Interview Prompt / Test Message
            </label>
            <textarea
              id="ai-test-prompt-input"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type an interview question or prompt (between 3 and 1000 characters)..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-y font-mono leading-relaxed transition-colors"
            />

            {/* Character Counter & Validation Warning */}
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>
                {trimmedLength < 3 ? (
                  <span className="text-amber-400 font-medium">
                    Minimum 3 characters required ({trimmedLength}/3)
                  </span>
                ) : trimmedLength > 1000 ? (
                  <span className="text-rose-400 font-medium">
                    Exceeds 1000 characters ({trimmedLength}/1000)
                  </span>
                ) : (
                  <span className="text-slate-400">
                    Input within valid range ({trimmedLength} / 1000 characters)
                  </span>
                )}
              </span>

              <span className="font-mono text-[11px] text-slate-500">
                POST /api/ai/test
              </span>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2 text-xs font-semibold text-slate-400 hover:border-slate-700 hover:text-slate-200 disabled:opacity-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Prompt</span>
            </button>

            <button
              type="submit"
              id="ai-test-generate-btn"
              disabled={!isInputValid || isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Invoking AI Engine (Gemini / Groq)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-white" />
                  <span>Generate AI Response</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* State: Error Display */}
        {error && (
          <div className="mt-8 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 text-xs text-rose-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-rose-300">
                    {error.setupRequired
                      ? "Configuration Required: API Key Missing"
                      : error.error || "Request Failed"}
                  </h4>
                  {error.setupRequired && (
                    <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                      HTTP 503
                    </span>
                  )}
                </div>

                {error.instructions && (
                  <div className="rounded-xl bg-black/40 p-3.5 border border-rose-900/40 text-slate-300">
                    <p className="font-semibold text-slate-200 mb-1">
                      Setup Instructions:
                    </p>
                    <p className="text-slate-300 mb-2">
                      {error.instructions}
                    </p>
                    <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-indigo-300 border border-slate-800">
                      # .env.local<br />
                      GEMINI_API_KEY=your_gemini_api_key_here<br />
                      GROQ_API_KEY=your_groq_api_key_here
                    </div>
                  </div>
                )}

                {error.details && (
                  <p className="text-rose-300/80 leading-relaxed font-mono text-[11px]">
                    Details: {error.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* State: Success Response Display with Active Provider Badge */}
        {response && response.text && (
          <div
            className={`mt-8 rounded-2xl border p-5 backdrop-blur-md transition-all ${
              response.provider === "groq" || response.fallback
                ? "border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-slate-950/90 shadow-xl shadow-amber-950/30"
                : "border-emerald-500/30 bg-slate-950/80 shadow-xl shadow-emerald-950/20"
            }`}
          >
            {/* Active Provider Banner */}
            {response.provider === "groq" || response.fallback ? (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                <RefreshCw className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: "6s" }} />
                <div>
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <span>🔄 Automatic Fallback Active: Groq Engine Used</span>
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-mono text-amber-300">
                      Zero Downtime
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-amber-200/90 leading-relaxed">
                    {response.reason ||
                      "Gemini tokens/quota reached or fallback testing mode is enabled. The system seamlessly failed over to Groq without any interruption!"}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Header with Provider Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                {response.provider === "groq" || response.fallback ? (
                  <>
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">
                      Groq Fallback Response
                    </span>
                    <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-amber-300 border border-amber-500/30">
                      {response.model || "openai/gpt-oss-120b"}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">
                      Gemini Primary Response
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-300 border border-emerald-500/20">
                      {response.model || "gemini-3.8-flash"}
                    </span>
                  </>
                )}

                {latencyMs && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    • {latencyMs}ms
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Formatted Text Output */}
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {response.text}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${response.provider === "groq" ? "bg-amber-400" : "bg-emerald-400"}`} />
                Provider: <strong className="text-slate-300 capitalize">{response.provider || "gemini"}</strong>
              </span>
              <span className="font-mono">
                {response.timestamp
                  ? new Date(response.timestamp).toLocaleTimeString()
                  : ""}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Guide: How to Test Gemini Exhaustion & Groq Fallback */}
      <div className="mt-8 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/15 via-slate-900/60 to-slate-950/80 p-6 sm:p-7 backdrop-blur-xl">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div className="space-y-3 w-full">
            <div>
              <h3 className="font-bold text-sm text-white">
                How to Test When Gemini Free Tokens End & Fallback Activates
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                You can easily verify that the Groq fallback takes over using any of these 3 methods:
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 pt-1">
              {/* Method 1 */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[11px]">1</span>
                  <span>Instant Simulator</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  In your <code className="text-indigo-300">.env.local</code> file, add:
                </p>
                <code className="block rounded bg-black/60 p-2 font-mono text-[10px] text-amber-300 border border-slate-800">
                  FORCE_AI_FALLBACK=true
                </code>
                <p className="text-slate-500 text-[10px]">
                  Restart server. Every request instantly uses Groq without using Gemini quota!
                </p>
              </div>

              {/* Method 2 */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[11px]">2</span>
                  <span>Simulate Expired Key</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Put an invalid/dummy key in <code className="text-indigo-300">.env.local</code>:
                </p>
                <code className="block rounded bg-black/60 p-2 font-mono text-[10px] text-amber-300 border border-slate-800">
                  GEMINI_API_KEY=test_invalid
                </code>
                <p className="text-slate-500 text-[10px]">
                  Gemini will throw an error; the engine automatically catches it and routes to Groq!
                </p>
              </div>

              {/* Method 3 */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[11px]">3</span>
                  <span>Natural Exhaustion</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  When your free 15 requests/minute or token limit is reached:
                </p>
                <code className="block rounded bg-black/60 p-2 font-mono text-[10px] text-emerald-300 border border-slate-800">
                  429 Quota Exceeded
                </code>
                <p className="text-slate-500 text-[10px]">
                  Users experience zero downtime — Groq takes over completely silently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Architecture Reference */}
      <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5 text-xs text-slate-400">
        <div className="flex items-start gap-3">
          <Terminal className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-200">
              Security & Implementation Guarantees:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-400 mt-1">
              <li>
                <strong className="text-slate-300">Server-Side Only:</strong> Both Google GenAI SDK and Groq OpenAI-compatible client execute strictly server-side in <code className="text-indigo-300">src/lib/gemini.js</code>.
              </li>
              <li>
                <strong className="text-slate-300">Zero Client Exposure:</strong> Neither <code className="text-indigo-300">GEMINI_API_KEY</code> nor <code className="text-indigo-300">GROQ_API_KEY</code> are ever sent to the browser or bundled in client scripts.
              </li>
              <li>
                <strong className="text-slate-300">Automatic Failover:</strong> Triggered on HTTP 429, HTTP 503, Quota Exceeded, Resource Exhausted, or Missing Gemini Key.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
