import React, { useEffect, useMemo, useState } from "react";
import { fetchKnownWordsDetails } from "@/api/vocabulary.api";
import { VocabTableSkeleton } from "@/components/layout/VocabTableSkeleton";
import { buildKnownSignature, readKnownDetailsCache, writeKnownDetailsCache } from "@/lib/knownWordsCache";
import type { KnownWordEntry, UserVocabStatus } from "@/types/vocabulary.types";
import { KnownWordRow } from "./KnownWordRow";

interface KnownWordsViewProps {
  userId?: string | null;
  statusMap: Record<string, UserVocabStatus>;
  knownCount: number;
  onRemoveWord: (canonicalId: string) => void;
}

const PAGE_SIZE = 20;

export const KnownWordsView: React.FC<KnownWordsViewProps> = ({
  userId,
  statusMap,
  knownCount,
  onRemoveWord,
}) => {
  const cached = readKnownDetailsCache(userId, statusMap);
  const [words, setWords] = useState<KnownWordEntry[]>(() => cached?.entries || []);
  const [loading, setLoading] = useState<boolean>(() => !cached && !!userId);
  const [query, setQuery] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [rankingSource, setRankingSource] = useState<"tubelex_v2025" | "elelex_v2020">("tubelex_v2025");
  const [page, setPage] = useState(1);

  const signature = useMemo(() => buildKnownSignature(statusMap), [statusMap]);

  useEffect(() => {
    if (!userId) { setWords([]); setLoading(false); return; }
    const currentCache = readKnownDetailsCache(userId, statusMap);
    if (currentCache) {
      setWords(currentCache.entries);
      const loadedSet = new Set(currentCache.entries.map((e) => e.canonical_id));
      const missingNewWord = Object.entries(statusMap).some(([id, s]) => s === "known" && !loadedSet.has(id));
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

  const activeWords = useMemo(() => {
    return words.filter((w) => {
      if (statusMap[w.canonical_id] !== "known") return false;
      if (posFilter !== "ALL" && w.pos !== posFilter) return false;
      if (query.trim() && !w.lemma.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [words, statusMap, posFilter, query]);

  const totalPages = Math.max(1, Math.ceil(activeWords.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = activeWords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#111111] pb-3">
        <div>
          <h2 className="text-lg font-bold text-[#111111]">Known Words Ledger ({knownCount})</h2>
          <p className="font-mono text-xs text-[#666666]">
            Canonical Spanish headwords marked as known in your profile.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8F8F6] border border-[#E2E2DF] p-2.5">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Search known lemma..."
          className="border border-[#111111] bg-white px-3 py-1 font-mono text-xs outline-none w-56"
        />
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center border border-[#111111]">
            {([["tubelex_v2025", "TUBELEX"], ["elelex_v2020", "ELELEX"]] as const).map(([src, label]) => (
              <button
                key={src}
                type="button"
                onClick={() => setRankingSource(src)}
                className={`px-2.5 py-1 cursor-pointer transition-colors ${rankingSource === src ? "bg-[#B8FF01] text-[#111111] font-semibold" : "bg-white text-[#666666] hover:text-[#111111]"}`}
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
                onClick={() => { setPosFilter(pos); setPage(1); }}
                className={`px-2.5 py-1 border cursor-pointer ${posFilter === pos ? "border-[#111111] bg-[#111111] text-white" : "border-[#CCCCCC] bg-white text-[#111111]"}`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-[#111111]">
        <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-[#F4F4F2] border-b border-[#111111] font-mono text-xs text-[#666666] uppercase">
          <div className="col-span-3">LEMMA</div>
          <div className="col-span-2">IPA</div>
          <div className="col-span-1">POS</div>
          <div className="col-span-1">CEFR</div>
          <div className="col-span-2">{rankingSource === "tubelex_v2025" ? "TUBELEX" : "ELELEX"}</div>
          <div className="col-span-1">ADDED</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>

        <div className="divide-y divide-[#E2E2DF]">
          {loading ? (
            <VocabTableSkeleton rows={10} variant="known" />
          ) : slice.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-[#666666]">No matching known canonical lemmas.</div>
          ) : (
            slice.map((w) => <KnownWordRow key={w.canonical_id} word={w} rankingSource={rankingSource} onRemoveWord={onRemoveWord} />)
          )}
        </div>
      </div>

      <div className="flex items-center justify-between font-mono text-xs pt-1">
        <span className="text-[#666666]">
          Showing {activeWords.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, activeWords.length)} of {activeWords.length} known lemmas
        </span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border border-[#111111] bg-white disabled:opacity-40 cursor-pointer">← Prev</button>
          <span>Page {safePage} / {totalPages}</span>
          <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border border-[#111111] bg-white disabled:opacity-40 cursor-pointer">Next →</button>
        </div>
      </div>
    </div>
  );
};
