"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Calendar,
  User,
  Eye,
  Edit2,
  Trash2,
  XCircle,
  Bell,
  AlertTriangle,
  Megaphone,
  Users,
  Shield,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { noticesApi, Notice } from "@/services/modules/notices";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

// ─── Config ──────────────────────────────────────────────────────────────────

const NOTICE_TYPES = [
  { value: "general", label: "General", color: "bg-blue-50 text-blue-600 border-blue-100", icon: Bell },
  { value: "emergency", label: "Emergency", color: "bg-rose-50 text-rose-600 border-rose-100", icon: AlertTriangle },
  { value: "maintenance", label: "Maintenance", color: "bg-amber-50 text-amber-600 border-amber-100", icon: FileText },
  { value: "meeting", label: "Meeting", color: "bg-purple-50 text-purple-600 border-purple-100", icon: Users },
  { value: "event", label: "Event", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: Megaphone },
];

const PRIORITY_LEVELS = [
  { value: "low", label: "Low", color: "bg-slate-100 text-slate-600" },
  { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-600" },
  { value: "high", label: "High", color: "bg-amber-100 text-amber-700" },
  { value: "urgent", label: "Urgent", color: "bg-rose-100 text-rose-700" },
];

const TARGET_AUDIENCES = [
  { value: "all", label: "All Residents" },
  { value: "committee", label: "Committee Only" },
  { value: "members", label: "Members" },
  { value: "security", label: "Security" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTypeConfig(type: string) {
  return NOTICE_TYPES.find((t) => t.value === type) ?? NOTICE_TYPES[0];
}

function getPriorityConfig(priority: string) {
  return PRIORITY_LEVELS.find((p) => p.value === priority) ?? PRIORITY_LEVELS[1];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  content: "",
  notice_type: "general",
  priority: "normal",
  target_audience: "all",
  expires_at: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function NoticesPage() {
  const { user } = useAuthStore();
  const isCommittee = user?.role === "committee";
  
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const { data: noticesData, isLoading, refetch } = useQuery({
    queryKey: ["notices", user?.role],
    queryFn: async () => {
      try {
        const res: any = isCommittee 
          ? await noticesApi.getAll({ limit: 100 })
          : await noticesApi.getMyNotices();
          
        return (res?.data?.notices ?? res?.data ?? []) as Notice[];
      } catch (err) {
        console.error("Error fetching notices:", err);
        toast.error("Failed to load notices");
        return [] as Notice[];
      }
    },
  });

  const notices: Notice[] = noticesData ?? [];

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return notices.filter((n) => {
      const matchType = filterType === "all" || n.notice_type === filterType;
      const matchSearch =
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [notices, filterType, search]);

  // ── CRUD handlers ─────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setIsCreateOpen(true);
  };

  const openEdit = (notice: Notice) => {
    setSelectedNotice(notice);
    setForm({
      title: notice.title,
      content: notice.content,
      notice_type: notice.notice_type,
      priority: notice.priority,
      target_audience: notice.target_audience,
      expires_at: notice.expires_at
        ? new Date(notice.expires_at).toISOString().slice(0, 16)
        : "",
    });
    setIsEditOpen(true);
  };

  const openDelete = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsDeleteOpen(true);
  };

  const openView = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsViewOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await noticesApi.create({
        title: form.title.trim(),
        content: form.content.trim(),
        notice_type: form.notice_type,
        priority: form.priority,
        target_audience: form.target_audience,
        expires_at: form.expires_at || undefined,
      });
      toast.success("Notice created successfully");
      setIsCreateOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create notice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNotice) return;
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await noticesApi.update(selectedNotice.id, {
        title: form.title.trim(),
        content: form.content.trim(),
        notice_type: form.notice_type as Notice["notice_type"],
        priority: form.priority as Notice["priority"],
        target_audience: form.target_audience as Notice["target_audience"],
        expires_at: form.expires_at || undefined,
        is_active: selectedNotice.is_active,
      });
      toast.success("Notice updated successfully");
      setIsEditOpen(false);
      setSelectedNotice(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update notice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNotice) return;
    setIsDeleting(true);
    try {
      await noticesApi.delete(selectedNotice.id);
      toast.success("Notice deleted successfully");
      setIsDeleteOpen(false);
      setSelectedNotice(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete notice");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notice Board</h1>
          <p className="text-slate-500 text-sm">
            Announcements and important updates for residents.
          </p>
        </div>
        {isCommittee && (
          <button
            id="create-notice-btn"
            onClick={openCreate}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            <span>Create Notice</span>
          </button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices by title or content..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Categories</option>
            {NOTICE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notice Count */}
      {!isLoading && (
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          {filtered.length} notice{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Notices Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft animate-pulse"
            >
              <div className="h-4 bg-slate-100 rounded w-24 mb-4" />
              <div className="h-6 bg-slate-100 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-full mb-2" />
              <div className="h-4 bg-slate-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center">
            <Bell className="w-10 h-10 text-slate-200" />
          </div>
          <div>
            <p className="font-bold text-slate-900">No notices found</p>
            <p className="text-slate-500 text-sm">
              {search || filterType !== "all"
                ? "Try clearing filters or use a different search term."
                : "Create your first notice to get started."}
            </p>
          </div>
          {(search || filterType !== "all") && (
            <button
              onClick={() => { setSearch(""); setFilterType("all"); }}
              className="text-primary text-sm font-bold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((notice) => {
              const typeConf = getTypeConfig(notice.notice_type);
              const priorityConf = getPriorityConfig(notice.priority);
              const TypeIcon = typeConf.icon;
              return (
                <motion.div
                  key={notice.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft hover:shadow-lg transition-all group"
                >
                  {/* Top row: type badge + actions */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                          typeConf.color
                        )}
                      >
                        <TypeIcon className="w-3 h-3" />
                        {typeConf.label}
                      </span>
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          priorityConf.color
                        )}
                      >
                        {priorityConf.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        id={`view-notice-${notice.id}`}
                        onClick={() => openView(notice)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {isCommittee && (
                        <>
                          <button
                            id={`edit-notice-${notice.id}`}
                            onClick={() => openEdit(notice)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-notice-${notice.id}`}
                            onClick={() => openDelete(notice)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title + content */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {notice.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-6">
                    {notice.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(notice.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <User className="w-3.5 h-3.5" />
                        <span>{notice.created_by_name ?? "Admin"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        {TARGET_AUDIENCES.find((a) => a.value === notice.target_audience)?.label ?? notice.target_audience}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Create Modal ─────────────────────────────────────────────────────── */}
      <NoticeFormModal
        isOpen={isCreateOpen}
        title="Create Notice"
        form={form}
        setForm={setForm}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        submitLabel="Post Notice"
      />

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      <NoticeFormModal
        isOpen={isEditOpen}
        title="Edit Notice"
        form={form}
        setForm={setForm}
        onClose={() => { setIsEditOpen(false); setSelectedNotice(null); }}
        onSubmit={handleEdit}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
        submitColor="bg-blue-600 hover:bg-blue-700"
      />

      {/* ── View Modal ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isViewOpen && selectedNotice && (
          <Modal onClose={() => { setIsViewOpen(false); setSelectedNotice(null); }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Notice Details</h3>
              <button
                onClick={() => { setIsViewOpen(false); setSelectedNotice(null); }}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider", getTypeConfig(selectedNotice.notice_type).color)}>
                  {getTypeConfig(selectedNotice.notice_type).label}
                </span>
                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", getPriorityConfig(selectedNotice.priority).color)}>
                  {getPriorityConfig(selectedNotice.priority).label} priority
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedNotice.title}</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{selectedNotice.content}</p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <InfoRow label="Posted By" value={selectedNotice.created_by_name ?? "Admin"} />
                <InfoRow label="Date" value={formatDate(selectedNotice.created_at)} />
                <InfoRow label="Audience" value={TARGET_AUDIENCES.find((a) => a.value === selectedNotice.target_audience)?.label ?? selectedNotice.target_audience} />
                <InfoRow label="Expires" value={selectedNotice.expires_at ? formatDate(selectedNotice.expires_at) : "No expiry"} />
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isDeleteOpen && selectedNotice && (
          <Modal onClose={() => { setIsDeleteOpen(false); setSelectedNotice(null); }} maxWidth="max-w-sm">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900">Delete Notice</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-slate-800">&quot;{selectedNotice.title}&quot;</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsDeleteOpen(false); setSelectedNotice(null); }}
                className="flex-1 px-4 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-notice-btn"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 text-white font-bold bg-rose-600 hover:bg-rose-700 rounded-xl transition-all disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Modal({
  children,
  onClose,
  maxWidth = "max-w-lg",
}: {
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={cn("bg-white rounded-3xl p-6 w-full shadow-xl", maxWidth)}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

interface FormState {
  title: string;
  content: string;
  notice_type: string;
  priority: string;
  target_audience: string;
  expires_at: string;
}

function NoticeFormModal({
  isOpen,
  title,
  form,
  setForm,
  onClose,
  onSubmit,
  isSubmitting,
  submitLabel,
  submitColor = "bg-primary hover:bg-blue-600",
}: {
  isOpen: boolean;
  title: string;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitLabel: string;
  submitColor?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal onClose={onClose}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                placeholder="Notice title"
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Content *</label>
              <textarea
                required
                rows={4}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                placeholder="Write the notice content here..."
              />
            </div>

            {/* Type & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Type</label>
                <select
                  value={form.notice_type}
                  onChange={(e) => setForm((f) => ({ ...f, notice_type: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                >
                  {NOTICE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                >
                  {PRIORITY_LEVELS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audience & Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Audience</label>
                <select
                  value={form.target_audience}
                  onChange={(e) => setForm((f) => ({ ...f, target_audience: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                >
                  {TARGET_AUDIENCES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Expires At (optional)</label>
                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "flex-1 px-4 py-3 text-white font-bold rounded-xl transition-all disabled:opacity-50",
                  submitColor
                )}
              >
                {isSubmitting ? "Saving..." : submitLabel}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AnimatePresence>
  );
}
