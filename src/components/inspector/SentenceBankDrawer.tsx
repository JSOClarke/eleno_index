import React, { useEffect, useState } from "react";
import {
  fetchCanonicalSentences,
  fetchIPlusOneSentences,
} from "@/api/sentence.api";
import type { BankSentence, SentenceToken } from "@/types/sentence.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { SentenceBankCard } from "./SentenceBankCard";
import { SentenceBankModeToggle } from "./SentenceBankModeToggle";
import { SentenceTokenInspector } from "./SentenceTokenInspector";

interface SentenceBankDrawerProps {
  canonicalId: string;
  mediaItemId?: string;
  userId?: string | null;
  statusMap: Record<string, UserVocabStatus>;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  fallbackContextLabel: string;
}

type Mode = "all" | "iplus1";

interface TokenSelection {
  token: SentenceToken;
  sentence: string;
  sourceContext?: string;
}

export const SentenceBankDrawer: React.FC<SentenceBankDrawerProps> = ({
  canonicalId,
  mediaItemId,
  userId,
  statusMap,
  onSetWordStatus,
  fallbackContextLabel,
}) => {
  const [mode, setMode] = useState<Mode>("all");
  const [allSentences, setAllSentences] = useState<BankSentence[] | null>(null);
  const [iPlusOne, setIPlusOne] = useState<BankSentence[] | null>(null);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingI, setLoadingI] = useState(false);
  const [selection, setSelection] = useState<TokenSelection | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setMode("all");
    setSelection(null);
    setAllSentences(null);
    setIPlusOne(null);
  }, [canonicalId, mediaItemId]);

  useEffect(() => {
    let cancelled = false;
    setLoadingAll(true);
    fetchCanonicalSentences(canonicalId, mediaItemId, 3)
      .then((rows) => {
        if (!cancelled) setAllSentences(rows);
      })
      .finally(() => {
        if (!cancelled) setLoadingAll(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canonicalId, mediaItemId, reloadKey]);

  useEffect(() => {
    if (mode !== "iplus1" || iPlusOne !== null || !userId) return;
    let cancelled = false;
    setLoadingI(true);
    fetchIPlusOneSentences(canonicalId, userId, mediaItemId, 3)
      .then((rows) => {
        if (!cancelled) setIPlusOne(rows);
      })
      .finally(() => {
        if (!cancelled) setLoadingI(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, canonicalId, userId, mediaItemId, iPlusOne, reloadKey]);

  const refreshIPlusOne = () => {
    setIPlusOne(null);
    setReloadKey((prev) => prev + 1);
  };

  const sentences = mode === "all" ? allSentences : iPlusOne;
  const loading = mode === "all" ? loadingAll : loadingI;

  return (
    <div className="border-t border-[#E2E2DF] pt-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase font-bold text-[#666666]">
          AUTHENTIC CITATIONS ({sentences?.length ?? 0})
        </span>
        <SentenceBankModeToggle mode={mode} onChange={setMode} userId={userId} />
      </div>

      {loading ? (
        <div className="text-xs font-mono text-[#888888] animate-pulse py-2">
          Querying sentence_bank...
        </div>
      ) : !sentences || sentences.length === 0 ? (
        <div className="text-xs font-mono text-[#888888] italic py-1">
          {mode === "iplus1"
            ? "No i+1 sentences found for this word with your current vocabulary."
            : "No indexed example sentence found in sentence_bank."}
        </div>
      ) : (
        <div className="space-y-2">
          {sentences.map((entry) => (
            <SentenceBankCard
              key={entry.id}
              entry={entry}
              showMatch={mode === "iplus1"}
              targetCanonicalId={canonicalId}
              statusMap={statusMap}
              fallbackContextLabel={fallbackContextLabel}
              onSelectToken={(tok, ent) =>
                setSelection({ token: tok, sentence: ent.sentence, sourceContext: ent.source_context })
              }
            />
          ))}
        </div>
      )}

      {selection && (
        <SentenceTokenInspector
          token={selection.token}
          sentenceText={selection.sentence}
          sourceContext={selection.sourceContext}
          status={selection.token.canonical_id ? statusMap[selection.token.canonical_id] : undefined}
          onClose={() => setSelection(null)}
          onSetWordStatus={onSetWordStatus}
          onAfterChange={refreshIPlusOne}
        />
      )}
    </div>
  );
};
