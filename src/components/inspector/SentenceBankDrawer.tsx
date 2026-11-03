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
  const [selectedToken, setSelectedToken] = useState<SentenceToken | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setMode("all");
    setSelectedToken(null);
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
  }, [canonicalId, mediaItemId]);

  useEffect(() => {
    if (mode !== "iplus1") return;
    if (!userId) {
      setIPlusOne([]);
      return;
    }
    let cancelled = false;
    setLoadingI(true);
    fetchIPlusOneSentences(canonicalId, userId, mediaItemId, 10)
      .then((rows) => {
        if (!cancelled) setIPlusOne(rows);
      })
      .finally(() => {
        if (!cancelled) setLoadingI(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, canonicalId, userId, mediaItemId, reloadKey]);

  const sentences = mode === "all" ? allSentences : iPlusOne;
  const loading = mode === "all" ? loadingAll : loadingI;
  const changeMode = (next: Mode) => {
    setMode(next);
    setSelectedToken(null);
  };
  const refreshIPlusOne = () => {
    window.setTimeout(() => setReloadKey((key) => key + 1), 600);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SentenceBankModeToggle mode={mode} userId={userId} onChange={changeMode} />
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#666666]">
          {sentences ? `${sentences.length} found` : "loading"}
        </span>
      </div>

      {loading ? (
        <div className="border-l-2 border-[#CCCCCC] pl-3 py-1 space-y-2 animate-pulse">
          <div className="h-2.5 w-24 bg-[#DFDFDC]" />
          <div className="h-3.5 w-11/12 bg-[#DFDFDC]" />
          <div className="h-3.5 w-3/5 bg-[#E6E6E3]" />
        </div>
      ) : !sentences || sentences.length === 0 ? (
        <div className="font-mono text-xs text-[#666666]">
          {mode === "iplus1"
            ? "No sentence where this word is the only unknown word yet."
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
              onSelectToken={setSelectedToken}
            />
          ))}
        </div>
      )}

      {selectedToken && (
        <SentenceTokenInspector
          token={selectedToken}
          status={selectedToken.canonical_id ? statusMap[selectedToken.canonical_id] : undefined}
          onClose={() => setSelectedToken(null)}
          onSetWordStatus={onSetWordStatus}
          onAfterChange={refreshIPlusOne}
        />
      )}
    </div>
  );
};
