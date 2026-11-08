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
    <div className="flex flex-wrap items-center justify-between gap-4 border border-[#111111] bg-[#F8F8F6] p-4">
      <div className="space-y-1.5">
        <div className="font-mono text-xs text-[#555555]">
          <span className="font-bold text-[#111111]">{selectedCount}</span> of{" "}
          <span>{totalStagedCount}</span> books selected for batch commit.
        </div>
        <label className="flex items-center gap-2 font-mono text-xs text-[#111111] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={skipReader}
            onChange={(e) => onToggleSkipReader(e.target.checked)}
            className="cursor-pointer"
          />
          <span className="font-bold">Skip reader pre-tokenization for all</span>
          <span className="text-[#666666]">
            (fast mode: 2x faster, metrics & vocabulary only)
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={onCommitSelected}
        disabled={committing || selectedCount === 0}
        className="border border-[#111111] bg-[#B8FF01] px-5 py-2.5 font-mono text-xs font-bold text-[#111111] disabled:opacity-40 cursor-pointer shadow-[2px_2px_0px_#111111] transition-transform active:translate-x-[1px] active:translate-y-[1px]"
      >
        {committing
          ? "Queueing books..."
          : `Commit Selected (${selectedCount} books) →`}
      </button>
    </div>
  );
};
