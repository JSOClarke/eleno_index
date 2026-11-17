import React, { useEffect, useState } from "react";
import { fetchAdminMediaDetails, updateAdminMediaMetadata } from "@/api/adminImport.api";
import { AdminImportAuditForm } from "@/components/admin/AdminImportAuditForm";
import { clearCachedCatalogue } from "@/lib/catalogueCache";
import { inspectorCache } from "@/lib/inspectorCache";
import type { AdminEditionDraft, AdminWorkDraft } from "@/types/adminImport.types";

interface AdminEditMediaModalProps {
  isOpen: boolean;
  mediaId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyWork: AdminWorkDraft = {
  original_title: "", title_en: "", creator: "", original_language: "en",
  synopsis_en: "", series_id: undefined, series_name: "", series_order: "", series_label: "",
};

const emptyEdition: AdminEditionDraft = {
  title: "", author: "", language: "es", synopsis: "", release_year: "",
};

export const AdminEditMediaModal: React.FC<AdminEditMediaModalProps> = ({
  isOpen, mediaId, onClose, onSuccess,
}) => {
  const [work, setWork] = useState<AdminWorkDraft>(emptyWork);
  const [edition, setEdition] = useState<AdminEditionDraft>(emptyEdition);
  const [sourceFilename, setSourceFilename] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !mediaId) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchAdminMediaDetails(mediaId)
      .then((res) => {
        if (!active) return;
        const w = res.work;
        const it = res.item;
        setWork({
          original_title: w?.original_title || it.title || "",
          title_en: w?.title_en || w?.original_title || it.title || "",
          creator: w?.creator || it.creator || "",
          original_language: w?.original_language || "en",
          type: w?.type || it.type || "book",
          synopsis_en: w?.synopsis_en || w?.synopsis || "",
          series_id: w?.series_id || undefined,
          series_name: w?.series_name || "",
          series_order: w?.series_order != null ? String(w.series_order) : "",
          series_label: w?.series_label || "",
        });
        setSourceFilename(it.metadata?.source_filename || null);
        setEdition({
          title: it.title || "",
          author: it.creator || "",
          language: it.language || "es",
          synopsis: it.synopsis || "",
          release_year: it.release_year != null ? String(it.release_year) : "",
        });
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load metadata");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen, mediaId]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateAdminMediaMetadata(mediaId, {
        work: {
          ...work,
          series_order: work.series_order ? Number(work.series_order) : null,
        },
        edition: {
          ...edition,
          release_year: edition.release_year ? Number(edition.release_year) : null,
        },
      });
      clearCachedCatalogue();
      inspectorCache.clear();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save metadata");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-xs p-4">
      <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div>
            <div className="text-xs font-medium text-slate-500">
              Edit media & work metadata
            </div>
            <h2 className="font-serif text-xl font-medium text-slate-900 truncate max-w-xl">
              {edition.title || "Loading..."}
            </h2>
            {sourceFilename && (
              <div className="text-xs text-slate-400">Source: {sourceFilename}</div>
            )}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer">
            ✕ Close
          </button>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading metadata...</div>
        ) : (
          <AdminImportAuditForm
            work={work}
            edition={edition}
            onWorkChange={(field, value) => setWork((c) => ({ ...c, [field]: value }))}
            onEditionChange={(field, value) => setEdition((c) => ({ ...c, [field]: value }))}
            onSeriesChange={(sId, sName) => setWork((c) => ({ ...c, series_id: sId, series_name: sName }))}
          />
        )}

        <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button type="button" disabled={saving} onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
          <button type="button" disabled={loading || saving} onClick={handleSave} className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-600 cursor-pointer disabled:opacity-50 transition">
            {saving ? "Saving..." : "Save metadata"}
          </button>
        </div>
      </div>
    </div>
  );
};
