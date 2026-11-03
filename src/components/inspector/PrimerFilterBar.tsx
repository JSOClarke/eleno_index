import React from "react";
import type { RankingSourceKey, VocabStatusFilter } from "@/lib/vocabSorting";

interface PrimerFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: VocabStatusFilter;
  onStatusFilter: (value: VocabStatusFilter) => void;
  statusCounts: Record<string, number>;
  posFilter: string;
  onPosFilter: (value: string) => void;
  rankingSource: RankingSourceKey;
  onRankingSource: (value: RankingSourceKey) => void;
  selectedChapter: number | "all";
  onClearChapter: () => void;
  isEpisodeMode: boolean;
  sortValue: string;
  onSortChange: (value: string) => void;
  resultCount: number;
}

/** Search, status/pos/ranking filters and the mobile-only sort control. */
export const PrimerFilterBar: React.FC<PrimerFilterBarProps> = ({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilter,
  statusCounts,
  posFilter,
  onPosFilter,
  rankingSource,
  onRankingSource,
  selectedChapter,
  onClearChapter,
  isEpisodeMode,
  sortValue,
  onSortChange,
  resultCount,
}) => (
  <>
    <div className="flex flex-wrap items-center justify-between gap-2.5 border border-[#E2E2DF] bg-[#F8F8F6] p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search canonical lemma..."
          className="w-full border border-[#111111] bg-white px-3 py-1 font-mono text-xs outline-none sm:w-52"
        />
        {selectedChapter !== "all" && (
          <button
            type="button"
            onClick={onClearChapter}
            className="border border-[#111111] bg-[#B8FF01] px-2.5 py-1 font-mono text-xs font-semibold text-[#111111] cursor-pointer"
          >
            Debut in {isEpisodeMode ? `EP.${selectedChapter}` : `CH.${selectedChapter}`} ×
          </button>
        )}
        <div className="flex max-w-full items-center overflow-x-auto border border-[#111111] font-mono text-[11px]">
          {(["ALL", "UNKNOWN", "LEARNING", "KNOWN"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStatusFilter(st)}
              className={`px-2 py-1 cursor-pointer transition-colors ${
                statusFilter === st
                  ? "bg-[#111111] text-[#B8FF01] font-semibold"
                  : "bg-white text-[#555555] hover:text-[#111111]"
              }`}
            >
              {st} ({statusCounts[st]})
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <div className="flex items-center border border-[#111111]">
          {([["tubelex_v2025", "TUBELEX"], ["elelex_v2020", "ELELEX"]] as const).map(([src, label]) => (
            <button
              key={src}
              type="button"
              onClick={() => onRankingSource(src)}
              className={`px-2.5 py-1 cursor-pointer transition-colors ${
                rankingSource === src
                  ? "bg-[#B8FF01] text-[#111111] font-semibold"
                  : "bg-white text-[#666666] hover:text-[#111111]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {["ALL", "NOUN", "VERB", "ADJ", "ADV"].map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => onPosFilter(pos)}
              className={`px-2 py-1 border cursor-pointer ${
                posFilter === pos
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#CCCCCC] bg-white text-[#111111]"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between gap-2 font-mono text-[11px] md:hidden">
      <label className="flex items-center gap-1.5 text-[#666666]">
        SORT
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="border border-[#111111] bg-white px-2 py-1 font-mono text-[11px] text-[#111111]"
        >
          <option value="frequency:desc">Frequency ↓</option>
          <option value="rank:asc">Rank ↑</option>
          <option value="lemma:asc">Lemma A–Z</option>
          <option value="cefr:asc">CEFR</option>
          <option value="debut:asc">Debut</option>
          <option value="pos:asc">POS</option>
        </select>
      </label>
      <span className="text-[#666666]">{resultCount} lemmas</span>
    </div>
  </>
);
