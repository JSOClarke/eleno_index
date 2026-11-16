import React, { useMemo } from "react";
import type { QuarantineItem } from "@/types/vocabulary.types";

interface QuarantineGridProps {
  items: QuarantineItem[];
  loading: boolean;
  mode: "characters" | "noise";
}

export const QuarantineGrid: React.FC<QuarantineGridProps> = ({
  items,
  loading,
  mode,
}) => {
  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (mode === "characters") return item.category === "proper_noun";
      return item.category !== "proper_noun";
    });
  }, [items, mode]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
        {Array.from({ length: 18 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200/80 bg-white p-3 h-14 animate-pulse flex flex-col justify-between"
          >
            <div className="h-3 w-2/3 rounded bg-slate-100" />
            <div className="h-2.5 w-1/3 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-xs text-slate-500">
        No {mode === "characters" ? "proper nouns / character names" : "filtered noise tokens"}{" "}
        recorded for this work.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500">
        {mode === "characters"
          ? "Proper nouns & character names isolated from your lexical score so they never skew comprehension:"
          : "Interjections, onomatopoeia & OCR fragments quarantined during ingestion:"}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        {filtered.slice(0, 120).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-xs shadow-xs"
          >
            <span className="font-semibold text-slate-900 truncate mr-2">
              {item.token}
            </span>
            <span className="text-slate-400 tabular-nums shrink-0">
              {item.frequency}×
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
