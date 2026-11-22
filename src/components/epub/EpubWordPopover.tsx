import React, { useEffect, useState } from "react";
import { Volume2, X } from "lucide-react";
import { getCefrBadgeClass } from "@/lib/catalogueDisplay";
import { downloadApkgDeck } from "@/lib/ankiApkgExport";
import { fetchWordImages, speakSpanish, translateSentence, type WordImagePair } from "@/lib/epub/epubParseClient";
import { EpubPopoverTabs } from "./EpubPopoverTabs";
import type { SelectedWordContext } from "@/types/epubReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface EpubWordPopoverProps {
  ctx: SelectedWordContext | null;
  language: string;
  bookTitle: string;
  statusMap: Record<string, UserVocabStatus>;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onClose: () => void;
}

export const EpubWordPopover: React.FC<EpubWordPopoverProps> = ({
  ctx, language, bookTitle, statusMap, onSetWordStatus, onClose,
}) => {
  const [tab, setTab] = useState<"defs" | "ctx" | "img">("defs");
  const [defLang, setDefLang] = useState<"en" | "es" | "both">("en");
  const [translation, setTranslation] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [images, setImages] = useState<WordImagePair | null>(null);

  const c = ctx?.token.canonical;
  const lemma = c?.lemma || ctx?.token.surface || "";
  const canonicalId = c?.canonical_id || c?.id || "";
  const enDefs = c?.definitions || [];
  const esDefs = c?.definitions_es || c?.es_definitions || [];

  useEffect(() => { setTab("defs"); setTranslation(null); setImages(null); }, [ctx]);

  useEffect(() => {
    if (!ctx || tab !== "img" || images) return;
    fetchWordImages(lemma, enDefs[0] || "", language).then(setImages);
  }, [ctx, tab, images, lemma, enDefs, language]);

  if (!ctx) return null;

  const status = (canonicalId ? statusMap[canonicalId] : undefined) || ctx.token.user_status || null;
  const morphEntries = Object.entries(ctx.token.morph || {}).slice(0, 4);
  const pos = c?.pos || ctx.token.pos || "";

  const handleTranslate = async () => {
    setTranslating(true);
    try { setTranslation(await translateSentence(ctx.sentence, language)); }
    catch { setTranslation("Could not translate sentence."); }
    finally { setTranslating(false); }
  };

  const handleExportAnki = () => {
    void downloadApkgDeck(
      [{
        canonical_id: canonicalId || lemma, lemma, pos: pos || "WORD",
        cefr: c?.cefr || "B1", ipa: c?.ipa || null, frequency: 1,
        first_occurrence_index: 0, first_timestamp_ms: null,
        first_context_snippet: ctx.sentence, global_rank: c?.rank ?? null,
        definitions: enDefs.length ? enDefs : esDefs,
        rankings: c?.rank ? [{ source: "tubelex_v2025", rank: c.rank, count: 0, cefr: c.cefr ?? null }] : [],
      }],
      statusMap,
      bookTitle
    );
  };

  const topPos = Math.min(window.innerHeight - 360, ctx.anchorRect.bottom + 8);
  const leftPos = Math.max(12, Math.min(window.innerWidth - 360, ctx.anchorRect.left));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/15 md:bg-transparent" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ "--desk-top": `${Math.max(12, topPos)}px`, "--desk-left": `${leftPos}px` } as React.CSSProperties}
        className="fixed bottom-0 left-0 right-0 md:bottom-auto md:right-auto md:top-[var(--desk-top)] md:left-[var(--desk-left)] md:w-[352px] rounded-t-2xl md:rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
      >
        <div className="h-[3px] w-full bg-slate-900" />
        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-semibold tracking-tight">{lemma}</span>
                {c?.ipa && <span className="font-mono text-xs text-slate-400">/{c.ipa}/</span>}
                <button type="button" onClick={() => speakSpanish(lemma, language)} aria-label="Pronounce word" className="rounded-md p-1 text-slate-500 hover:bg-slate-100 cursor-pointer">
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                {c?.cefr && <span className={`rounded-full px-2 py-0.5 font-semibold ${getCefrBadgeClass(c.cefr)}`}>{c.cefr}</span>}
                {pos && <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">{pos}</span>}
                {c?.rank && <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-slate-600">#{c.rank}</span>}
                {morphEntries.map(([k, v]) => <span key={k} className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-500">{v}</span>)}
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="h-4 w-4" /></button>
          </div>
          {canonicalId && (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => onSetWordStatus(canonicalId, status === "learning" ? null : "learning")}
                className={`flex-1 rounded-lg border py-1.5 text-xs font-medium cursor-pointer transition ${status === "learning" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>Learn</button>
              <button type="button" onClick={() => onSetWordStatus(canonicalId, status === "known" ? null : "known")}
                className={`flex-1 rounded-lg border py-1.5 text-xs font-medium cursor-pointer transition ${status === "known" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>Known</button>
            </div>
          )}
          <div className="flex gap-1 border-b border-slate-100 pb-2 text-xs">
            {(["defs", "ctx", "img"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`rounded-lg px-2.5 py-1 font-medium cursor-pointer ${tab === t ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                {t === "defs" ? "Definitions" : t === "ctx" ? "Sentence" : "Visual"}
              </button>
            ))}
          </div>
          <EpubPopoverTabs
            tab={tab} defLang={defLang} onChangeDefLang={setDefLang} enDefs={enDefs} esDefs={esDefs}
            phrases={ctx.phrases} sentence={ctx.sentence} language={language} translation={translation}
            translating={translating} images={images} onTranslate={handleTranslate} onExportAnki={handleExportAnki}
          />
        </div>
      </div>
    </div>
  );
};
