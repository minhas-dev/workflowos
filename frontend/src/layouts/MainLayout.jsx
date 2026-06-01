import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import CommandPalette from "../components/CommandPalette";
import Topbar from "../components/Topbar";
import ProjectLifecycleModal from "../components/ProjectLifecycleModal";
import api from "../services/api";
import { createRealtimeConnection } from "../services/realtime";
import { Sparkles, Check, RotateCcw } from "lucide-react";


export default function MainLayout({
  children,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Showcase Mode states
  const [demoStatus, setDemoStatus] = useState({ seeded: false, loading: true });

  async function checkDemoStatus() {
    try {
      const res = await api.get("/demo/status");
      setDemoStatus({ seeded: res.data.seeded, loading: false });
    } catch (err) {
      console.error("Failed to fetch demo status:", err);
      setDemoStatus({ seeded: false, loading: false });
    }
  }

  useEffect(() => {
    checkDemoStatus();
  }, []);

  async function handleSeedDemo() {
    try {
      setDemoStatus((prev) => ({ ...prev, loading: true }));
      await api.post("/demo/seed");
      toast.success("Demo workspace seeded successfully!");
      setDemoStatus({ seeded: true, loading: false });
      window.dispatchEvent(new CustomEvent("project-created"));
      window.dispatchEvent(new CustomEvent("task-created"));
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
      window.dispatchEvent(new CustomEvent("comment-added"));
      window.dispatchEvent(new CustomEvent("task-updated"));
    } catch (err) {
      toast.error("Failed to seed demo workspace.");
      setDemoStatus((prev) => ({ ...prev, loading: false }));
    }
  }

  async function handleResetDemo() {
    try {
      setDemoStatus((prev) => ({ ...prev, loading: true }));
      await api.post("/demo/reset");
      toast.success("Workspace reset successfully!");
      setDemoStatus({ seeded: false, loading: false });
      window.dispatchEvent(new CustomEvent("project-deleted"));
      window.dispatchEvent(new CustomEvent("task-deleted"));
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
      window.dispatchEvent(new CustomEvent("comment-added"));
      window.dispatchEvent(new CustomEvent("task-updated"));
    } catch (err) {
      toast.error("Failed to reset workspace.");
      setDemoStatus((prev) => ({ ...prev, loading: false }));
    }
  }

  // Project lifecycle states
  const [lifecycleModal, setLifecycleModal] = useState({
    isOpen: false,
    type: null, // "complete" | "reopen"
    project: null,
  });
  const [savingLifecycle, setSavingLifecycle] = useState(false);

  // Checks all projects for lifecycle conditions
  async function checkProjectsLifecycle() {
    try {
      const res = await api.get("/projects/");
      const projects = Array.isArray(res.data) ? res.data : (res.data?.data || []);

      // Clean up localStorage flags for projects that have changed states
      projects.forEach((proj) => {
        if (proj.progress < 100) {
          localStorage.removeItem(`prompted_complete_${proj.id}`);
        }
        if (proj.status !== "completed") {
          // remove all prompted_reopen keys for this project using a safe array copy
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`prompted_reopen_${proj.id}_`)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((k) => localStorage.removeItem(k));
        }
      });

      // Find the first project that matches either completion or reopen conditions
      for (const proj of projects) {
        // Condition A: Project ready for completion
        const isEligibleForCompletion =
          (proj.status === "active" || proj.status === "planning") &&
          proj.progress === 100 &&
          proj.task_count > 0;

        if (isEligibleForCompletion) {
          const alreadyPrompted = localStorage.getItem(`prompted_complete_${proj.id}`);
          if (alreadyPrompted !== "true") {
            setLifecycleModal({
              isOpen: true,
              type: "complete",
              project: proj,
            });
            return; // Only show one modal at a time
          }
        }

        // Condition B: Completed project has new unfinished work
        const isEligibleForReopen = proj.status === "completed" && proj.progress < 100;

        if (isEligibleForReopen) {
          const alreadyPrompted = localStorage.getItem(`prompted_reopen_${proj.id}_${proj.progress}`);
          if (alreadyPrompted !== "true") {
            setLifecycleModal({
              isOpen: true,
              type: "reopen",
              project: proj,
            });
            return; // Only show one modal at a time
          }
        }
      }
    } catch (error) {
      console.error("Failed to check project lifecycle:", error);
    }
  }

  // Handle modal confirmation
  async function handleConfirmLifecycle() {
    const { type, project } = lifecycleModal;
    if (!project) return;

    try {
      setSavingLifecycle(true);
      const nextStatus = type === "complete" ? "completed" : "active";

      await api.put(`/projects/${project.id}`, { status: nextStatus });

      if (type === "complete") {
        localStorage.setItem(`prompted_complete_${project.id}`, "true");
        toast.success(`Project "${project.name}" marked as completed!`);
      } else {
        localStorage.setItem(`prompted_reopen_${project.id}_${project.progress}`, "true");
        toast.success(`Project "${project.name}" has been reopened.`);
      }

      // Dispatch global events to notify page components to refresh
      window.dispatchEvent(new CustomEvent("project-updated"));
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));

      setLifecycleModal({ isOpen: false, type: null, project: null });
      
      // Re-run checks to see if other projects need attention
      checkProjectsLifecycle();
    } catch (error) {
      console.error("Failed to update project lifecycle state:", error);
      toast.error(error?.response?.data?.detail || "Failed to update project status.");
    } finally {
      setSavingLifecycle(false);
    }
  }

  // Handle modal cancellation/postponement
  function handleCancelLifecycle() {
    const { type, project } = lifecycleModal;
    if (project) {
      if (type === "complete") {
        localStorage.setItem(`prompted_complete_${project.id}`, "true");
      } else {
        localStorage.setItem(`prompted_reopen_${project.id}_${project.progress}`, "true");
      }
    }
    setLifecycleModal({ isOpen: false, type: null, project: null });
  }

  // Establish realtime websocket listeners
  useEffect(() => {
    const stop = createRealtimeConnection({
      onMessage: (message) => {
        if (
          [
            "project.updated",
            "project.created",
            "project.deleted",
            "task.created",
            "task.updated",
            "task.moved",
            "task.deleted",
          ].includes(message.event)
        ) {
          checkProjectsLifecycle();
        }
      },
    });

    const timer = setTimeout(() => {
      checkProjectsLifecycle();
    }, 0);

    return () => {
      stop();
      clearTimeout(timer);
    };
  }, []);

  // Establish custom event listeners for direct client updates
  useEffect(() => {
    const handler = () => checkProjectsLifecycle();
    const events = [
      "project-created",
      "project-updated",
      "project-deleted",
      "task-created",
      "task-updated",
      "task-moved",
      "task-deleted",
    ];

    events.forEach((ev) => window.addEventListener(ev, handler));
    return () => events.forEach((ev) => window.removeEventListener(ev, handler));
  }, []);


  return (
    <div className="app-shell flex min-h-dvh overflow-x-hidden bg-slate-50 text-slate-950 transition-colors duration-200 dark:bg-slate-900 dark:text-slate-100">

      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <CommandPalette />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col bg-slate-50 transition-colors duration-200 dark:bg-slate-900">

        {!demoStatus.loading && (
          <div className={`w-full py-2.5 px-4 flex flex-wrap items-center justify-between text-xs font-semibold border-b transition-all duration-200 gap-3 ${
            demoStatus.seeded
              ? "bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-300"
              : "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300"
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              {demoStatus.seeded ? (
                <Check className="h-4 w-4 text-indigo-600 flex-shrink-0" />
              ) : (
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse flex-shrink-0" />
              )}
              <span className="truncate">
                {demoStatus.seeded
                  ? "Showcase Mode Active — Preloaded high-fidelity Ecommerce, Mobile App Redesign, and Marketing Sprint data."
                  : "Showcase Mode Available — Seed the workspace with realistic, pre-populated projects, tasks, files, and discussion logs."}
              </span>
            </div>
            <button
              onClick={demoStatus.seeded ? handleResetDemo : handleSeedDemo}
              disabled={demoStatus.loading}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer shadow-sm ${
                demoStatus.seeded
                  ? "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 dark:bg-slate-800 dark:text-indigo-300 dark:border-indigo-900/40 dark:hover:bg-slate-700"
                  : "bg-amber-600 text-white hover:bg-amber-700 hover:shadow"
              }`}
            >
              {demoStatus.seeded ? (
                <>
                  <RotateCcw className="h-3 w-3" />
                  Reset Workspace
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  Seed Workspace
                </>
              )}
            </button>
          </div>
        )}

        <Topbar
          setIsOpen={setIsOpen}
        />

        <main className="relative min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-3 transition-colors duration-200 dark:bg-slate-900 sm:p-5 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative w-full min-w-0 max-w-none animate-fade-in"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      <ProjectLifecycleModal
        isOpen={lifecycleModal.isOpen}
        type={lifecycleModal.type}
        projectName={lifecycleModal.project?.name || ""}
        saving={savingLifecycle}
        onConfirm={handleConfirmLifecycle}
        onCancel={handleCancelLifecycle}
      />

    </div>
  );
}
