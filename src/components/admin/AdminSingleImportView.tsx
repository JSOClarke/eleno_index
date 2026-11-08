import React, { useEffect, useState } from "react";
import { commitImport, fetchImport, uploadImport } from "@/api/adminImport.api";
import { AdminCommitBar } from "@/components/admin/AdminCommitBar";
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
  synopsis_en: "", series_id: undefined, series_name: "", series_order: "", series_label: "",
};

const emptyEdition: AdminEditionDraft = {
  title: "", author: "", language: "es", synopsis: "", release_year: "",
};

export const AdminSingleImportView: React.FC = () => {
  const [job, setJob] = useState<AdminImportJob | null>(null);
  const [work, setWork] = useState<AdminWorkDraft>(emptyWork);
  const [edition, setEdition] = useState<AdminEditionDraft>(emptyEdition);
  const [selectedWork, setSelectedWork] = useState<AdminWorkMatch | null>(null);
  const [skipReader, setSkipReader] = useState(false);
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
      const cand = next.work_candidate || {};
      const src = next.edition_candidate || {};
      setWork({
        original_title: cand.original_title || next.metadata.title || "",
        title_en: cand.title_en || cand.original_title || next.metadata.title || "",
        creator: cand.creator || next.metadata.author || "",
        original_language: cand.original_language || next.metadata.language || "en",
        synopsis_en: cand.synopsis_en || cand.synopsis || "",
        series_id: cand.series_id || undefined,
        series_name: cand.series_name || "",
        series_order: cand.series_order != null ? String(cand.series_order) : "",
        series_label: cand.series_label || "",
      });
      setEdition({
        title: src.title || next.metadata.title || "",
        author: src.creator || next.metadata.author || "",
        language: src.language || next.metadata.language || "es",
        synopsis: src.synopsis || next.metadata.synopsis || "",
        release_year: src.release_year != null ? String(src.release_year) : "",
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
        series_id: work.series_id || undefined,
        series_order: work.series_order ? Number(work.series_order) : null,
        series_label: work.series_label || (work.series_order ? `Book ${work.series_order}` : null),
        synopsis: work.synopsis_en,
        title_en: work.title_en || work.original_title,
      };
      const next = await commitImport(job.id, {
        work_id: selectedWork?.id,
        work: selectedWork ? undefined : workPayload,
        edition: { ...edition, release_year: edition.release_year ? Number(edition.release_year) : null },
        skip_reader: skipReader,
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
    <div className="space-y-5">
      <AdminImportUpload uploading={uploading} onUpload={(file) => void handleUpload(file)} />
      {error && <div className="border border-red-600 bg-white p-3 font-mono text-xs text-red-700">{error}</div>}
      {job && <AdminImportStatus job={job} />}

      {job && ready && (
        <>
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
          <AdminCommitBar
            selectedWork={selectedWork}
            skipReader={skipReader}
            onToggleSkipReader={setSkipReader}
            committing={committing}
            onCommit={() => void handleCommit()}
          />
        </>
      )}
    </div>
  );
};
