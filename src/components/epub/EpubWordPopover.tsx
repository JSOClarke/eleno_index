import React, { useEffect, useRef, useState } from "react";
import { BookOpen, FileText, GraduationCap, Image as ImageIcon, Layers, Volume2, X } from "lucide-react";
import { useSwipeDismiss } from "@/hooks/useSwipeDismiss";
import { downloadApkgDeck } from "@/lib/ankiApkgExport";
import { getPosMeta, parseMorphChips } from "@/lib/epub/epubGrammarUtils";
import { getFrequencyBand } from "@/lib/epub/epubHighlightUtils";
import { fetchWordImages, speakSpanish, translateSentence, type WordImagePair } from "@/lib/epub/epubParseClient";
import { EpubPopoverTabs } from "./EpubPopoverTabs";
import type { SelectedWordContext } from "@/types/epubReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface EpubWordPopoverProps {
  ctx: SelectedWordContext | null;
  userId?: string | null;
  language: string;
  bookTitle: string;
  statusMap: Record<string, UserVocabStatus>;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onClose: () => void;
}

export const EpubWordPopover: React.FC<EpubWordPopoverProps> = ({
  ctx, userId, language, bookTitle, statusMap, onSetWordStatus, onClose,
}) => {
  const [tab, setTab] = useState<"defs" | "ctx" | "img">("defs");
  const [defLang, setDefLang] = useState<"en" | "es" | "both">("en");
  const [translation, setTranslation] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [images, setImages] = useState<WordImagePair | null>(null);
  const [posOpen, setPosOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const swipe = useSwipeDismiss(Boolean(ctx), onClose, sheetRef, bodyRef);

  const c = ctx?.token.canonical;
  const lemma = c?.lemma || ctx?.token.surface || "";
  const canonicalId = c?.canonical_id || c?.id || "";
  const enDefs = c?.definitions || [];
  const esDefs = c?.definitions_es || c?.es_definitions || [];

  useEffect(() => { setTab("defs"); setTranslation(null); setImages(null); setPosOpen(false); }, [ctx]);
  useEffect(() => {
    if (ctx && tab === "img" && !images) fetchWordImages(lemma, enDefs[0] || "", language).then(setImages);
  }, [ctx, tab, images, lemma, enDefs, language]);

  if (!ctx) return null;

  const status = (canonicalId ? statusMap[canonicalId] : undefined) || ctx.token.user_status || null;
  const morphChips = parseMorphChips(ctx.token.morph, language);
  const pos = c?.pos || ctx.token.pos || "";
  const posMeta = getPosMeta(pos);
  const bandInfo = getFrequencyBand(c?.rank ?? c?.tubelex_rank);
  const rankSource = c?.rank_source || (c?.tubelex_rank ? "TubeLex" : "Rank");
  const displayRank = c?.rank ?? c?.tubelex_rank ?? null;
  const displayLevel = c?.level || c?.cefr || null;
  const showSurface = ctx.token.surface && ctx.token.surface.toLowerCase() !== lemma.toLowerCase();

  const handleTranslate = async () => {
    setTranslating(true);
    try { setTranslation(await translateSentence(ctx.sentence, language)); } catch { setTranslation("Could not translate sentence."); } finally { setTranslating(false); }
  };

  const handleExportAnki = () => void downloadApkgDeck([{
    canonical_id: canonicalId || lemma, lemma, pos: pos || "", cefr: c?.level || c?.cefr || "",
    ipa: c?.ipa || null, reading: c?.reading || null, frequency: 1, first_occurrence_index: 0, first_timestamp_ms: null,
    first_context_snippet: ctx.sentence, global_rank: displayRank,
    definitions: enDefs.length ? enDefs : esDefs,
    rankings: c?.rankings?.length ? c.rankings.map((r) => ({ source: r.source, rank: r.rank, count: r.count ?? null, cefr: r.level ?? null })) : [],
  }], statusMap, bookTitle);

  const topPos = Math.min(window.innerHeight - 380, ctx.anchorRect.bottom + 8);
  const leftPos = Math.max(12, Math.min(window.innerWidth - 388, ctx.anchorRect.left));

  return (
    <div className="fixed inset-0 z-50 overscroll-none bg-[#0F172A]/15 md:bg-transparent" onClick={onClose}>
      <div
        ref={sheetRef}
        data-epub-popover
        onClick={(e) => e.stopPropagation()}
        style={{ "--desk-top": `${Math.max(12, topPos)}px`, "--desk-left": `${leftPos}px`, transform: swipe.dragY > 0 ? `translateY(${swipe.dragY}px)` : undefined } as React.CSSProperties}
        className={`fixed bottom-0 left-0 right-0 overscroll-none md:bottom-auto md:right-auto md:top-[var(--desk-top)] md:left-[var(--desk-left)] md:w-[376px] rounded-t-2xl md:rounded-2xl bg-white text-[#0F172A] shadow-[0_20px_45px_rgba(15,23,42,0.16),0_4px_12px_rgba(15,23,42,0.08)] overflow-hidden max-h-[82vh] flex flex-col ${swipe.dragY === 0 ? "transition-transform duration-200 ease-out" : ""}`}
      >
        <div className="h-[3px] w-full shrink-0 bg-[#0F172A]" />
        <div className="md:hidden flex justify-center pt-2 pb-0.5 shrink-0"><div className="h-1 w-9 rounded-full bg-slate-300" /></div>
        <div ref={bodyRef} className="px-[18px] py-3.5 space-y-3 overflow-y-auto flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-end gap-2">
                <span className="font-serif text-[30px] font-medium leading-[1.02] tracking-[-0.02em] text-[#0F172A]">{lemma}</span>
                {c?.ipa && <span className="pb-0.5 font-mono text-[11.5px] font-medium text-[#64748B]">{c.ipa}</span>}
                <button type="button" onClick={(e) => speakSpanish(lemma, language, e.shiftKey ? 0.72 : 1.0)} onContextMenu={(e) => { e.preventDefault(); speakSpanish(lemma, language, 0.72); }} title="Play pronunciation · Right-click for 0.7x slow" className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-1.5 text-[#64748B] hover:border-[#CBD5E1] hover:bg-[#F1F5F9] hover:text-[#0F172A] cursor-pointer">
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {showSurface && <div className="mt-1 text-[11px] text-[#64748B]">In text: “{ctx.token.surface}”</div>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span title="Threshold" className="p-1 text-[#0F172A]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M2 20V14.75H8.5V9.5H15.5V4H22V20H2Z" fill="currentColor" /></svg></span>
              <button type="button" onClick={onClose} title="Close (Esc)" className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 text-[10px] font-medium">
            {displayLevel && <span className="inline-flex items-center gap-1 rounded-full border border-[#0F172A] bg-[#0F172A] px-2 py-0.5 text-white"><GraduationCap className="h-2.5 w-2.5" />{displayLevel}</span>}
            {displayRank && <span className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-[#F1F5F9] px-2 py-0.5 text-[#0F172A]"><Layers className="h-2.5 w-2.5" />{rankSource} #{displayRank} ({bandInfo.label})</span>}
            {c?.subtlex_rank && (!c?.rank_source || c.rank_source !== "SUBTLEX-CH") && <span className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[#475569]">SUBTLEX #{c.subtlex_rank}</span>}
            {(posMeta || pos) && (
              <button type="button" onClick={() => posMeta && setPosOpen((v) => !v)} className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A] cursor-pointer">
                {posMeta ? posMeta.label : pos}
              </button>
            )}
            {morphChips.map((chip) => <span key={chip} className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[#475569]">{chip}</span>)}
          </div>
          {posOpen && posMeta && (
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-xs leading-[1.45]">
              <div className="font-semibold text-[#0F172A]">{posMeta.label} · {posMeta.esLabel}</div>
              <div className="mt-0.5 text-[#64748B]">{posMeta.desc}</div>
            </div>
          )}

          <EpubPopoverTabs
            tab={tab} defLang={defLang} onChangeDefLang={setDefLang} enDefs={enDefs} esDefs={esDefs}
            phrases={ctx.phrases} iPlusOne={ctx.iPlusOne} sentence={ctx.sentence} language={language}
            canonicalId={canonicalId} userId={userId} statusMap={statusMap}
            translation={translation} translating={translating} images={images}
            onTranslate={handleTranslate} onExportAnki={handleExportAnki}
          />

          {canonicalId && (
            <div className="flex items-center gap-2 pt-1">
              <button type="button" onClick={() => onSetWordStatus(canonicalId, status === "learning" ? null : "learning")}
                className={`flex-1 rounded-lg py-[7px] text-[11.5px] cursor-pointer transition ${status === "learning" ? "bg-[#0F172A] font-semibold text-white hover:bg-[#1E293B]" : "bg-[#F1F5F9] font-medium text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A]"}`}>Learn</button>
              <button type="button" onClick={() => onSetWordStatus(canonicalId, status === "known" ? null : "known")}
                className={`flex-1 rounded-lg py-[7px] text-[11.5px] cursor-pointer transition ${status === "known" ? "bg-[#0F172A] font-semibold text-white hover:bg-[#1E293B]" : "bg-[#F1F5F9] font-medium text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A]"}`}>Known</button>
            </div>
          )}
        </div>

        <div className="flex gap-1 border-t border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5">
          {([{ id: "defs", label: "Definitions", Icon: BookOpen }, { id: "ctx", label: "Sentence", Icon: FileText }, { id: "img", label: "Visual", Icon: ImageIcon }] as const).map(({ id, label, Icon }) => (
            <button key={id} type="button" onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] cursor-pointer transition ${tab === id ? "bg-[#0F172A] font-semibold text-white shadow-xs" : "font-medium text-[#64748B] hover:bg-white hover:text-[#0F172A]"}`}>
              <Icon className="h-3.5 w-3.5" /><span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
