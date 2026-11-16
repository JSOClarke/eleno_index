import React from "react";
import { Search, X } from "lucide-react";
import type { RankingSourceKey, VocabStatusFilter } from "@/lib/vocabSorting";

interface RedesignPrimerFilterBarProps {
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

export const RedesignPrimerFilterBar: React.FC<RedesignPrimerFilterBarProps> = ({
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
    <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search canonical lemma..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-400 focus:bg-white"
          />
        </div>

        {selectedChapter !== "all" && (
          <button
            type="button"
            onClick={onClearChapter}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 cursor-pointer"
          >
            <span>Debut in {isEpisodeMode ? `Ep.${selectedChapter}` : `Ch.${selectedChapter}`}</span>
            <X className="h-3 w-3" />
          </button>
        )}

        <div className="flex max-w-full items-center overflow-x-auto rounded-full border border-slate-200 bg-slate-50 p-0.5 text-[11px]">
          {(["ALL", "UNKNOWN", "LEARNING", "KNOWN"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStatusFilter(st)}
              className={`rounded-full px-2.5 py-1 cursor-pointer transition ${
                statusFilter === st
                  ? "bg-slate-900 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {st} ({statusCounts[st]})
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
          {([["tubelex_v2025", "TubeLex"], ["elelex_v2020", "ELELex"]] as const).map(([src, label]) => (
            <button
              key={src}
              type="button"
              onClick={() => onRankingSource(src)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium cursor-pointer transition ${
                rankingSource === src ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={posFilter}
          onChange={(e) => onPosFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none"
        >
          <option value="ALL">All POS</option>
          <option value="NOUN">NOUN</option>
          <option value="VERB">VERB</option>
          <option value="ADJ">ADJ</option>
          <option value="ADV">ADV</option>
        </select>

        <span className="text-slate-500 pl-1">{resultCount} lemmas</span>
      </div>
    </div>

    <div className="flex items-center justify-between text-xs md:hidden">
      <span className="text-slate-500">Sort by</span>
      <select
        value={sortValue}
        onChange={(e) => onSortChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
      >
        <option value="frequency:desc">Frequency (High–Low)</option>
        <option value="rank:asc">Global Rank</option>
        <option value="cefr:asc">CEFR (A1–C2)</option>
        <option value="debut:asc">{isEpisodeMode ? "Debut Episode" : "Debut Chapter"}</option>
        <option value="lemma:asc">Lemma (A–Z)</option>
      </select>
    </div>
  </>
);
