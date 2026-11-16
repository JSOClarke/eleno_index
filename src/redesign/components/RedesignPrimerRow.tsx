import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { getCefrBadgeClass } from "@/redesign/lib/displayHelpers";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";

interface RedesignPrimerRowProps {
  word: VocabularyWord;
  rankingSource: "tubelex_v2025" | "elelex_v2020";
  status: UserVocabStatus | undefined;
  onToggleStatus: (canonicalId: string, target: UserVocabStatus) => void;
}

export const RedesignPrimerRow: React.FC<RedesignPrimerRowProps> = ({
  word,
  rankingSource,
  status,
  onToggleStatus,
}) => {
  const [open, setOpen] = useState(false);

  const isEpisodeSnippet = /^\d+x\d+/i.test(word.first_context_snippet || "");
  const debutLabel = word.first_context_snippet
    ? isEpisodeSnippet
      ? `Ep. ${word.first_occurrence_index} · ${word.first_context_snippet}`
      : `Ch. ${word.first_occurrence_index} · ${word.first_context_snippet}`
    : `Chapter ${word.first_occurrence_index}`;

  const rankingEntry = word.rankings?.find((r) =>
    rankingSource === "tubelex_v2025"
      ? r.source === "tubelex_v2025" || r.source === "lexique383"
      : r.source === "elelex_v2020" || r.source === "flelex_v2020" || r.source === "flelex_v1"
  );
  const activeRank = rankingEntry?.rank ?? null;
  const isLearning = status === "learning";
  const isKnown = status === "known";

  const actionButtons = (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium cursor-pointer transition ${
          open ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        <span>Context</span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      <button
        type="button"
        onClick={() => onToggleStatus(word.canonical_id, "learning")}
        className={`rounded-lg px-2 py-1 text-[11px] font-medium cursor-pointer transition ${
          isLearning ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        Learn
      </button>
      <button
        type="button"
        onClick={() => onToggleStatus(word.canonical_id, "known")}
        className={`rounded-lg px-2 py-1 text-[11px] font-medium cursor-pointer transition ${
          isKnown ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        Known ✓
      </button>
    </div>
  );

  return (
    <div className="transition-colors hover:bg-slate-50/70">
      <div className="space-y-2 px-4 py-3 md:hidden">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-slate-900">{word.lemma}</div>
            <div className="text-xs text-slate-400">{word.ipa || "—"} · {word.pos}</div>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getCefrBadgeClass(word.cefr)}`}>
            {word.cefr}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          {word.frequency}× · {activeRank ? `#${formatNumber(activeRank)}` : "Unranked"}
        </div>
        {actionButtons}
      </div>

      <div className="hidden grid-cols-12 items-center gap-3 px-4 py-3 text-xs md:grid">
        <div className="col-span-2 truncate font-semibold text-slate-900">{word.lemma}</div>
        <div className="col-span-2 truncate text-slate-400 font-mono text-[11px]">{word.ipa || "—"}</div>
        <div className="col-span-1 text-[11px] font-medium text-slate-500">{word.pos}</div>
        <div className="col-span-1">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getCefrBadgeClass(word.cefr)}`}>
            {word.cefr}
          </span>
        </div>
        <div className="col-span-1 tabular-nums text-slate-700">{word.frequency}×</div>
        <div className="col-span-1 tabular-nums text-slate-500">
          {activeRank ? `#${formatNumber(activeRank)}` : "—"}
        </div>
        <div className="col-span-2 truncate text-slate-500" title={debutLabel}>
          {debutLabel}
        </div>
        <div className="col-span-2">{actionButtons}</div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-3.5 space-y-2">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Definitions:</span>
            <span className="text-sm text-slate-800">
              {word.definitions.length > 0 ? word.definitions.join(" · ") : "No definitions indexed yet."}
            </span>
          </div>
          {word.first_context_snippet && (
            <div className="text-xs text-slate-600">
              <span className="font-semibold uppercase tracking-wider text-slate-400 mr-2">Example Sentence:</span>
              <span className="font-serif text-sm italic text-slate-700">«{word.first_context_snippet}»</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
