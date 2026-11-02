import React, { useState, useMemo, useEffect } from "react";
import { VocabTableSkeleton } from "@/components/layout/VocabTableSkeleton";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";
import { CanonicalPrimerRow } from "./CanonicalPrimerRow";

interface CanonicalPrimerTableProps {
  mediaItemId: string;
  words: VocabularyWord[];
  loading: boolean;
  selectedChapter: number | "all";
  onClearChapter: () => void;
  statusMap: Record<string, UserVocabStatus>;
  onToggleWord: (word: VocabularyWord) => void;
}

const PAGE_SIZE = 20;

export const CanonicalPrimerTable: React.FC<CanonicalPrimerTableProps> = ({
  mediaItemId,
  words,
  loading,
  selectedChapter,
  onClearChapter,
  statusMap,
  onToggleWord,
}) => {
  const [query, setQuery] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [rankingSource, setRankingSource] = useState<"tubelex_v2025" | "elelex_v2020">(
    "tubelex_v2025"
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [selectedChapter]);

  const filtered = useMemo(() => {
    return words.filter((w) => {
      if (selectedChapter !== "all" && w.first_occurrence_index !== selectedChapter) return false;
      if (posFilter !== "ALL" && w.pos !== posFilter) return false;
      if (query.trim() && !w.lemma.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [words, selectedChapter, posFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const isEpisodeMode = /^\d+x\d+/i.test(words[0]?.first_context_snippet || "");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8F8F6] border border-[#E2E2DF] p-2.5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search canonical lemma..."
            className="border border-[#111111] bg-white px-3 py-1 font-mono text-xs outline-none w-56"
          />
          {selectedChapter !== "all" && (
            <button
              type="button"
              onClick={onClearChapter}
              className="bg-[#B8FF01] text-[#111111] border border-[#111111] px-2.5 py-1 font-mono text-xs font-semibold cursor-pointer"
            >
              Debut in {isEpisodeMode ? `EP.${selectedChapter}` : `CH.${selectedChapter}`} ×
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center border border-[#111111]">
            {([["tubelex_v2025", "TUBELEX"], ["elelex_v2020", "ELELEX"]] as const).map(([src, label]) => (
              <button
                key={src}
                type="button"
                onClick={() => setRankingSource(src)}
                className={`px-2.5 py-1 cursor-pointer transition-colors ${
                  rankingSource === src ? "bg-[#B8FF01] text-[#111111] font-semibold" : "bg-white text-[#666666] hover:text-[#111111]"
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
                onClick={() => { setPosFilter(pos); setPage(1); }}
                className={`px-2.5 py-1 border cursor-pointer ${
                  posFilter === pos ? "border-[#111111] bg-[#111111] text-white" : "border-[#CCCCCC] bg-white text-[#111111]"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-[#111111]">
        <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-[#F4F4F2] border-b border-[#111111] font-mono text-xs text-[#666666] uppercase">
          <div className="col-span-2">LEMMA</div>
          <div className="col-span-2">IPA</div>
          <div className="col-span-1">POS</div>
          <div className="col-span-1">CEFR</div>
          <div className="col-span-1">FREQ</div>
          <div className="col-span-1">{rankingSource === "tubelex_v2025" ? "TUBELEX" : "ELELEX"}</div>
          <div className="col-span-2">{isEpisodeMode ? "DEBUT EPISODE" : "DEBUT CHAPTER"}</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>

        <div className="divide-y divide-[#E2E2DF]">
          {loading ? (
            <VocabTableSkeleton rows={10} variant="primer" />
          ) : slice.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-[#666666]">No matching canonical lemmas.</div>
          ) : (
            slice.map((w) => (
              <CanonicalPrimerRow
                key={w.canonical_id}
                mediaItemId={mediaItemId}
                word={w}
                rankingSource={rankingSource}
                isKnown={statusMap[w.canonical_id] === "known"}
                onToggleWord={onToggleWord}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between font-mono text-xs pt-1">
        <span className="text-[#666666]">
          Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} lemmas (20 / page)
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
