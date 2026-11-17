import React, { useState } from "react";
import { updateStagedImport } from "@/api/adminImport.api";
import { AdminImportAuditForm } from "@/components/admin/AdminImportAuditForm";
import { AdminWorkMatchPanel } from "@/components/admin/AdminWorkMatchPanel";
import type {
  AdminEditionDraft,
  AdminImportJob,
  AdminWorkDraft,
  AdminWorkMatch,
} from "@/types/adminImport.types";

interface AdminBatchAuditModalProps {
  job: AdminImportJob;
  onSave: (job: AdminImportJob) => void;
  onClose: () => void;
}

export const AdminBatchAuditModal: React.FC<AdminBatchAuditModalProps> = ({
  job,
  onSave,
  onClose,
}) => {
  const cand = job.work_candidate || {};
  const src = job.edition_candidate || {};

  const [work, setWork] = useState<AdminWorkDraft>({
    original_title: cand.original_title || job.metadata.title || "",
    title_en: cand.title_en || cand.original_title || job.metadata.title || "",
    creator: cand.creator || job.metadata.author || "",
    original_language: cand.original_language || job.metadata.language || "en",
    type: cand.type || job.metadata.type || "book",
    synopsis_en: cand.synopsis_en || cand.synopsis || "",
    series_id: cand.series_id || undefined,
    series_name: cand.series_name || "",
    series_order: cand.series_order != null ? String(cand.series_order) : "",
    series_label: cand.series_label || "",
  });

  const [edition, setEdition] = useState<AdminEditionDraft>({
    title: src.title || job.metadata.title || "",
    author: src.creator || job.metadata.author || "",
    language: src.language || job.metadata.language || "es",
    synopsis: src.synopsis || job.metadata.synopsis || "",
    release_year: src.release_year != null ? String(src.release_year) : "",
  });

  const [selectedWork, setSelectedWork] = useState<AdminWorkMatch | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const updatedFields = {
      work_id: selectedWork?.id || job.work_id,
      work_candidate: {
        ...job.work_candidate,
        ...work,
        series_id: work.series_id || undefined,
        series_order: work.series_order ? Number(work.series_order) : null,
        series_label: work.series_label || (work.series_order ? `${work.type === "tv_show" ? "Season" : "Book"} ${work.series_order}` : null),
        synopsis_en: work.synopsis_en,
        title_en: work.title_en || work.original_title,
      },
      edition_candidate: {
        ...job.edition_candidate,
        title: edition.title,
        creator: edition.author,
        language: edition.language,
        synopsis: edition.synopsis,
        release_year: edition.release_year ? Number(edition.release_year) : null,
      },
    };
    setSaving(true);
    try {
      const saved = await updateStagedImport(job.id, updatedFields);
      onSave(saved);
    } catch {
      onSave({ ...job, ...updatedFields });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-xs p-4">
      <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <div className="text-xs font-medium text-slate-500">Audit staged metadata</div>
            <h2 className="font-serif text-xl font-medium text-slate-900 truncate max-w-xl">{job.filename}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer">
            ✕ Close
          </button>
        </div>

        <AdminImportAuditForm
          work={work}
          edition={edition}
          onWorkChange={(field, value) => setWork((c) => ({ ...c, [field]: value }))}
          onEditionChange={(field, value) => setEdition((c) => ({ ...c, [field]: value }))}
          onSeriesChange={(sId, sName) => setWork((c) => ({ ...c, series_id: sId, series_name: sName }))}
        />

        <AdminWorkMatchPanel
          initialMatches={job.work_matches || []}
          selectedWorkId={selectedWork?.id || null}
          onSelect={setSelectedWork}
        />

        <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
          <button type="button" disabled={saving} onClick={() => void handleSave()} className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-600 cursor-pointer disabled:opacity-50 transition">
            {saving ? "Saving..." : "Save metadata"}
          </button>
        </div>
      </div>
    </div>
  );
};
