import React, { useEffect, useMemo, useState } from "react";
import { fetchKnownWordsDetails } from "@/api/vocabulary.api";
import { VocabTableSkeleton } from "@/components/layout/VocabTableSkeleton";
import { formatNumber } from "@/lib/formatters";
import { buildKnownSignature, readKnownDetailsCache, writeKnownDetailsCache } from "@/lib/knownWordsCache";
import { sortKnownWords, type KnownSortField, type RankingSourceKey, type SortDirection } from "@/lib/vocabSorting";
import type { KnownWordEntry, UserVocabStatus } from "@/types/vocabulary.types";
import { KnownWordRow } from "./KnownWordRow";
import { KnownWordsFilterBar } from "./KnownWordsFilterBar";
import { VocabularyPacksSection } from "./VocabularyPacksSection";

interface KnownWordsViewProps {
  userId?: string | null;
  activeLanguage?: string;
  statusMap: Record<string, UserVocabStatus>;
  knownCount: number;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onReloadVocabulary: () => void | Promise<void>;
}

const PAGE_SIZE = 20;

export const KnownWordsView: React.FC<KnownWordsViewProps> = ({
  userId, activeLanguage = "es", statusMap, knownCount, onSetWordStatus, onReloadVocabulary,
}) => {
  const isFr = activeLanguage === "fr";
  const cached = readKnownDetailsCache(userId, statusMap, activeLanguage);
  const [words, setWords] = useState<KnownWordEntry[]>(() => cached?.entries || []);
  const [loading, setLoading] = useState<boolean>(() => !cached && !!userId);
  const [query, setQuery] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [stateFilter, setStateFilter] = useState<"ALL" | "KNOWN" | "LEARNING">("ALL");
  const [rankingSource, setRankingSource] = useState<RankingSourceKey>("tubelex_v2025");
  const [sortField, setSortField] = useState<KnownSortField>("added");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const signature = useMemo(() => buildKnownSignature(statusMap), [statusMap]);
  useEffect(() => {
    if (!userId) { setWords([]); setLoading(false); return; }
    const currentCache = readKnownDetailsCache(userId, statusMap, activeLanguage);
    if (currentCache) {
      setWords(currentCache.entries);
      const loadedSet = new Set(currentCache.entries.map((e) => e.canonical_id));
      const hasMissing = Object.entries(statusMap).some(([id, s]) => (s === "known" || s === "learning") && !loadedSet.has(id));
      if (!hasMissing) { writeKnownDetailsCache(userId, statusMap, currentCache.entries, activeLanguage); setLoading(false); return; }
    } else setLoading(true);
    let cancelled = false;
    fetchKnownWordsDetails(userId, activeLanguage)
      .then((rows) => { if (!cancelled) { setWords(rows); writeKnownDetailsCache(userId, statusMap, rows, activeLanguage); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId, signature, activeLanguage]);
  const counts = useMemo(() => {
    let known = 0, learning = 0;
    for (const s of Object.values(statusMap)) {
      if (s === "known") known++;
      else if (s === "learning") learning++;
    }
    return { ALL: known + learning, KNOWN: known, LEARNING: learning };
  }, [statusMap]);

  const activeWords = useMemo(() => {
    const base = words.filter((w) => {
      const st = statusMap[w.canonical_id];
      if (st !== "known" && st !== "learning") return false;
      if (stateFilter === "KNOWN" && st !== "known") return false;
      if (stateFilter === "LEARNING" && st !== "learning") return false;
      if (posFilter !== "ALL" && w.pos !== posFilter) return false;
      if (query.trim() && !w.lemma.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    return sortKnownWords(base, sortField, sortDir, rankingSource);
  }, [words, statusMap, stateFilter, posFilter, query, sortField, sortDir, rankingSource]);

  const toggleSort = (field: KnownSortField, defaultDir: SortDirection = "asc") => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir(defaultDir); }
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(activeWords.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = activeWords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const arrow = (f: KnownSortField) => (sortField === f ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">Vocabulary Ledger</h1>
          <p className="mt-1 text-xs text-slate-500">Canonical {isFr ? "French" : "Spanish"} headwords tracked in your profile.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 ring-1 ring-emerald-200/80 tabular-nums">{formatNumber(knownCount)} known</span>
          <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700 ring-1 ring-amber-200/80 tabular-nums">{formatNumber(counts.LEARNING)} learning</span>
        </div>
      </div>

      <VocabularyPacksSection userId={userId} activeLanguage={activeLanguage} onApplied={onReloadVocabulary} />

      <KnownWordsFilterBar
        query={query}
        onQueryChange={(val) => { setQuery(val); setPage(1); }}
        stateFilter={stateFilter}
        onStateFilter={(val) => { setStateFilter(val); setPage(1); }}
        counts={counts}
        rankingSource={rankingSource}
        onRankingSource={setRankingSource}
        posFilter={posFilter}
        onPosFilter={(val) => { setPosFilter(val); setPage(1); }}
        isFr={isFr}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="hidden grid-cols-12 divide-x divide-slate-200/80 px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 md:grid">
          <button type="button" onClick={() => toggleSort("lemma", "asc")} className="col-span-3 px-2 text-center hover:text-slate-900 cursor-pointer">Lemma{arrow("lemma")}</button>
          <div className="col-span-2 px-2 text-center">IPA</div>
          <button type="button" onClick={() => toggleSort("pos", "asc")} className="col-span-1 px-2 text-center hover:text-slate-900 cursor-pointer">POS{arrow("pos")}</button>
          <button type="button" onClick={() => toggleSort("cefr", "asc")} className="col-span-1 px-2 text-center hover:text-slate-900 cursor-pointer">CEFR{arrow("cefr")}</button>
          <button type="button" onClick={() => toggleSort("rank", "asc")} className="col-span-2 px-2 text-center hover:text-slate-900 cursor-pointer">{rankingSource === "tubelex_v2025" ? (isFr ? "Lexique" : "TubeLex") : (isFr ? "FLELex" : "ELELex")}{arrow("rank")}</button>
          <button type="button" onClick={() => toggleSort("added", "desc")} className="col-span-1 px-2 text-center hover:text-slate-900 cursor-pointer">Added{arrow("added")}</button>
          <div className="col-span-2 px-2 text-center">Actions</div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? <VocabTableSkeleton rows={10} variant="known" /> : slice.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No matching canonical lemmas.</div>
          ) : slice.map((w) => (
            <KnownWordRow key={w.canonical_id} word={w} status={statusMap[w.canonical_id]} statusMap={statusMap} userId={userId} rankingSource={rankingSource} onSetWordStatus={onSetWordStatus} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>Showing {activeWords.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, activeWords.length)} of {activeWords.length} lemmas</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer">← Prev</button>
          <span>Page {safePage} / {totalPages}</span>
          <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer">Next →</button>
        </div>
      </div>
    </div>
  );
};
