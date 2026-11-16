import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { MOCK_CHAPTER_METRICS } from "@/redesign/mocks/chapterMocks";
import {
  MOCK_INSPECTOR_WORDS,
  MOCK_PERIPHRASES,
  MOCK_QUARANTINE_ITEMS,
} from "@/redesign/mocks/inspectorMocks";
import type { MediaCatalogItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { RedesignChapterBreakdown } from "./RedesignChapterBreakdown";
import { RedesignChapterPacing } from "./RedesignChapterPacing";
import { RedesignInspectorHero } from "./RedesignInspectorHero";
import { RedesignPrimerTable } from "./RedesignPrimerTable";
import { RedesignProfileStatsRow } from "./RedesignProfileStatsRow";
import { RedesignQuarantineGrid } from "./RedesignQuarantineGrid";

type LedgerTab = "canonical" | "chapters" | "periphrasis" | "characters" | "noise";

interface RedesignInspectorViewProps {
  item: MediaCatalogItem;
}

export const RedesignInspectorView: React.FC<RedesignInspectorViewProps> = ({ item }) => {
  const [tab, setTab] = useState<LedgerTab>("canonical");
  const [selectedChapter, setSelectedChapter] = useState<number | "all">("all");
  const chapters = MOCK_CHAPTER_METRICS[item.id] || MOCK_CHAPTER_METRICS["942f8b2c-8888-40e4-ac07-340209a23d67"];
  const words = MOCK_INSPECTOR_WORDS[item.id] || MOCK_INSPECTOR_WORDS.default;
  const [statusMap, setStatusMap] = useState<Record<string, UserVocabStatus>>({
    w3: "known",
    w4: "known",
    w2: "learning",
    e1: "learning",
  });

  const handleToggleStatus = (canonicalId: string, target: UserVocabStatus) => {
    setStatusMap((prev) => {
      const next = { ...prev };
      if (next[canonicalId] === target) delete next[canonicalId];
      else next[canonicalId] = target;
      return next;
    });
  };

  const tabs: { id: LedgerTab; label: string }[] = [
    { id: "canonical", label: `Canonical Primer (${words.length})` },
    { id: "chapters", label: `Chapter Breakdown (${chapters.length})` },
    { id: "periphrasis", label: `Periphrases (${MOCK_PERIPHRASES.length})` },
    { id: "characters", label: "Cast of Characters" },
    { id: "noise", label: "Filtered Noise" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/preview" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Catalogue
        </Link>
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Media ID: {item.id.slice(0, 8)}
        </span>
      </div>

      <RedesignInspectorHero item={item} />

      <RedesignProfileStatsRow metrics={item.metrics} />

      <RedesignChapterPacing
        chapters={chapters}
        selectedChapter={selectedChapter}
        onSelectChapter={setSelectedChapter}
        bookMetrics={item.metrics}
        bookComprehension={item.comprehension}
      />

      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200/80 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium cursor-pointer transition ${
                tab === t.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "canonical" && (
          <RedesignPrimerTable
            words={words}
            selectedChapter={selectedChapter}
            onClearChapter={() => setSelectedChapter("all")}
            statusMap={statusMap}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {tab === "chapters" && (
          <RedesignChapterBreakdown
            chapters={chapters}
            selectedChapter={selectedChapter}
            onSelectChapter={setSelectedChapter}
          />
        )}

        {tab === "periphrasis" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_PERIPHRASES.map((p) => (
              <div key={p.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-slate-900">{p.pattern}</span>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                    {p.category} · {p.count}×
                  </span>
                </div>
                <div className="text-sm text-slate-700">{p.meaning}</div>
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                  <span className="font-semibold text-indigo-700">{p.exampleSurface}</span> —{" "}
                  <span className="font-serif italic text-sm">«{p.exampleSentence}»</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {(tab === "characters" || tab === "noise") && (
          <RedesignQuarantineGrid items={MOCK_QUARANTINE_ITEMS} mode={tab} />
        )}
      </div>
    </div>
  );
};
