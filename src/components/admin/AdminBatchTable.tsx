import React from "react";
import type { AdminImportJob } from "@/types/adminImport.types";

interface AdminBatchTableProps {
  jobs: AdminImportJob[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onAuditJob: (job: AdminImportJob) => void;
  onDeleteJob: (id: string) => void;
  onClearAll?: () => void;
}

export const AdminBatchTable: React.FC<AdminBatchTableProps> = ({
  jobs,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onAuditJob,
  onDeleteJob,
  onClearAll,
}) => {
  const allSelected = jobs.length > 0 && jobs.every((j) => selectedIds.has(j.id));

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-4 py-2.5">
        <span className="text-xs font-semibold text-slate-900">
          Staged Media ({jobs.length})
        </span>
        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-red-300 hover:text-red-700 cursor-pointer transition"
          >
            Clear all
          </button>
        )}
      </div>
      <table className="w-full border-collapse text-left text-xs">
        <thead className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-medium text-slate-500">
          <tr>
            <th className="p-3 w-8">
              <input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} className="rounded accent-slate-900 cursor-pointer" />
            </th>
            <th className="p-3">Title & Creator</th>
            <th className="p-3">Series / Franchise</th>
            <th className="p-3 text-right">Words</th>
            <th className="p-3 text-center">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {jobs.map((job) => {
            const isSelected = selectedIds.has(job.id);
            const title = job.work_candidate?.title_en || job.work_candidate?.original_title || job.metadata?.title || job.filename;
            const author = job.work_candidate?.creator || job.metadata?.author || "Unknown";
            const mediaType = (job.work_candidate?.type || job.metadata?.type || "book").replace(/_/g, " ");
            const series = job.work_candidate?.series_name || null;
            const isPending = job.status === "staged" || job.status === "ready";
            const isRunning = job.status === "queued" || job.status === "processing";

            return (
              <tr key={job.id} className={`transition-colors hover:bg-slate-50/70 ${isSelected ? "bg-indigo-50/40" : ""}`}>
                <td className="p-3">
                  <input type="checkbox" checked={isSelected} disabled={isRunning} onChange={() => onToggleSelect(job.id)} className="rounded accent-slate-900 cursor-pointer" />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 truncate max-w-xs">{title}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium capitalize text-slate-600">{mediaType}</span>
                  </div>
                  <div className="text-xs text-slate-500">{author}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-xs">{job.filename}</div>
                </td>
                <td className="p-3 text-slate-600">
                  {series ? (
                    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                      {series} {job.work_candidate?.series_order ? `#${job.work_candidate.series_order}` : ""}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Standalone</span>
                  )}
                </td>
                <td className="p-3 text-right tabular-nums text-slate-600">
                  {job.word_count ? job.word_count.toLocaleString() : "—"}
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                      job.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : job.status === "processing"
                        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 animate-pulse"
                        : job.status === "queued"
                        ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
                        : job.status === "failed"
                        ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {job.status === "ready" ? "staged" : job.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => onAuditJob(job)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Audit
                      </button>
                    )}
                    {!isRunning && (
                      <button
                        type="button"
                        onClick={() => onDeleteJob(job.id)}
                        title="Remove from batch"
                        className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
