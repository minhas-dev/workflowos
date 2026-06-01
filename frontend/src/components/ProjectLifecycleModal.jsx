import React from "react";
import { CheckCircle2, RefreshCw, X, Check, Loader2 } from "lucide-react";

export default function ProjectLifecycleModal({
  isOpen,
  type, // "complete" | "reopen"
  projectName,
  saving,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const isCompleteMode = type === "complete";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm transition-all duration-300">
      <div 
        className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-2xl transition-all border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close button */}
        <div className="absolute right-4 top-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center mt-2">
          <div 
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
              isCompleteMode 
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" 
                : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
            } mb-4 shadow-sm`}
          >
            {isCompleteMode ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : (
              <RefreshCw className="h-8 w-8" />
            )}
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-6">
            {isCompleteMode ? "🎉 Project Ready for Completion" : "🔄 Unfinished Work Detected"}
          </h3>

          <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Project: <span className="text-slate-800 dark:text-slate-200 normal-case">{projectName}</span>
          </p>

          <p className="mt-3.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {isCompleteMode 
              ? "All tasks in this project have been completed. Would you like to mark this project as completed?" 
              : "This project has new unfinished work. Would you like to reopen this project?"}
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
          <button
            type="button"
            disabled={saving}
            onClick={onConfirm}
            className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isCompleteMode 
                ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 hover:shadow-md" 
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 hover:shadow-md"
            }`}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isCompleteMode ? (
              <Check className="h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isCompleteMode ? "Complete Project" : "Reopen Project"}
          </button>
          
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            {isCompleteMode ? "Keep Active" : "Keep Completed"}
          </button>
        </div>
      </div>
    </div>
  );
}
