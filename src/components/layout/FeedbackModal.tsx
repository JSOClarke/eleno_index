import React, { useEffect, useState } from "react";
import { BookPlus, Bug, CheckCircle2, X } from "lucide-react";
import { submitFeedback, type FeedbackKind } from "@/api/feedback.api";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultKind?: FeedbackKind;
  defaultTitle?: string;
  activeLanguage?: string;
  userId?: string | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen, onClose, defaultKind = "media_request", defaultTitle = "", activeLanguage = "es", userId,
}) => {
  const [kind, setKind] = useState<FeedbackKind>(defaultKind);
  const [language, setLanguage] = useState(activeLanguage);
  const [title, setTitle] = useState(defaultTitle);
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setKind(defaultKind);
    setTitle(defaultTitle);
    setLanguage(activeLanguage || "es");
    setDetails("");
    setError(null);
    setSent(false);
  }, [isOpen, defaultKind, defaultTitle, activeLanguage]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 2) { setError("Please enter a short title or summary."); return; }
    setSubmitting(true);
    setError(null);
    try {
      await submitFeedback({
        kind, language, title, details,
        pageUrl: typeof window !== "undefined" ? window.location.pathname : undefined,
        contactEmail: !userId ? email : undefined, userId,
      });
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-slate-900">Feedback & Requests</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {sent ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="mx-auto h-9 w-9 text-slate-900" />
            <p className="text-sm font-medium text-slate-900">Thanks — your {kind === "media_request" ? "request" : "report"} has been saved.</p>
            <button type="button" onClick={onClose} className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
              {([["media_request", "Request Media", BookPlus], ["bug", "Report a Bug", Bug]] as const).map(([id, label, Icon]) => (
                <button
                  key={id} type="button" onClick={() => setKind(id)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 font-semibold transition cursor-pointer ${
                    kind === id ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /><span>{label}</span>
                </button>
              ))}
            </div>

            {kind === "media_request" && (
              <div>
                <label className="mb-1 block font-medium text-slate-700">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none">
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="zh">Chinese</option>
                  <option value="ru">Russian</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block font-medium text-slate-700">
                {kind === "media_request" ? "Title & Author" : "Short summary"}
              </label>
              <input
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder={kind === "media_request" ? "e.g. El principito — Antoine de Saint-Exupéry" : "e.g. Search filter doesn't reset on page 2"}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-700">
                {kind === "media_request" ? "Notes or link (optional)" : "What happened?"}
              </label>
              <textarea
                rows={3} value={details} onChange={(e) => setDetails(e.target.value)}
                placeholder={kind === "media_request" ? "Book, graded reader, podcast, or subtitles..." : "Steps to reproduce or what you expected..."}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            {!userId && (
              <div>
                <label className="mb-1 block font-medium text-slate-700">Email (optional)</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>
            )}

            {error && <p className="text-rose-600">{error}</p>}

            <button
              type="submit" disabled={submitting}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition"
            >
              {submitting ? "Sending…" : kind === "media_request" ? "Submit Request" : "Send Bug Report"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
