import React from "react";
import { Link } from "react-router-dom";
import { SentenceTokenLine } from "@/components/inspector/SentenceTokenLine";
import type { DictionarySentence } from "@/types/dictionary.types";
import type { SentenceToken } from "@/types/sentence.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface DictionarySentenceListProps {
  canonicalId: string;
  sentences: DictionarySentence[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  iPlusOne: boolean;
  isAuthenticated: boolean;
  statusMap: Record<string, UserVocabStatus>;
  onToggleIPlusOne: () => void;
  onLoadMore: () => void;
  onSelectToken: (token: SentenceToken) => void;
}

export const DictionarySentenceList: React.FC<DictionarySentenceListProps> = ({
  canonicalId,
  sentences,
  loading,
  loadingMore,
  hasMore,
  iPlusOne,
  isAuthenticated,
  statusMap,
  onToggleIPlusOne,
  onLoadMore,
  onSelectToken,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Sentence Bank</h3>
          <p className="text-xs text-slate-400">
            Click any word in a sentence to inspect it
          </p>
        </div>

        {isAuthenticated && (
          <button
            type="button"
            onClick={onToggleIPlusOne}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${
              iPlusOne
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            i+1 Only
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : sentences.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
          {iPlusOne
            ? "No i+1 sentences found in the fast sample for this word. Try turning off i+1 Only."
            : "No example sentences found for this word."}
        </div>
      ) : (
        <div className="space-y-2.5">
          {sentences.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-slate-200/80 bg-slate-50/40 px-4 py-3 space-y-1.5"
            >
              <p className="text-sm leading-relaxed text-slate-800">
                <SentenceTokenLine
                  sentence={s.sentence}
                  tokens={s.tokens}
                  targetCanonicalId={canonicalId}
                  statusMap={statusMap}
                  onSelectToken={onSelectToken}
                />
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <Link
                  to={`/media/${s.media_item_id}`}
                  className="truncate font-medium text-slate-500 hover:text-slate-900 hover:underline"
                >
                  {s.media_title}
                  {s.media_creator ? ` · ${s.media_creator}` : ""}
                </Link>
                <div className="flex items-center gap-2 shrink-0 tabular-nums">
                  <span>{s.token_count} words</span>
                  {typeof s.unknown_count === "number" && (() => {
                    const totalUnknown = s.unknown_count + (statusMap[canonicalId] === "known" ? 0 : 1);
                    return (
                      <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {totalUnknown === 0 ? "All known" : `i+${totalUnknown}`}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div className="pt-1 text-center">
          <button
            type="button"
            disabled={loadingMore}
            onClick={onLoadMore}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition"
          >
            {loadingMore ? "Loading..." : "Load more sentences"}
          </button>
        </div>
      )}
    </section>
  );
};
