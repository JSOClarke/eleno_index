import React, { useEffect, useState } from "react";
import { commitImport, fetchImport, uploadImport } from "@/api/adminImport.api";
import { AdminImportAuditForm } from "@/components/admin/AdminImportAuditForm";
import { AdminImportStatus } from "@/components/admin/AdminImportStatus";
import { AdminImportUpload } from "@/components/admin/AdminImportUpload";
import { AdminWorkMatchPanel } from "@/components/admin/AdminWorkMatchPanel";
import type {
  AdminEditionDraft,
  AdminImportJob,
  AdminWorkDraft,
  AdminWorkMatch,
} from "@/types/adminImport.types";

const emptyWork: AdminWorkDraft = {
  original_title: "", title_en: "", creator: "", original_language: "en",
  synopsis_en: "", series_name: "", series_order: "", series_label: "",
};

const emptyEdition: AdminEditionDraft = {
  title: "", author: "", language: "es", synopsis: "", release_year: "",
};

export const AdminImportPage: React.FC = () => {
  const [job, setJob] = useState<AdminImportJob | null>(null);
  const [work, setWork] = useState<AdminWorkDraft>(emptyWork);
  const [edition, setEdition] = useState<AdminEditionDraft>(emptyEdition);
  const [selectedWork, setSelectedWork] = useState<AdminWorkMatch | null>(null);
  const [uploading, setUploading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!job || (job.status !== "queued" && job.status !== "processing")) return;
    const timer = window.setInterval(() => {
      fetchImport(job.id).then(setJob).catch(() => undefined);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [job?.id, job?.status]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setSelectedWork(null);
    try {
      const next = await uploadImport(file);
      setJob(next);
      const candidate = next.work_candidate || {};
      const source = next.edition_candidate || {};
      setWork({
        original_title: candidate.original_title || next.metadata.title || "",
        title_en: candidate.title_en || candidate.original_title || next.metadata.title || "",
        creator: candidate.creator || next.metadata.author || "",
        original_language: candidate.original_language || next.metadata.language || "en",
        synopsis_en: candidate.synopsis_en || candidate.synopsis || "",
        series_name: candidate.series_name || "",
        series_order: candidate.series_order != null ? String(candidate.series_order) : "",
        series_label: candidate.series_label || "",
      });
      setEdition({
        title: source.title || next.metadata.title || "",
        author: source.creator || next.metadata.author || "",
        language: source.language || next.metadata.language || "es",
        synopsis: source.synopsis || next.metadata.synopsis || "",
        release_year: source.release_year != null ? String(source.release_year) : "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCommit = async () => {
    if (!job) return;
    setCommitting(true);
    setError(null);
    try {
      const workPayload = {
        ...work,
        series_order: work.series_order ? Number(work.series_order) : null,
        synopsis: work.synopsis_en,
        title_en: work.title_en || work.original_title,
      };
      const next = await commitImport(job.id, {
        work_id: selectedWork?.id,
        work: selectedWork ? undefined : workPayload,
        edition: {
          ...edition,
          release_year: edition.release_year ? Number(edition.release_year) : null,
        },
      });
      setJob(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Commit failed");
    } finally {
      setCommitting(false);
    }
  };

  const ready = job?.status === "ready" || job?.status === "failed";

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="border-b border-[#111111] pb-3">
        <h1 className="text-xl font-bold text-[#111111]">Import Workbench</h1>
        <p className="mt-1 font-mono text-xs text-[#666666]">
          Stage an EPUB, audit its work/edition metadata, then commit it to the corpus.
        </p>
      </div>

      <AdminImportUpload uploading={uploading} onUpload={(file) => void handleUpload(file)} />
      {error && <div className="border border-red-600 bg-white p-3 font-mono text-xs text-red-700">{error}</div>}
      {job && <AdminImportStatus job={job} />}

      {job && ready && (
        <>
          <AdminImportAuditForm
            work={work}
            edition={edition}
            onWorkChange={(field, value) => setWork((current) => ({ ...current, [field]: value }))}
            onEditionChange={(field, value) => setEdition((current) => ({ ...current, [field]: value }))}
          />
          <AdminWorkMatchPanel
            initialMatches={job.work_matches || []}
            selectedWorkId={selectedWork?.id || null}
            onSelect={setSelectedWork}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border border-[#111111] bg-[#F8F8F6] p-4">
            <div className="font-mono text-xs text-[#555555]">
              {selectedWork
                ? `Linking edition to existing work: ${selectedWork.title_en || selectedWork.original_title}`
                : "Creating a new work from the audited metadata above."}
            </div>
            <button
              type="button"
              onClick={() => void handleCommit()}
              disabled={committing}
              className="border border-[#111111] bg-[#B8FF01] px-4 py-2 font-mono text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              {committing ? "Starting..." : "Commit ingestion →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
