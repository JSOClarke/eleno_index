import React, { useEffect, useMemo, useState } from "react";
import {
  matchesStatusFilter,
  sortPrimerWords,
  type PrimerSortField,
  type RankingSourceKey,
  type SortDirection,
  type VocabStatusFilter,
} from "@/lib/vocabSorting";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";
import { RedesignPrimerFilterBar } from "./RedesignPrimerFilterBar";
import { RedesignPrimerRow } from "./RedesignPrimerRow";

interface RedesignPrimerTableProps {
  words: VocabularyWord[];
  selectedChapter: number | "all";
  onClearChapter: () => void;
  statusMap: Record<string, UserVocabStatus>;
  onToggleStatus: (canonicalId: string, target: UserVocabStatus) => void;
}

const PAGE_SIZE = 20;

export const RedesignPrimerTable: React.FC<RedesignPrimerTableProps> = ({
  words,
  selectedChapter,
  onClearChapter,
  statusMap,
  onToggleStatus,
}) => {
  const [query, setQuery] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<VocabStatusFilter>("ALL");
  const [rankingSource, setRankingSource] = useState<RankingSourceKey>("tubelex_v2025");
  const [sortField, setSortField] = useState<PrimerSortField>("frequency");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [selectedChapter]);

  const chapterScoped = useMemo(
    () => (selectedChapter === "all" ? words : words.filter((w) => w.first_occurrence_index === selectedChapter)),
    [words, selectedChapter]
  );

  const statusCounts = useMemo(() => {
    let known = 0, learning = 0, unknown = 0;
    for (const w of chapterScoped) {
      const s = statusMap[w.canonical_id];
      if (s === "known") known++;
      else if (s === "learning") learning++;
      else unknown++;
    }
    return { ALL: chapterScoped.length, UNKNOWN: unknown, LEARNING: learning, KNOWN: known };
  }, [chapterScoped, statusMap]);

  const sortedAndFiltered = useMemo(() => {
    const base = chapterScoped.filter((w) => {
      if (!matchesStatusFilter(statusMap[w.canonical_id], statusFilter)) return false;
      if (posFilter !== "ALL" && w.pos !== posFilter) return false;
      if (query.trim() && !w.lemma.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    return sortPrimerWords(base, sortField, sortDir, rankingSource);
  }, [chapterScoped, statusMap, statusFilter, posFilter, query, sortField, sortDir, rankingSource]);

  const toggleSort = (field: PrimerSortField, defaultDir: SortDirection = "asc") => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir(defaultDir); }
    setPage(1);
  };

  const changeSort = (value: string) => {
    const [field, dir] = value.split(":") as [PrimerSortField, SortDirection];
    setSortField(field);
    setSortDir(dir);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(sortedAndFiltered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = sortedAndFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const isEpisodeMode = /^\d+x\d+/i.test(words[0]?.first_context_snippet || "");
  const arrow = (f: PrimerSortField) => (sortField === f ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕");

  return (
    <div className="space-y-3">
      <RedesignPrimerFilterBar
        query={query}
        onQueryChange={(v) => { setQuery(v); setPage(1); }}
        statusFilter={statusFilter}
        onStatusFilter={(v) => { setStatusFilter(v); setPage(1); }}
        statusCounts={statusCounts}
        posFilter={posFilter}
        onPosFilter={(v) => { setPosFilter(v); setPage(1); }}
        rankingSource={rankingSource}
        onRankingSource={setRankingSource}
        selectedChapter={selectedChapter}
        onClearChapter={onClearChapter}
        isEpisodeMode={isEpisodeMode}
        sortValue={`${sortField}:${sortDir}`}
        onSortChange={changeSort}
        resultCount={sortedAndFiltered.length}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="hidden grid-cols-12 gap-3 border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 md:grid">
          <button type="button" onClick={() => toggleSort("lemma", "asc")} className="col-span-2 text-left hover:text-slate-900 cursor-pointer">Lemma{arrow("lemma")}</button>
          <div className="col-span-2">IPA</div>
          <button type="button" onClick={() => toggleSort("pos", "asc")} className="col-span-1 text-left hover:text-slate-900 cursor-pointer">POS{arrow("pos")}</button>
          <button type="button" onClick={() => toggleSort("cefr", "asc")} className="col-span-1 text-left hover:text-slate-900 cursor-pointer">CEFR{arrow("cefr")}</button>
          <button type="button" onClick={() => toggleSort("frequency", "desc")} className="col-span-1 text-left hover:text-slate-900 cursor-pointer">Freq{arrow("frequency")}</button>
          <button type="button" onClick={() => toggleSort("rank", "asc")} className="col-span-1 text-left hover:text-slate-900 cursor-pointer">{rankingSource === "tubelex_v2025" ? "TubeLex" : "ELELex"}{arrow("rank")}</button>
          <button type="button" onClick={() => toggleSort("debut", "asc")} className="col-span-2 text-left hover:text-slate-900 cursor-pointer">{isEpisodeMode ? "Debut Episode" : "Debut Chapter"}{arrow("debut")}</button>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-slate-100">
          {slice.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No matching canonical lemmas.</div>
          ) : (
            slice.map((w) => (
              <RedesignPrimerRow
                key={w.canonical_id}
                word={w}
                rankingSource={rankingSource}
                status={statusMap[w.canonical_id]}
                onToggleStatus={onToggleStatus}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1 text-xs sm:flex-row sm:items-center sm:justify-between text-slate-500">
        <span>
          Showing {sortedAndFiltered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sortedAndFiltered.length)} of {sortedAndFiltered.length} lemmas
        </span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 disabled:opacity-40 cursor-pointer hover:bg-slate-50">← Prev</button>
          <span>Page {safePage} / {totalPages}</span>
          <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 disabled:opacity-40 cursor-pointer hover:bg-slate-50">Next →</button>
        </div>
      </div>
    </div>
  );
};
