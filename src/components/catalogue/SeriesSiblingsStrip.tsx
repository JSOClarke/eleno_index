import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { MediaCatalogItem } from "@/types/media.types";

interface SeriesSiblingsStripProps {
  currentId: string;
  seriesName?: string | null;
  siblings?: MediaCatalogItem[];
  isAuthenticated: boolean;
}

export const SeriesSiblingsStrip: React.FC<SeriesSiblingsStripProps> = ({
  currentId,
  seriesName,
  siblings,
  isAuthenticated,
}) => {
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(() => {
    if (!siblings || siblings.length < 2) return [];
    return [...siblings].sort((a, b) => {
      const oa = a.series_order ?? Number.MAX_SAFE_INTEGER;
      const ob = b.series_order ?? Number.MAX_SAFE_INTEGER;
      if (oa !== ob) return oa - ob;
      return (a.work_title || a.title).localeCompare(b.work_title || b.title);
    });
  }, [siblings]);

  if (sorted.length < 2) return null;

  let visible = sorted;
  if (!expanded && sorted.length > 4) {
    const idx = sorted.findIndex((s) => s.id === currentId);
    const keep = new Set<number>([0]);
    if (idx > 0) keep.add(idx - 1);
    if (idx >= 0) keep.add(idx);
    if (idx >= 0 && idx + 1 < sorted.length) keep.add(idx + 1);
    let fill = 1;
    while (keep.size < 4 && fill < sorted.length) keep.add(fill++);
    visible = Array.from(keep).sort((a, b) => a - b).map((i) => sorted[i]);
  }
  const hiddenCount = sorted.length - visible.length;

  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-medium text-slate-400">
        {seriesName ? `In ${seriesName}` : "In this series"} ({sorted.length})
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {visible.map((sib) => {
          const isCurrent = sib.id === currentId;
          const label = sib.work_title || sib.title;
          const prefix = sib.series_order != null ? `#${sib.series_order} ` : "";
          const flowPct = sib.comprehension?.text_coverage_percentage ?? sib.comprehension?.comprehension_percentage;
          const pctBadge = isAuthenticated && flowPct != null ? (
            <span className={isCurrent ? "text-emerald-300" : "text-emerald-700 font-semibold"}>
              · {Math.round(flowPct)}%
            </span>
          ) : null;

          if (isCurrent) {
            return (
              <span
                key={sib.id}
                title={label}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-white"
              >
                <span className="max-w-[140px] truncate">{prefix}{label}</span>
                {pctBadge}
              </span>
            );
          }

          return (
            <Link
              key={sib.id}
              to={`/media/${sib.id}`}
              onClick={(e) => e.stopPropagation()}
              title={label}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/70 px-2 py-0.5 text-[11px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
            >
              <span className="max-w-[140px] truncate">{prefix}{label}</span>
              {pctBadge}
            </Link>
          );
        })}
        {sorted.length > 4 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="rounded-lg px-2 py-0.5 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 cursor-pointer"
          >
            {expanded ? "Show less" : `+${hiddenCount} more`}
          </button>
        )}
      </div>
    </div>
  );
};
