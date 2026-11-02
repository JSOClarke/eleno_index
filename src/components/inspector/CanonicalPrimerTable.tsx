import React, { useState, useMemo } from "react";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";

interface CanonicalPrimerTableProps {
  words: VocabularyWord[];
  loading: boolean;
  statusMap: Record<string, UserVocabStatus>;
  onToggleWord: (word: VocabularyWord) => void;
}

const PAGE_SIZE = 20;

export const CanonicalPrimerTable: React.FC<CanonicalPrimerTableProps> = ({
  words,
  loading,
  statusMap,
  onToggleWord,
}) => {
  const [query, setQuery] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return words.filter((w) => {
      if (posFilter !== "ALL" && w.pos !== posFilter) return false;
      if (query.trim() && !w.lemma.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [words, posFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8F8F6] border border-[#E2E2DF] p-2.5">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Search canonical lemma..."
          className="border border-[#111111] bg-white px-3 py-1 font-mono text-xs outline-none w-60"
        />
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {["ALL", "NOUN", "VERB", "ADJ", "ADV"].map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => { setPosFilter(pos); setPage(1); }}
              className={`px-2.5 py-1 border cursor-pointer ${
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

      <div className="border border-[#111111]">
        <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-[#F4F4F2] border-b border-[#111111] font-mono text-xs text-[#666666] uppercase">
          <div className="col-span-2">LEMMA</div>
          <div className="col-span-1">POS</div>
          <div className="col-span-1">CEFR</div>
          <div className="col-span-1">FREQ</div>
          <div className="col-span-5">AUTHENTIC SENTENCE</div>
          <div className="col-span-2 text-right">STATUS</div>
        </div>

        <div className="divide-y divide-[#E2E2DF]">
          {loading ? (
            [1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-[#F8F8F6] animate-pulse" />)
          ) : slice.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-[#666666]">No matching canonical lemmas.</div>
          ) : (
            slice.map((w) => {
              const isKnown = statusMap[w.canonical_id] === "known";
              return (
                <div key={w.canonical_id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center text-xs hover:bg-[#F8F8F6]">
                  <div className="col-span-2 font-mono font-bold text-[#111111] truncate">{w.lemma}</div>
                  <div className="col-span-1 font-mono text-[#666666]">{w.pos}</div>
                  <div className="col-span-1">
                    <span className="px-1.5 py-0.5 border border-[#111111] font-mono text-[11px]">{w.cefr}</span>
                  </div>
                  <div className="col-span-1 font-mono tabular-nums">{w.frequency}x</div>
                  <div className="col-span-5 font-serif text-sm text-[#222222] italic line-clamp-1">
                    {w.first_context_snippet || "—"}
                  </div>
                  <div className="col-span-2 text-right">
                    <button
                      type="button"
                      onClick={() => onToggleWord(w)}
                      className={`px-3 py-1 font-mono text-xs border transition-colors cursor-pointer ${
                        isKnown
                          ? "border-[#111111] bg-[#111111] text-[#B8FF01] font-semibold"
                          : "border-[#111111] bg-white text-[#111111] hover:bg-[#B8FF01]"
                      }`}
                    >
                      {isKnown ? "✓ Known" : "Mark Known"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center justify-between font-mono text-xs pt-1">
        <span className="text-[#666666]">
          Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} lemmas (20 / page)
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border border-[#111111] bg-white disabled:opacity-40 cursor-pointer"
          >
            ← Prev
          </button>
          <span>Page {safePage} / {totalPages}</span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 border border-[#111111] bg-white disabled:opacity-40 cursor-pointer"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};
