import React from "react";
import type { AdminWorkMatch } from "@/types/adminImport.types";

interface AdminCommitBarProps {
  selectedWork: AdminWorkMatch | null;
  skipReader: boolean;
  onToggleSkipReader: (skip: boolean) => void;
  committing: boolean;
  onCommit: () => void;
}

export const AdminCommitBar: React.FC<AdminCommitBarProps> = ({
  selectedWork,
  skipReader,
  onToggleSkipReader,
  committing,
  onCommit,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
      <div className="space-y-1.5">
        <div className="text-xs text-slate-600">
          {selectedWork
            ? `Linking edition to existing work: ${selectedWork.title_en || selectedWork.original_title}`
            : "Creating a new work from the audited metadata above."}
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={skipReader}
            onChange={(e) => onToggleSkipReader(e.target.checked)}
            className="rounded accent-slate-900 cursor-pointer"
          />
          <span className="font-medium">
            Skip reader pre-tokenization
          </span>
          <span className="text-slate-400">
            (fast mode: metrics, CEFR, vocabulary & sentence bank only)
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={onCommit}
        disabled={committing}
        className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-600 transition disabled:opacity-50 cursor-pointer shadow-xs"
      >
        {committing ? "Starting..." : "Commit ingestion →"}
      </button>
    </div>
  );
};
