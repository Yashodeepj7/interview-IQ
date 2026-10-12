"use client";

import { useState } from "react";
import { X, Mic, Sparkles, Check, ArrowRight, Info, Bot } from "lucide-react";
import Link from "next/link";

export default function MockInterviewModal({ isOpen, onClose }) {
  const [selectedRole, setSelectedRole] = useState("Full-Stack Engineer");
  const [selectedLevel, setSelectedLevel] = useState("Senior");
  const [selectedFormat, setSelectedFormat] = useState("Mixed (Technical + Behavioral)");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-700/80 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-indigo-950/60 z-10">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Configure Your Mock Interview
            </h3>
            <p className="text-xs text-slate-400">
              Customize role parameters for your upcoming practice session
            </p>
          </div>
        </div>

        {/* Form Controls */}
        <div className="mt-6 space-y-4">
          {/* Role selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Target Role
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                "Full-Stack Engineer",
                "Frontend Specialist",
                "Backend / Systems",
                "Product Manager",
              ].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 font-medium border transition-all text-left ${
                    selectedRole === role
                      ? "border-indigo-500 bg-indigo-600/20 text-white font-semibold"
                      : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span>{role}</span>
                  {selectedRole === role && (
                    <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Seniority Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Seniority Level
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {["Junior / Entry", "Mid-Level", "Senior / Staff"].map(
                (level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedLevel(level)}
                    className={`flex items-center justify-center rounded-xl px-2 py-2 text-center font-medium border transition-all ${
                      selectedLevel === level
                        ? "border-indigo-500 bg-indigo-600/20 text-white font-semibold"
                        : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {level}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Interview Format
            </label>
            <div className="grid grid-cols-1 gap-2 text-xs">
              {[
                "Mixed (Technical + Behavioral)",
                "System Architecture Deep-Dive",
                "STAR Behavioral Leadership",
              ].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setSelectedFormat(fmt)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-left font-medium border transition-all ${
                    selectedFormat === fmt
                      ? "border-indigo-500 bg-indigo-600/20 text-white font-semibold"
                      : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span>{fmt}</span>
                  {selectedFormat === fmt && (
                    <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 1 Roadmap Notification Banner */}
        <div className="mt-6 rounded-xl bg-slate-950/80 p-3.5 border border-indigo-500/30 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">
                Step 3 Engine Ready
              </p>
              <p className="text-slate-400 leading-relaxed">
                Configure your target questions, experience level, and difficulty with the newly enabled AI mock interview engine.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <Link
            href="/mock-interview"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all"
          >
            <span>Configure Mock Interview</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
