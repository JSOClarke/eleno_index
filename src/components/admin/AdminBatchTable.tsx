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
    <div className="overflow-x-auto border border-[#111111] bg-white">
      <div className="flex items-center justify-between border-b border-[#111111] bg-[#F4F4F2] px-3 py-2">
        <span className="font-mono text-[11px] font-bold text-[#111111]">
          Staged Books ({jobs.length})
        </span>
        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="border border-[#CCCCCC] bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-[#666666] hover:border-red-600 hover:text-red-700 cursor-pointer"
          >
            Clear All Staged ✕
          </button>
        )}
      </div>
      <table className="w-full border-collapse text-left font-mono text-xs">
        <thead className="border-b border-[#111111] bg-[#FAFAF8] text-[11px] font-bold text-[#444444]">
          <tr>
            <th className="p-3 w-8">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="cursor-pointer"
              />
            </th>
            <th className="p-3">Book & Author</th>
            <th className="p-3">Series / Franchise</th>
            <th className="p-3 text-right">Words</th>
            <th className="p-3 text-center">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E5E3]">
          {jobs.map((job) => {
            const isSelected = selectedIds.has(job.id);
            const title = job.work_candidate?.original_title || job.metadata?.title || job.filename;
            const author = job.work_candidate?.creator || job.metadata?.author || "Unknown";
            const series = job.work_candidate?.series_name || null;
            const isPending = job.status === "staged" || job.status === "ready";
            const isRunning = job.status === "queued" || job.status === "processing";

            return (
              <tr key={job.id} className={`hover:bg-[#FAF9F6] ${isSelected ? "bg-[#F7FCE8]" : ""}`}>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isRunning}
                    onChange={() => onToggleSelect(job.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-3">
                  <div className="font-serif text-sm font-bold text-[#111111] truncate max-w-xs">{title}</div>
                  <div className="text-[11px] text-[#666666]">{author}</div>
                  <div className="text-[10px] text-[#999999] truncate max-w-xs">{job.filename}</div>
                </td>
                <td className="p-3 text-[#555555]">
                  {series ? (
                    <span className="inline-block border border-[#CCCCCC] bg-[#EEEEEC] px-1.5 py-0.5 text-[10px] font-semibold text-[#333333]">
                      {series} {job.work_candidate?.series_order ? `#${job.work_candidate.series_order}` : ""}
                    </span>
                  ) : (
                    <span className="text-[#AAAAAA] italic text-[11px]">Standalone</span>
                  )}
                </td>
                <td className="p-3 text-right text-[#555555]">
                  {job.word_count ? job.word_count.toLocaleString() : "—"}
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      job.status === "completed"
                        ? "bg-[#D4EDDA] text-[#155724] border border-[#C3E6CB]"
                        : job.status === "processing"
                        ? "bg-[#B8FF01] text-[#111111] animate-pulse border border-[#111111]"
                        : job.status === "queued"
                        ? "bg-[#CCE5FF] text-[#004085] border border-[#B8DAFF]"
                        : job.status === "failed"
                        ? "bg-[#F8D7DA] text-[#721C24] border border-[#F5C6CB]"
                        : "bg-[#E2E3E5] text-[#383D41] border border-[#D6D8DB]"
                    }`}
                  >
                    {job.status === "ready" ? "staged" : job.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => onAuditJob(job)}
                        className="border border-[#111111] bg-white px-2 py-1 text-[11px] font-bold text-[#111111] hover:bg-[#F0F0ED] cursor-pointer"
                      >
                        Audit
                      </button>
                    )}
                    {!isRunning && (
                      <button
                        type="button"
                        onClick={() => onDeleteJob(job.id)}
                        title="Remove from batch"
                        className="border border-transparent px-2 py-1 text-[11px] text-[#999999] hover:border-red-500 hover:text-red-700 cursor-pointer"
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
