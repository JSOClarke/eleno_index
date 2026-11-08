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
    <div className="flex flex-wrap items-center justify-between gap-4 border border-[#111111] bg-[#F8F8F6] p-4">
      <div className="space-y-1.5">
        <div className="font-mono text-xs text-[#555555]">
          {selectedWork
            ? `Linking edition to existing work: ${selectedWork.title_en || selectedWork.original_title}`
            : "Creating a new work from the audited metadata above."}
        </div>
        <label className="flex items-center gap-2 font-mono text-xs text-[#111111] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={skipReader}
            onChange={(e) => onToggleSkipReader(e.target.checked)}
            className="cursor-pointer"
          />
          <span className="font-bold">
            Skip reader pre-tokenization
          </span>
          <span className="text-[#666666]">
            (fast mode: metrics, CEFR, vocabulary & sentence bank only)
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={onCommit}
        disabled={committing}
        className="border border-[#111111] bg-[#B8FF01] px-5 py-2.5 font-mono text-xs font-bold disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#111111]"
      >
        {committing ? "Starting..." : "Commit ingestion →"}
      </button>
    </div>
  );
};
