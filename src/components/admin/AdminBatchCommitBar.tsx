import React from "react";

interface AdminBatchCommitBarProps {
  selectedCount: number;
  totalStagedCount: number;
  skipReader: boolean;
  onToggleSkipReader: (skip: boolean) => void;
  committing: boolean;
  onCommitSelected: () => void;
}

export const AdminBatchCommitBar: React.FC<AdminBatchCommitBarProps> = ({
  selectedCount,
  totalStagedCount,
  skipReader,
  onToggleSkipReader,
  committing,
  onCommitSelected,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
      <div className="space-y-1.5">
        <div className="text-xs text-slate-600">
          <span className="font-semibold text-slate-900">{selectedCount}</span> of{" "}
          <span>{totalStagedCount}</span> staged items selected for commit.
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={skipReader}
            onChange={(e) => onToggleSkipReader(e.target.checked)}
            className="rounded accent-slate-900 cursor-pointer"
          />
          <span className="font-medium">Skip reader pre-tokenization for all</span>
          <span className="text-slate-400">
            (fast mode: metrics & vocabulary only)
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={onCommitSelected}
        disabled={committing || selectedCount === 0}
        className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-600 disabled:opacity-40 cursor-pointer shadow-xs transition"
      >
        {committing
          ? "Queueing..."
          : `Commit Selected (${selectedCount}) →`}
      </button>
    </div>
  );
};
