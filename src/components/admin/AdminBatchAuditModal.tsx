import React, { useState } from "react";
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

  const handleSave = () => {
    const updatedJob: AdminImportJob = {
      ...job,
      work_id: selectedWork?.id || job.work_id,
      work_candidate: {
        ...job.work_candidate,
        ...work,
        series_id: work.series_id || undefined,
        series_order: work.series_order ? Number(work.series_order) : null,
        series_label: work.series_label || (work.series_order ? `Book ${work.series_order}` : null),
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
    onSave(updatedJob);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border-2 border-[#111111] bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#111111] pb-3">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
              Audit Staged Book Metadata
            </div>
            <h2 className="font-serif text-lg font-bold text-[#111111] truncate max-w-xl">
              {job.filename}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#111111] px-3 py-1 font-mono text-xs hover:bg-[#F0F0ED] cursor-pointer"
          >
            ✕ Cancel
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

        <div className="flex justify-end gap-3 border-t border-[#111111] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="border border-[#CCCCCC] px-4 py-2 font-mono text-xs text-[#666666] hover:bg-[#F5F5F3] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="border border-[#111111] bg-[#B8FF01] px-5 py-2 font-mono text-xs font-bold text-[#111111] cursor-pointer shadow-[2px_2px_0px_#111111]"
          >
            Save Audited Metadata ✓
          </button>
        </div>
      </div>
    </div>
  );
};
