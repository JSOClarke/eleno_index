import React from "react";
import { CloudAlert, CloudCheck, CloudOff, CloudUpload } from "lucide-react";
import type { ProgressSyncState } from "@/types/reader.types";

interface ReaderSyncBadgeProps {
  state: ProgressSyncState;
  compact?: boolean;
}

const LABELS: Record<ProgressSyncState, string> = {
  idle: "NOT SYNCED",
  saving: "SAVING",
  saved: "SYNCED",
  error: "SAVE FAILED",
};

const TONES: Record<ProgressSyncState, string> = {
  idle: "border-[#E2E2DF] text-[#888888]",
  saving: "border-[#111111] text-[#111111]",
  saved: "border-[#111111] bg-[#B8FF01] text-[#111111]",
  error: "border-red-600 text-red-600",
};

/** Live reading-progress sync state; compact mode is icon-only for phone chrome. */
export const ReaderSyncBadge: React.FC<ReaderSyncBadgeProps> = ({ state, compact = false }) => {
  const Icon =
    state === "saved"
      ? CloudCheck
      : state === "saving"
        ? CloudUpload
        : state === "error"
          ? CloudAlert
          : CloudOff;
  const label = LABELS[state];

  return (
    <span
      title={`Progress: ${label}`}
      aria-label={`Progress: ${label}`}
      className={`inline-flex shrink-0 items-center gap-1 border px-1.5 py-1 font-mono text-[10px] font-bold ${TONES[state]}`}
    >
      <Icon className={`h-3 w-3 ${state === "saving" ? "animate-pulse" : ""}`} />
      {!compact && <span>{label}</span>}
    </span>
  );
};
