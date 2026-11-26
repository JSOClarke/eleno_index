import React, { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { fetchCanonicalSentences, fetchIPlusOneSentences } from "@/api/sentence.api";
import { SentenceTokenLine } from "@/components/inspector/SentenceTokenLine";
import type { PopoverSizePreset } from "@/lib/epub/epubPopoverSize";
import { speakSpanish } from "@/lib/epub/epubParseClient";
import type { BankSentence } from "@/types/sentence.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

type BankMode = "iplus1" | "iplus2" | "all";

interface EpubSentenceBankSectionProps {
  canonicalId: string;
  userId?: string | null;
  language: string;
  statusMap: Record<string, UserVocabStatus>;
  fetchSentences?: (mode: BankMode, canonicalId: string, userId?: string | null) => Promise<BankSentence[]>;
  speak?: (text: string, language?: string, rate?: number) => void;
  sizePreset?: PopoverSizePreset;
}

/** Sentence Bank lookup inside the EPUB word popover supporting i+1, i+2, and all corpus hits. */
export const EpubSentenceBankSection: React.FC<EpubSentenceBankSectionProps> = ({
  canonicalId, userId, language, statusMap, fetchSentences, speak, sizePreset,
}) => {
  const [mode, setMode] = useState<BankMode>(userId ? "iplus1" : "all");
  const [rows, setRows] = useState<BankSentence[]>([]);
  const [loading, setLoading] = useState(false);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  useEffect(() => {
    setMode(userId ? "iplus1" : "all");
  }, [canonicalId, userId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setElapsedMs(null);
    const t0 = performance.now();
    const req = fetchSentences
      ? fetchSentences(mode, canonicalId, userId)
      : mode !== "all" && userId
        ? fetchIPlusOneSentences(canonicalId, userId, undefined, 6, mode === "iplus2" ? 2 : 1)
        : fetchCanonicalSentences(canonicalId, undefined, 6);
    req
      .then((res) => {
        if (!cancelled) {
          setRows(res);
          setElapsedMs(Math.round(performance.now() - t0));
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [canonicalId, userId, mode, fetchSentences]);

  const modes: Array<{ id: BankMode; label: string }> = userId
    ? [{ id: "iplus1", label: "i+1" }, { id: "iplus2", label: "i+2" }, { id: "all", label: "All" }]
    : [{ id: "all", label: "All" }];

  return (
    <div className="border-t border-[#E2E8F0] pt-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={`${sizePreset?.labelClass || "text-[10px]"} font-semibold uppercase tracking-[0.04em] text-[#94A3B8]`}>
          Sentence Bank{elapsedMs !== null && !loading ? ` · ${elapsedMs}ms` : ""}
        </span>
        <div className="inline-flex gap-0.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-0.5">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`rounded-md px-2 py-0.5 ${sizePreset?.labelClass || "text-[10px]"} font-semibold cursor-pointer ${
                mode === m.id ? "bg-[#0F172A] text-white" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-1.5">
          <div className="h-9 rounded-lg bg-[#F1F5F9] animate-pulse" />
          <div className="h-9 rounded-lg bg-[#F1F5F9] animate-pulse" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#E2E8F0] py-3 text-center text-[11px] text-[#94A3B8]">
          {mode === "all"
            ? "No indexed corpus sentences found."
            : `No ${mode === "iplus2" ? "i+2" : "i+1"} sentences found with your known words.`}
        </div>
      ) : (
        <div className={`${sizePreset?.bankListClass || "max-h-[155px]"} space-y-1.5 overflow-y-auto pr-0.5`}>
          {rows.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-2 space-y-1">
              <p className={`${sizePreset?.bankTextClass || "text-[12.5px]"} leading-[1.45] text-[#0F172A]`}>
                <SentenceTokenLine
                  sentence={entry.sentence}
                  tokens={entry.tokens}
                  targetCanonicalId={canonicalId}
                  statusMap={statusMap}
                />
              </p>
              <div className={`flex items-center justify-between gap-2 ${sizePreset?.bankMetaClass || "text-[10px]"} text-[#64748B]`}>
                <span className="truncate">{entry.source_context || `${entry.token_count} words`}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {entry.unknown_count != null && (
                    <span className="rounded-full bg-[#0F172A] px-1.5 py-0.2 text-[9.5px] font-semibold text-white">
                      i+{entry.unknown_count}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => (speak || speakSpanish)(entry.sentence, language)}
                    title="Listen to example"
                    className="rounded p-0.5 text-[#64748B] hover:bg-white hover:text-[#0F172A] cursor-pointer"
                  >
                    <Volume2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
