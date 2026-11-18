import React from "react";
import type { MediaChapterMetrics } from "@/types/media.types";

interface ReadflowChapterPacingProps {
  chapters: MediaChapterMetrics[];
  loading: boolean;
  selectedChapter: number | "all";
  onSelectChapter: (ch: number | "all") => void;
}

export const ReadflowChapterPacing: React.FC<ReadflowChapterPacingProps> = ({
  chapters, loading, selectedChapter, onSelectChapter,
}) => {
  if (!loading && chapters.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl border border-[#ECECEF] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-xl bg-[#D8D6FA] text-[11px] font-extrabold uppercase tracking-wider text-[#040404]">
            Chapter Pacing
          </span>
          <h2 className="font-editorial text-3xl text-[#040404]">Coverage across chapters</h2>
        </div>
        <button
          type="button"
          onClick={() => onSelectChapter("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
            selectedChapter === "all"
              ? "bg-[#040404] text-white"
              : "bg-[#FAFAFA] border border-[#ECECEF] text-[#5A595C] hover:text-[#040404]"
          }`}
        >
          All Chapters ({chapters.length})
        </button>
      </div>

      {loading ? (
        <div className="h-24 rounded-2xl bg-[#FAFAFA] animate-pulse" />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {chapters.map((ch) => {
            const cov = ch.user_comprehension?.text_coverage_percentage ?? ch.user_comprehension?.chapter_comprehension_percentage;
            const active = selectedChapter === ch.chapter_index;
            const tone = cov == null ? "bg-[#FAFAFA]" : cov >= 95 ? "bg-[#E2F59B]/55" : cov >= 90 ? "bg-[#D8D6FA]/55" : "bg-[#F3E1E6]/75";
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelectChapter(active ? "all" : ch.chapter_index)}
                className={`min-w-[162px] text-left rounded-2xl p-3.5 transition-all shrink-0 cursor-pointer ${
                  active ? "ring-2 ring-[#040404] bg-white" : `${tone} hover:opacity-90`
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] font-extrabold uppercase tracking-wider text-[#040404]/70">
                  <span>Ch. {ch.chapter_index + 1}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/80 text-[#040404]">{ch.cefr_level || "—"}</span>
                </div>
                <p className="font-editorial text-3xl text-[#040404] mt-1 leading-none">
                  {cov != null ? `${cov.toFixed(1)}%` : `${(ch.total_tokens / 1000).toFixed(1)}k`}
                </p>
                {cov != null && (
                  <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-[#040404] rounded-full" style={{ width: `${Math.min(100, cov)}%` }} />
                  </div>
                )}
                <p className="text-[11px] font-semibold text-[#5A595C] truncate mt-1.5">
                  {ch.chapter_title || `Chapter ${ch.chapter_index + 1}`}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
