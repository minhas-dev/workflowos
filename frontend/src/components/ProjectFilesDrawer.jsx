import { useEffect, useMemo, useState, useCallback } from "react";
import { FolderOpen, Search, Upload, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import api from "../services/api";
import AttachmentCard from "./AttachmentCard";
import AttachmentPreviewModal from "./AttachmentPreviewModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export default function ProjectFilesDrawer({
  project,
  open,
  onClose,
}) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);

  const [deletingAttachment, setDeletingAttachment] = useState(null);

  const userRole = localStorage.getItem("user_role");
  const currentUserId = Number(localStorage.getItem("user_id") || 0);
  const canManageProjects = userRole === "Admin" || userRole === "Manager";

  const fetchFiles = useCallback(async () => {
    if (!project?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/projects/${project.id}/files`);
      setAttachments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load project files");
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => {
    let active = true;

    async function load() {
      // Yield to avoid synchronous setState inside the effect body
      await Promise.resolve();
      if (!active) return;

      if (open && project?.id) {
        fetchFiles();
      } else {
        setAttachments([]);
        setSearchQuery("");
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [open, project?.id, fetchFiles]);

  async function uploadFile(file) {
    if (!file || !project?.id) return;

    const form = new FormData();
    form.append("file", file);

    try {
      setUploading(true);
      setUploadProgress(0);

      await api.post(`/projects/${project.id}/files`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => {
          if (!p?.total) return;
          const pct = Math.round((p.loaded * 100) / p.total);
          setUploadProgress(pct);
        },
      });

      toast.success("File uploaded successfully");
      fetchFiles();
      window.dispatchEvent(new CustomEvent("project-updated"));
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }

  function onFileInputChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadFile(file);
    event.target.value = "";
  }

  async function handleDeleteConfirm() {
    if (!deletingAttachment || !project?.id) return;
    try {
      await api.delete(`/projects/${project.id}/files/${deletingAttachment.id}`);
      toast.success("File deleted successfully");
      fetchFiles();
      window.dispatchEvent(new CustomEvent("project-updated"));
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.detail || "Failed to delete file");
    } finally {
      setDeletingAttachment(null);
    }
  }

  const filteredAttachments = useMemo(() => {
    return attachments.filter((att) =>
      att.original_filename?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [attachments, searchQuery]);

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm transition-all duration-300">
      <aside className="flex h-dvh w-full max-w-3xl flex-col bg-white dark:bg-slate-800 shadow-2xl border-l border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-700 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <FolderOpen size={16} />
                Project Files Workspace
              </div>
              <h2 className="mt-2 break-words text-xl font-bold text-slate-950 dark:text-slate-100 sm:text-2xl">
                {project.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Upload requirements, notes, contracts, wireframes, and schemas to keep project-level assets organized.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-slate-100"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Search & Drag Drop Zone */}
        <div className="px-4 py-4 sm:px-6 space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search files by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2.5 pl-10 pr-4 text-slate-900 dark:text-slate-100 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800"
            />
          </div>

          <div
            className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 p-5 text-center transition hover:bg-slate-100/50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const file = e.dataTransfer?.files?.[0];
              if (!file || uploading) return;
              await uploadFile(file);
            }}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 text-slate-600 dark:text-slate-300">
                <Upload size={18} />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Drag and drop your file here, or{" "}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-bold inline-flex items-center gap-1">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    onChange={onFileInputChange}
                    disabled={uploading}
                  />
                </label>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Supports PDF, DOCX, PPTX, Image, SQL, TXT, JSON (Max 50MB)
              </p>
            </div>

            {uploading && typeof uploadProgress === "number" && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="text-xs font-semibold text-slate-500">{uploadProgress}%</span>
                <div className="w-48 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Files list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : filteredAttachments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-600 ring-1 ring-slate-100 dark:ring-slate-800">
                <FolderOpen size={24} />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                {searchQuery ? "No files match search query" : "No files uploaded yet"}
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-5">
                {searchQuery ? "Try checking spelling or use general keywords." : "Keep all project-level requirements and wireframes attached to this workspace."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAttachments.map((file) => (
                <AttachmentCard
                  key={file.id}
                  attachment={file}
                  canDelete={canManageProjects || file.uploader_id === currentUserId}
                  onPreview={() => {
                    setPreviewAttachment(file);
                    setPreviewOpen(true);
                  }}
                  onDownload={() => {
                    const downloadUrl = `${api.defaults.baseURL || ""}/attachments/${file.id}/download`;
                    window.open(downloadUrl, "_blank", "noopener,noreferrer");
                  }}
                  onDelete={() => setDeletingAttachment(file)}
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Preview Modal */}
      <AttachmentPreviewModal
        open={previewOpen}
        attachment={previewAttachment}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewAttachment(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(deletingAttachment)}
        title="Delete file?"
        description="This action cannot be undone and will permanently remove this project file."
        itemName={deletingAttachment?.original_filename || ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingAttachment(null)}
        isDangerous={false}
      />
    </div>
  );
}
