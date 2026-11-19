import React from "react";
import { BookOpen, Check } from "lucide-react";
import type { DictionaryWord } from "@/types/dictionary.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface DictionaryWordCardProps {
  word: DictionaryWord;
  status?: UserVocabStatus;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onSetStatus: (canonicalId: string, next: UserVocabStatus | null) => void;
}

export const DictionaryWordCard: React.FC<DictionaryWordCardProps> = ({
  word,
  status,
  isAuthenticated,
  onRequireAuth,
  onSetStatus,
}) => {
  const toggleStatus = (target: UserVocabStatus) => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    onSetStatus(word.id, status === target ? null : target);
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
              {word.lemma}
            </h2>
            {word.pos && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                {word.pos}
              </span>
            )}
            {word.cefr && (
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-white">
                {word.cefr}
              </span>
            )}
            {word.freq_rank && (
              <span className="text-xs font-medium text-slate-400 tabular-nums">
                Rank #{word.freq_rank.toLocaleString()}
              </span>
            )}
          </div>
          {word.pronunciations.length > 0 && (
            <div className="text-xs font-mono text-slate-500">
              {word.pronunciations.join(" · ")}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => toggleStatus("known")}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${
              status === "known"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            <span>{status === "known" ? "Known" : "Mark known"}</span>
          </button>
          <button
            type="button"
            onClick={() => toggleStatus("learning")}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${
              status === "learning"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>{status === "learning" ? "Learning" : "Learn"}</span>
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3.5 space-y-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Definitions
        </div>
        {word.definitions.length > 0 ? (
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 leading-relaxed">
            {word.definitions.slice(0, 8).map((def, idx) => (
              <li key={idx}>{def}</li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-slate-400">No English definition recorded.</p>
        )}
      </div>
    </section>
  );
};
