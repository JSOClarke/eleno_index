import React from "react";
import { Link } from "react-router-dom";
import type { AdminImportJob } from "@/types/adminImport.types";

interface AdminImportStatusProps {
  job: AdminImportJob;
}

export const AdminImportStatus: React.FC<AdminImportStatusProps> = ({ job }) => (
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

    {job.existing_item && (
      <div className="border border-amber-600 bg-amber-50 px-3 py-2 font-mono text-[11px] text-amber-800">
        This exact file is already ingested as{" "}
        <Link to={`/media/${job.existing_item.id}`} className="font-bold underline">
          {job.existing_item.title}
        </Link>
        . Committing may fail on the checksum constraint.
      </div>
    )}

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
