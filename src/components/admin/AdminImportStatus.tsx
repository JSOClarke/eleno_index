import React, { useState } from "react";
import { Link } from "react-router-dom";
import { deleteCatalogueMediaItem } from "@/api/adminImport.api";
import type { AdminImportJob } from "@/types/adminImport.types";

interface AdminImportStatusProps {
  job: AdminImportJob;
  onExistingDeleted?: () => void;
}

export const AdminImportStatus: React.FC<AdminImportStatusProps> = ({ job, onExistingDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [deletedTitle, setDeletedTitle] = useState<string | null>(null);

  const handleDeleteExisting = async (mediaId: string, title: string) => {
    if (!window.confirm(`Permanently delete existing «${title}» from catalogue to re-ingest?`)) return;
    setDeleting(true);
    try {
      await deleteCatalogueMediaItem(mediaId, true);
      setDeletedTitle(title);
      onExistingDeleted?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete existing item");
    } finally {
      setDeleting(false);
    }
  };

  const unitLabel = job.metadata?.type === "tv_show" ? "episodes" : job.metadata?.type === "movie" ? "scenes" : "chapters";

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-slate-500">Status</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-800">{job.status}</span>
        </div>
        <div className="text-xs text-slate-500 tabular-nums">
          {job.chapter_count ?? 0} {unitLabel} · {(job.word_count ?? 0).toLocaleString()} words
        </div>
      </div>

      {deletedTitle ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800">
          ✓ Existing version «{deletedTitle}» was deleted. You can now commit a fresh ingestion.
        </div>
      ) : job.existing_item ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
          <div>
            This exact file is already ingested as{" "}
            <Link to={`/media/${job.existing_item.id}`} className="font-semibold underline">
              {job.existing_item.title}
            </Link>
            . Committing directly may cause a checksum conflict.
          </div>
          <div className="mt-2">
            <button
              type="button"
              disabled={deleting}
              onClick={() => handleDeleteExisting(job.existing_item!.id, job.existing_item!.title)}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-700 cursor-pointer disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Existing Version to Re-Ingest"}
            </button>
          </div>
        </div>
      ) : null}

      {job.status === "queued" || job.status === "processing" ? (
        <p className="text-xs text-slate-500">
          Ingestion is running on the server. This page will refresh automatically.
        </p>
      ) : null}

      {job.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
          {job.error}
        </div>
      )}

      {job.warnings?.length ? (
        <ul className="space-y-1 text-xs text-slate-500">
          {job.warnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      ) : null}

      {job.status === "completed" && job.result && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs text-slate-800">
          <div className="font-semibold text-emerald-800">Ingestion complete</div>
          <div className="mt-1 text-slate-600">
            {job.result.unique_words?.toLocaleString()} unique words · {job.result.tokens?.toLocaleString()} tokens
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {job.work_id && (
              <Link to={`/work/${job.work_id}`} className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                Open work →
              </Link>
            )}
            {job.result.media_item_id && (
              <Link to={`/media/${job.result.media_item_id}`} className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-600">
                Inspect vocab →
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
