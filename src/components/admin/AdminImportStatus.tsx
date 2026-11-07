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

  return (
    <section className="space-y-3 border border-[#111111] bg-[#F8F8F6] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
            Import status
          </div>
          <div className="font-mono text-sm font-bold uppercase text-[#111111]">{job.status}</div>
        </div>
        <div className="font-mono text-[11px] text-[#666666]">
          {job.chapter_count ?? 0} chapters · {(job.word_count ?? 0).toLocaleString()} words
        </div>
      </div>

      {deletedTitle ? (
        <div className="border border-emerald-600 bg-emerald-50 px-3 py-2 font-mono text-[11px] text-emerald-800 font-bold">
          ✓ Existing version «{deletedTitle}» was deleted. You can now commit a fresh ingestion.
        </div>
      ) : job.existing_item ? (
        <div className="border border-amber-600 bg-amber-50 px-3 py-2 font-mono text-[11px] text-amber-800">
          <div>
            This exact file is already ingested as{" "}
            <Link to={`/media/${job.existing_item.id}`} className="font-bold underline">
              {job.existing_item.title}
            </Link>
            . Committing directly may cause checksum conflict.
          </div>
          <div className="mt-2">
            <button
              type="button"
              disabled={deleting}
              onClick={() => handleDeleteExisting(job.existing_item!.id, job.existing_item!.title)}
              className="border border-red-700 bg-red-600 px-2.5 py-1 text-white font-mono text-[10px] font-bold hover:bg-red-700 cursor-pointer shadow-[1px_1px_0px_#111111] disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Existing Version to Re-Ingest"}
            </button>
          </div>
        </div>
      ) : null}

      {job.status === "queued" || job.status === "processing" ? (
        <p className="font-mono text-xs text-[#555555]">
          Ingestion is running on the server. This page will refresh automatically.
        </p>
      ) : null}

      {job.error && (
        <div className="border border-red-600 bg-white px-3 py-2 font-mono text-[11px] text-red-700">
          {job.error}
        </div>
      )}

      {job.warnings?.length ? (
        <ul className="space-y-1 font-mono text-[11px] text-[#555555]">
          {job.warnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      ) : null}

      {job.status === "completed" && job.result && (
        <div className="border border-[#111111] bg-[#B8FF01] px-3 py-2 text-xs text-[#111111]">
          <div className="font-mono font-bold">Ingestion complete</div>
          <div className="mt-1 font-mono text-[11px]">
            {job.result.unique_words?.toLocaleString()} unique words · {job.result.tokens?.toLocaleString()} tokens ·{" "}
            reader: {job.result.reader_status}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {job.work_id && (
              <Link to={`/work/${job.work_id}`} className="border border-[#111111] bg-white px-2 py-1 font-mono text-[11px] font-bold">
                Open work →
              </Link>
            )}
            {job.result.media_item_id && (
              <Link to={`/media/${job.result.media_item_id}`} className="border border-[#111111] bg-white px-2 py-1 font-mono text-[11px] font-bold">
                Open edition →
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
