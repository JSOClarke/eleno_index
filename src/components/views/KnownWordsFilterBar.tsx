import React from "react";
import { Search } from "lucide-react";
import { FilterSelectDropdown } from "@/components/ui/FilterSelectDropdown";
import { getRankOptionsForLanguage, type RankingSourceKey } from "@/lib/vocabSorting";

const STATE_OPTS: ReadonlyArray<readonly ["ALL" | "LEARNING" | "KNOWN", string]> = [
  ["ALL", "All"], ["LEARNING", "Learning"], ["KNOWN", "Known"],
];
const POS_OPTS = [
  { value: "ALL", label: "All" },
  { value: "NOUN", label: "Noun" },
  { value: "VERB", label: "Verb" },
  { value: "ADJ", label: "Adj" },
  { value: "ADV", label: "Adv" },
] as const;

interface KnownWordsFilterBarProps {
  query: string;
  onQueryChange: (val: string) => void;
  stateFilter: "ALL" | "LEARNING" | "KNOWN";
  onStateFilter: (val: "ALL" | "LEARNING" | "KNOWN") => void;
  counts: { ALL: number; LEARNING: number; KNOWN: number };
  rankingSource: RankingSourceKey;
  onRankingSource: (val: RankingSourceKey) => void;
  posFilter: string;
  onPosFilter: (val: string) => void;
  language?: string;
}

export const KnownWordsFilterBar: React.FC<KnownWordsFilterBarProps> = ({
  query, onQueryChange, stateFilter, onStateFilter, counts,
  rankingSource, onRankingSource, posFilter, onPosFilter, language,
}) => {
  const rankOptions = getRankOptionsForLanguage(language);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search tracked lemma..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-400 focus:bg-white"
          />
        </div>
        <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5 text-xs">
          {STATE_OPTS.map(([st, label]) => (
            <button
              key={st}
              type="button"
              onClick={() => onStateFilter(st)}
              className={`rounded-full px-3 py-1 cursor-pointer transition ${
                stateFilter === st ? "bg-slate-900 text-white font-semibold shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label} ({counts[st]})
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <FilterSelectDropdown
          prefix="Rank"
          value={rankingSource}
          options={rankOptions}
          onChange={onRankingSource}
          ariaLabel="Frequency ranking source"
        />
        <FilterSelectDropdown
          prefix="POS"
          value={posFilter}
          options={POS_OPTS}
          onChange={onPosFilter}
          ariaLabel="Part of speech filter"
        />
      </div>
    </div>
  );
};
