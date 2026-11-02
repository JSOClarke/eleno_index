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
      if (mode === "characters") return item.reason === "PROPER_NOUN";
      return item.reason !== "PROPER_NOUN";
    });
  }, [items, mode]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
        {Array.from({ length: 18 }).map((_, idx) => (
          <div
            key={idx}
            className="border border-[#E2E2DF] bg-[#F8F8F6] p-3 h-16 animate-pulse flex flex-col justify-between"
          >
            <div className="h-3 w-2/3 bg-[#E2E2DF]" />
            <div className="h-2.5 w-1/3 bg-[#E2E2DF]" />
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="border border-[#E2E2DF] bg-[#F8F8F6] p-8 text-center font-mono text-xs text-[#666666]">
        No {mode === "characters" ? "proper nouns / character names" : "filtered noise tokens"}{" "}
        recorded for this work.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="font-mono text-xs text-[#666666]">
        {mode === "characters"
          ? "Proper nouns & character names isolated from your lexical score so they never skew comprehension:"
          : "Interjections, onomatopoeia & OCR fragments quarantined during ingestion:"}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        {filtered.slice(0, 120).map((item) => (
          <div
            key={item.id}
            className="border border-[#111111] bg-white p-3 flex items-center justify-between font-mono text-xs"
          >
            <span className="font-bold text-[#111111] truncate mr-2">
              {item.surface_form}
            </span>
            <span className="text-[#666666] tabular-nums shrink-0">
              {item.frequency}x
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
