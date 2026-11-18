import React, { useMemo, useState } from "react";
import type { QuarantineItem, UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";

interface ReadflowPrimerLedgerProps {
  words: VocabularyWord[];
  quarantineItems: QuarantineItem[];
  loading: boolean;
  quarantineLoading: boolean;
  statusMap: Record<string, UserVocabStatus>;
  selectedChapter: number | "all";
  activeTab: "canonical" | "characters" | "noise";
  onSelectTab: (tab: "canonical" | "characters" | "noise") => void;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
}

const PAGE_SIZE = 40;

export const ReadflowPrimerLedger: React.FC<ReadflowPrimerLedgerProps> = ({
  words, quarantineItems, loading, quarantineLoading, statusMap,
  activeTab, onSelectTab, onSetWordStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<"all" | "unknown" | "learning" | "known">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredWords = useMemo(() => {
    const q = query.trim().toLowerCase();
    return words.filter((w) => {
      const st = statusMap[w.canonical_id] ?? "unknown";
      if (statusFilter !== "all" && st !== statusFilter) return false;
      if (q && !w.lemma.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [words, statusFilter, query, statusMap]);

  const filteredQuarantine = useMemo(() => {
    const kind = activeTab === "characters" ? "proper_noun" : "noise";
    const q = query.trim().toLowerCase();
    return quarantineItems.filter((it) => {
      const isProper = it.category === "proper_noun";
      if ((kind === "proper_noun" && !isProper) || (kind === "noise" && isProper)) return false;
      return !q || it.token.toLowerCase().includes(q);
    });
  }, [quarantineItems, activeTab, query]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedWords = filteredWords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <section className="bg-white rounded-3xl border border-[#ECECEF] p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#ECECEF]">
        <div className="flex flex-wrap items-center gap-1.5">
          {(["canonical", "characters", "noise"] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => onSelectTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold capitalize cursor-pointer ${
                activeTab === tab ? "bg-[#040404] text-white" : "bg-[#FAFAFA] border border-[#ECECEF] text-[#5A595C] hover:text-[#040404]"
              }`}>
              {tab === "canonical" ? `Vocabulary Primer (${words.length.toLocaleString()})` : tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {activeTab === "canonical" && ([
            { id: "all", cls: "bg-[#040404] text-white" },
            { id: "unknown", cls: "bg-[#F3E1E6] text-[#040404]" },
            { id: "learning", cls: "bg-[#D8D6FA] text-[#040404]" },
            { id: "known", cls: "bg-[#E2F59B] text-[#040404]" },
          ] as const).map((pill) => (
            <button key={pill.id} type="button" onClick={() => { setStatusFilter(pill.id); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold capitalize cursor-pointer ${
                statusFilter === pill.id ? pill.cls : "bg-[#FAFAFA] text-[#5A595C]"
              }`}>
              {pill.id}
            </button>
          ))}
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Filter lemma..."
            className="h-8 px-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEF] text-xs font-medium text-[#040404] focus:outline-none focus:border-[#040404]" />
        </div>
      </div>

      {activeTab === "canonical" ? (
        loading ? <div className="py-10 text-center text-sm text-[#5A595C]">Loading vocabulary ledger...</div> : (
          <div className="divide-y divide-[#ECECEF]">
            {pagedWords.map((w) => {
              const st = statusMap[w.canonical_id];
              const wordStyle = st === "known" ? "token-known font-extrabold" : st === "learning" ? "token-target" : "token-unknown";
              return (
                <div key={w.canonical_id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                    <span className={`${wordStyle} text-sm`}>{w.lemma}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#FAFAFA] border border-[#ECECEF] text-[10px] font-bold text-[#5A595C]">{w.pos}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#D8D6FA]/45 text-[10px] font-extrabold text-[#040404]">{w.cefr || "—"}</span>
                    <span className="text-[11px] font-bold text-[#5A595C]">{w.frequency}×</span>
                    {w.definitions[0] && <span className="text-xs text-[#5A595C] truncate max-w-[300px] hidden sm:inline">— {w.definitions[0]}</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => onSetWordStatus(w.canonical_id, st === "learning" ? null : "learning")}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold cursor-pointer ${st === "learning" ? "bg-[#D8D6FA] text-[#040404]" : "bg-[#FAFAFA] text-[#5A595C] hover:text-[#040404]"}`}>
                      Learning
                    </button>
                    <button type="button" onClick={() => onSetWordStatus(w.canonical_id, st === "known" ? null : "known")}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold cursor-pointer ${st === "known" ? "bg-[#E2F59B] text-[#040404]" : "bg-[#040404] text-white"}`}>
                      {st === "known" ? "Known ✓" : "Mark Known"}
                    </button>
                  </div>
                </div>
              );
            })}
            {totalPages > 1 && (
              <div className="pt-4 flex items-center justify-center gap-2">
                <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded-xl border border-[#ECECEF] text-xs font-bold disabled:opacity-40 cursor-pointer">Prev</button>
                <span className="text-xs font-semibold text-[#5A595C]">Page {safePage} / {totalPages}</span>
                <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded-xl border border-[#ECECEF] text-xs font-bold disabled:opacity-40 cursor-pointer">Next</button>
              </div>
            )}
          </div>
        )
      ) : quarantineLoading ? <div className="py-10 text-center text-sm text-[#5A595C]">Loading...</div> : (
        <div className="pt-4 flex flex-wrap gap-2">
          {filteredQuarantine.slice(0, 120).map((it) => (
            <span key={it.id} className="px-2.5 py-1 rounded-xl bg-[#D8D6FA]/35 text-xs font-bold text-[#040404]">
              {it.token} <span className="text-[#5A595C] ml-1">{it.frequency}×</span>
            </span>
          ))}
        </div>
      )}
    </section>
  );
};
