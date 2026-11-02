import React, { useEffect, useMemo, useState } from "react";
import { fetchKnownWordsDetails } from "@/api/vocabulary.api";
import { VocabTableSkeleton } from "@/components/layout/VocabTableSkeleton";
import { buildKnownSignature, readKnownDetailsCache, writeKnownDetailsCache } from "@/lib/knownWordsCache";
import { sortKnownWords, type KnownSortField, type RankingSourceKey, type SortDirection } from "@/lib/vocabSorting";
import type { KnownWordEntry, UserVocabStatus } from "@/types/vocabulary.types";
import { KnownWordRow } from "./KnownWordRow";

interface KnownWordsViewProps {
  userId?: string | null;
  statusMap: Record<string, UserVocabStatus>;
  knownCount: number;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
}

const PAGE_SIZE = 20;

export const KnownWordsView: React.FC<KnownWordsViewProps> = ({
  userId,
  statusMap,
  knownCount,
  onSetWordStatus,
}) => {
  const cached = readKnownDetailsCache(userId, statusMap);
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
    const currentCache = readKnownDetailsCache(userId, statusMap);
    if (currentCache) {
      setWords(currentCache.entries);
      const loadedSet = new Set(currentCache.entries.map((e) => e.canonical_id));
      const missingNewWord = Object.entries(statusMap).some(
        ([id, s]) => (s === "known" || s === "learning") && !loadedSet.has(id)
      );
      if (!missingNewWord) {
        writeKnownDetailsCache(userId, statusMap, currentCache.entries);
        setLoading(false);
        return;
      }
    } else {
      setLoading(true);
    }

    let cancelled = false;
    fetchKnownWordsDetails(userId)
      .then((rows) => { if (!cancelled) { setWords(rows); writeKnownDetailsCache(userId, statusMap, rows); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId, signature]);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#111111] pb-3">
        <div>
          <h2 className="text-lg font-bold text-[#111111]">Vocabulary Ledger ({knownCount} Known · {counts.LEARNING} Learning)</h2>
          <p className="font-mono text-xs text-[#666666]">Canonical Spanish headwords tracked in your profile.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#F8F8F6] border border-[#E2E2DF] p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search tracked lemma..." className="border border-[#111111] bg-white px-3 py-1 font-mono text-xs outline-none w-52" />
          <div className="flex items-center border border-[#111111] font-mono text-[11px]">
            {(["ALL", "LEARNING", "KNOWN"] as const).map((st) => (
              <button key={st} type="button" onClick={() => { setStateFilter(st); setPage(1); }} className={`px-2 py-1 cursor-pointer transition-colors ${stateFilter === st ? "bg-[#111111] text-[#B8FF01] font-semibold" : "bg-white text-[#555555] hover:text-[#111111]"}`}>
                {st} ({counts[st]})
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center border border-[#111111]">
            {([["tubelex_v2025", "TUBELEX"], ["elelex_v2020", "ELELEX"]] as const).map(([src, label]) => (
              <button key={src} type="button" onClick={() => setRankingSource(src)} className={`px-2.5 py-1 cursor-pointer transition-colors ${rankingSource === src ? "bg-[#B8FF01] text-[#111111] font-semibold" : "bg-white text-[#666666] hover:text-[#111111]"}`}>{label}</button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {["ALL", "NOUN", "VERB", "ADJ", "ADV"].map((pos) => (
              <button key={pos} type="button" onClick={() => { setPosFilter(pos); setPage(1); }} className={`px-2 py-1 border cursor-pointer ${posFilter === pos ? "border-[#111111] bg-[#111111] text-white" : "border-[#CCCCCC] bg-white text-[#111111]"}`}>{pos}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-[#111111]">
        <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-[#F4F4F2] border-b border-[#111111] font-mono text-xs text-[#666666] uppercase">
          <button type="button" onClick={() => toggleSort("lemma", "asc")} className="col-span-3 text-left hover:text-[#111111] cursor-pointer font-semibold">LEMMA{arrow("lemma")}</button>
          <div className="col-span-2">IPA</div>
          <button type="button" onClick={() => toggleSort("pos", "asc")} className="col-span-1 text-left hover:text-[#111111] cursor-pointer font-semibold">POS{arrow("pos")}</button>
          <button type="button" onClick={() => toggleSort("cefr", "asc")} className="col-span-1 text-left hover:text-[#111111] cursor-pointer font-semibold">CEFR{arrow("cefr")}</button>
          <button type="button" onClick={() => toggleSort("rank", "asc")} className="col-span-2 text-left hover:text-[#111111] cursor-pointer font-semibold">{rankingSource === "tubelex_v2025" ? "TUBELEX" : "ELELEX"}{arrow("rank")}</button>
          <button type="button" onClick={() => toggleSort("added", "desc")} className="col-span-1 text-left hover:text-[#111111] cursor-pointer font-semibold">ADDED{arrow("added")}</button>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>

        <div className="divide-y divide-[#E2E2DF]">
          {loading ? (
            <VocabTableSkeleton rows={10} variant="known" />
          ) : slice.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-[#666666]">No matching canonical lemmas.</div>
          ) : (
            slice.map((w) => <KnownWordRow key={w.canonical_id} word={w} status={statusMap[w.canonical_id]} rankingSource={rankingSource} onSetWordStatus={onSetWordStatus} />)
          )}
        </div>
      </div>

      <div className="flex items-center justify-between font-mono text-xs pt-1">
        <span className="text-[#666666]">Showing {activeWords.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, activeWords.length)} of {activeWords.length} lemmas</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border border-[#111111] bg-white disabled:opacity-40 cursor-pointer">← Prev</button>
          <span>Page {safePage} / {totalPages}</span>
          <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border border-[#111111] bg-white disabled:opacity-40 cursor-pointer">Next →</button>
        </div>
      </div>
    </div>
  );
};
