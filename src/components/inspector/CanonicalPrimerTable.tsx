import React, { useState, useMemo, useEffect } from "react";
import { VocabTableSkeleton } from "@/components/layout/VocabTableSkeleton";
import { matchesStatusFilter, sortPrimerWords, type PrimerSortField, type RankingSourceKey, type SortDirection, type VocabStatusFilter } from "@/lib/vocabSorting";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";
import { CanonicalPrimerRow } from "./CanonicalPrimerRow";
import { PrimerFilterBar } from "./PrimerFilterBar";

interface CanonicalPrimerTableProps {
  mediaItemId: string;
  words: VocabularyWord[];
  loading: boolean;
  selectedChapter: number | "all";
  onClearChapter: () => void;
  statusMap: Record<string, UserVocabStatus>;
  userId?: string | null;
  onChangeWordStatus: (word: VocabularyWord, targetStatus: UserVocabStatus) => void;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
}

const PAGE_SIZE = 20;

export const CanonicalPrimerTable: React.FC<CanonicalPrimerTableProps> = ({
  mediaItemId,
  words,
  loading,
  selectedChapter,
  onClearChapter,
  statusMap,
  userId,
  onChangeWordStatus,
  onSetWordStatus,
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
      <PrimerFilterBar
        query={query}
        onQueryChange={(value) => { setQuery(value); setPage(1); }}
        statusFilter={statusFilter}
        onStatusFilter={(value) => { setStatusFilter(value); setPage(1); }}
        statusCounts={statusCounts}
        posFilter={posFilter}
        onPosFilter={(value) => { setPosFilter(value); setPage(1); }}
        rankingSource={rankingSource}
        onRankingSource={setRankingSource}
        selectedChapter={selectedChapter}
        onClearChapter={onClearChapter}
        isEpisodeMode={isEpisodeMode}
        sortValue={`${sortField}:${sortDir}`}
        onSortChange={changeSort}
        resultCount={sortedAndFiltered.length}
      />

      <div className="border border-[#111111]">
        <div className="hidden grid-cols-12 gap-3 px-4 py-2.5 bg-[#F4F4F2] border-b border-[#111111] font-mono text-xs text-[#666666] uppercase md:grid">
          <button type="button" onClick={() => toggleSort("lemma", "asc")} className="col-span-2 text-left hover:text-[#111111] cursor-pointer font-semibold">LEMMA{arrow("lemma")}</button>
          <div className="col-span-2">IPA</div>
          <button type="button" onClick={() => toggleSort("pos", "asc")} className="col-span-1 text-left hover:text-[#111111] cursor-pointer font-semibold">POS{arrow("pos")}</button>
          <button type="button" onClick={() => toggleSort("cefr", "asc")} className="col-span-1 text-left hover:text-[#111111] cursor-pointer font-semibold">CEFR{arrow("cefr")}</button>
          <button type="button" onClick={() => toggleSort("frequency", "desc")} className="col-span-1 text-left hover:text-[#111111] cursor-pointer font-semibold">FREQ{arrow("frequency")}</button>
          <button type="button" onClick={() => toggleSort("rank", "asc")} className="col-span-1 text-left hover:text-[#111111] cursor-pointer font-semibold">{rankingSource === "tubelex_v2025" ? "TUBELEX" : "ELELEX"}{arrow("rank")}</button>
          <button type="button" onClick={() => toggleSort("debut", "asc")} className="col-span-2 text-left hover:text-[#111111] cursor-pointer font-semibold">{isEpisodeMode ? "DEBUT EPISODE" : "DEBUT CHAPTER"}{arrow("debut")}</button>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>

        <div className="divide-y divide-[#E2E2DF]">
          {loading ? (
            <VocabTableSkeleton rows={10} variant="primer" />
          ) : slice.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-[#666666]">No matching canonical lemmas.</div>
          ) : (
            slice.map((w) => (
              <CanonicalPrimerRow key={w.canonical_id} mediaItemId={mediaItemId} word={w} rankingSource={rankingSource} status={statusMap[w.canonical_id]} statusMap={statusMap} userId={userId} onChangeWordStatus={onChangeWordStatus} onSetWordStatus={onSetWordStatus} />
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1 font-mono text-xs sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[#666666]">Showing {sortedAndFiltered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sortedAndFiltered.length)} of {sortedAndFiltered.length} lemmas (20 / page)</span>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border border-[#111111] bg-white disabled:opacity-40 cursor-pointer">← Prev</button>
          <span>Page {safePage} / {totalPages}</span>
          <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border border-[#111111] bg-white disabled:opacity-40 cursor-pointer">Next →</button>
        </div>
      </div>
    </div>
  );
};
