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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border-2 border-[#111111] bg-white p-6 shadow-[6px_6px_0px_#111111] space-y-5">
        <div className="flex items-center justify-between border-b border-[#111111] pb-3">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
              Edit Ingested Book & Umbrella Work Metadata
            </div>
            <h2 className="font-serif text-lg font-bold text-[#111111] truncate max-w-xl">
              {edition.title || "Loading..."}
            </h2>
            {sourceFilename && (
              <div className="font-mono text-[11px] text-[#555555]">Source file: {sourceFilename}</div>
            )}
          </div>
          <button type="button" onClick={onClose} className="border border-[#111111] px-3 py-1 font-mono text-xs hover:bg-[#F0F0ED] cursor-pointer">
            ✕ Cancel
          </button>
        </div>

        {error && <div className="border border-red-600 bg-red-50 p-2 font-mono text-xs font-bold text-red-700">{error}</div>}

        {loading ? (
          <div className="py-12 text-center font-mono text-xs text-[#666666]">Loading metadata from database...</div>
        ) : (
          <AdminImportAuditForm
            work={work}
            edition={edition}
            onWorkChange={(field, value) => setWork((c) => ({ ...c, [field]: value }))}
            onEditionChange={(field, value) => setEdition((c) => ({ ...c, [field]: value }))}
            onSeriesChange={(sId, sName) => setWork((c) => ({ ...c, series_id: sId, series_name: sName }))}
          />
        )}

        <div className="flex justify-end gap-3 border-t border-[#111111] pt-4">
          <button type="button" disabled={saving} onClick={onClose} className="border border-[#CCCCCC] px-4 py-2 font-mono text-xs text-[#666666] hover:bg-[#F5F5F3] cursor-pointer">
            Cancel
          </button>
          <button type="button" disabled={loading || saving} onClick={handleSave} className="border border-[#111111] bg-[#B8FF01] px-5 py-2 font-mono text-xs font-bold text-[#111111] cursor-pointer shadow-[2px_2px_0px_#111111] disabled:opacity-50">
            {saving ? "Saving..." : "Save Metadata ✓"}
          </button>
        </div>
      </div>
    </div>
  );
};
