import React, { useState, useMemo, useEffect } from "react";
import { VocabTableSkeleton } from "@/components/layout/VocabTableSkeleton";
import { getProficiencySystemLabel } from "@/lib/proficiencyScale";
import { getDefaultRankSource, getRankSourceLabel, matchesStatusFilter, sortPrimerWords, type PrimerSortField, type RankingSourceKey, type SortDirection, type VocabStatusFilter } from "@/lib/vocabSorting";
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
  onRequireAuth: () => void;
  onChangeWordStatus: (word: VocabularyWord, targetStatus: UserVocabStatus) => void;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  mediaTitle?: string;
  language?: string;
}

const PAGE_SIZE = 20;

export const CanonicalPrimerTable: React.FC<CanonicalPrimerTableProps> = ({
  mediaItemId,
  mediaTitle,
  language,
  words,
  loading,
  selectedChapter,
  onClearChapter,
  statusMap,
  userId,
  onRequireAuth,
  onChangeWordStatus,
  onSetWordStatus,
}) => {
  const [query, setQuery] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<VocabStatusFilter>("ALL");
  const [rankingSource, setRankingSource] = useState<RankingSourceKey>(() => getDefaultRankSource(language));
  const [sortField, setSortField] = useState<PrimerSortField>("frequency");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [selectedChapter]);
  useEffect(() => { setRankingSource(getDefaultRankSource(language)); }, [language]);

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
    setSortField(field); setSortDir(dir); setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(sortedAndFiltered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = sortedAndFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const isEpisodeMode = /^\d+x\d+/i.test(words[0]?.first_context_snippet || "");
  const arrow = (f: PrimerSortField) => (sortField === f ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕");

  return (
    <div className="space-y-3">
      <PrimerFilterBar
        query={query} onQueryChange={(value) => { setQuery(value); setPage(1); }}
        statusFilter={statusFilter} onStatusFilter={(value) => { setStatusFilter(value); setPage(1); }}
        statusCounts={statusCounts} posFilter={posFilter} onPosFilter={(value) => { setPosFilter(value); setPage(1); }}
        rankingSource={rankingSource} onRankingSource={setRankingSource} language={language}
        selectedChapter={selectedChapter} onClearChapter={onClearChapter} isEpisodeMode={isEpisodeMode}
        sortValue={`${sortField}:${sortDir}`} onSortChange={changeSort}
        resultCount={sortedAndFiltered.length} exportWords={sortedAndFiltered}
        statusMap={statusMap} mediaTitle={mediaTitle} mediaItemId={mediaItemId}
        userId={userId} onRequireAuth={onRequireAuth}
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="md:min-w-[780px] lg:min-w-0">
          <div className="hidden md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)_minmax(0,0.7fr)_minmax(0,0.85fr)_minmax(0,0.7fr)_minmax(0,1.4fr)_minmax(0,1.9fr)_minmax(0,1.65fr)] items-center divide-x divide-slate-200/80 border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-500">
            <button type="button" onClick={() => toggleSort("lemma", "asc")} className="flex min-w-0 items-center justify-center truncate whitespace-nowrap px-2 hover:text-slate-900 cursor-pointer">Lemma{arrow("lemma")}</button>
            <div className="flex min-w-0 items-center justify-center truncate whitespace-nowrap px-2">Reading</div>
            <button type="button" onClick={() => toggleSort("pos", "asc")} className="flex min-w-0 items-center justify-center truncate whitespace-nowrap px-2 hover:text-slate-900 cursor-pointer">POS{arrow("pos")}</button>
            <button type="button" onClick={() => toggleSort("cefr", "asc")} className="flex min-w-0 items-center justify-center truncate whitespace-nowrap px-2 hover:text-slate-900 cursor-pointer">{getProficiencySystemLabel(language)}{arrow("cefr")}</button>
            <button type="button" onClick={() => toggleSort("frequency", "desc")} className="flex min-w-0 items-center justify-center truncate whitespace-nowrap px-2 hover:text-slate-900 cursor-pointer">Freq{arrow("frequency")}</button>
            <button type="button" onClick={() => toggleSort("rank", "asc")} className="flex min-w-0 items-center justify-center truncate whitespace-nowrap px-2 hover:text-slate-900 cursor-pointer">{getRankSourceLabel(rankingSource)}{arrow("rank")}</button>
            <button type="button" onClick={() => toggleSort("debut", "asc")} className="flex min-w-0 items-center justify-center truncate whitespace-nowrap px-2 hover:text-slate-900 cursor-pointer">{isEpisodeMode ? "Debut Episode" : "Debut Chapter"}{arrow("debut")}</button>
            <div className="flex min-w-0 items-center justify-center truncate whitespace-nowrap px-2">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <VocabTableSkeleton rows={10} variant="primer" />
            ) : slice.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No matching canonical lemmas.</div>
            ) : (
              slice.map((w) => (
                <CanonicalPrimerRow key={w.canonical_id} mediaItemId={mediaItemId} word={w} rankingSource={rankingSource} status={statusMap[w.canonical_id]} statusMap={statusMap} userId={userId} onChangeWordStatus={onChangeWordStatus} onSetWordStatus={onSetWordStatus} />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1 text-xs sm:flex-row sm:items-center sm:justify-between text-slate-500">
        <span>Showing {sortedAndFiltered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sortedAndFiltered.length)} of {sortedAndFiltered.length} lemmas (20 / page)</span>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 disabled:opacity-40 cursor-pointer hover:bg-slate-50">← Prev</button>
          <span>Page {safePage} / {totalPages}</span>
          <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 disabled:opacity-40 cursor-pointer hover:bg-slate-50">Next →</button>
        </div>
      </div>
    </div>
  );
};
