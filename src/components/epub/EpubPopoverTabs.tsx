import React from "react";
import { Download, ExternalLink, Languages, Volume2 } from "lucide-react";
import { speakSpanish, type WordImagePair } from "@/lib/epub/epubParseClient";
import type { EpubPopoverAdapter, ParsedPhrase } from "@/types/epubReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { EpubSentenceBankSection } from "./EpubSentenceBankSection";

interface EpubPopoverTabsProps {
  tab: "defs" | "ctx" | "img";
  defLang: "en" | "es" | "both";
  onChangeDefLang: (dl: "en" | "es" | "both") => void;
  enDefs: string[];
  esDefs: string[];
  phrases: ParsedPhrase[];
  iPlusOne?: { isTarget: boolean; targetSurface: string } | null;
  sentence: string;
  language: string;
  canonicalId?: string;
  userId?: string | null;
  statusMap: Record<string, UserVocabStatus>;
  translation: string | null;
  translating: boolean;
  images: WordImagePair | null;
  onTranslate: () => void;
  onExportAnki: () => void;
  adapter?: EpubPopoverAdapter;
}

export const EpubPopoverTabs: React.FC<EpubPopoverTabsProps> = ({
  tab, defLang, onChangeDefLang, enDefs, esDefs, phrases, iPlusOne, sentence, language,
  canonicalId, userId, statusMap, translation, translating, images, onTranslate, onExportAnki, adapter,
}) => {
  if (tab === "defs") {
    return (
      <div className="space-y-2.5">
        {phrases.map((p, i) => {
          const kindLabel = p.type === "periphrasis" ? "Periphrasis" : "Idiom";
          const title = p.canonical_phrase || p.phrase || "";
          const gloss = p.gloss || p.definitions?.[0] || p.phrase || "";
          return (
            <div key={i} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[11px] leading-[1.38] text-[#0F172A]">
              <strong>{kindLabel} · {title}</strong>{gloss ? ` — ${gloss}` : ""}
            </div>
          );
        })}
        {iPlusOne && (
          <div className="rounded-xl border border-[#0F172A] bg-[#0F172A] px-3 py-2 text-[11px] leading-[1.38] text-white">
            {iPlusOne.isTarget ? (
              <><strong>i+1 Target</strong> · Only unknown word in this sentence — ideal to learn</>
            ) : (
              <><strong>i+1 Sentence</strong> · Only missing word: <strong>{iPlusOne.targetSurface}</strong></>
            )}
          </div>
        )}
        <div className="border-t border-[#E2E8F0] pt-2.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#94A3B8]">Definitions</span>
            {esDefs.length > 0 && (
              <div className="inline-flex gap-0.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-0.5">
                {(["en", "es", "both"] as const).map((dl) => (
                  <button key={dl} type="button" onClick={() => onChangeDefLang(dl)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase cursor-pointer ${defLang === dl ? "bg-[#0F172A] text-white" : "text-[#64748B]"}`}>
                    {dl}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ul className="max-h-[155px] space-y-1.5 overflow-y-auto text-[13px] leading-[1.38]">
            {(defLang === "en" || defLang === "both" || esDefs.length === 0) && enDefs.slice(0, 5).map((d, i) => (
              <li key={`en-${i}`} className="flex items-start gap-2 text-[#0F172A]"><span className="text-[#94A3B8]">–</span><span>{d}</span></li>
            ))}
            {(defLang === "es" || defLang === "both") && esDefs.slice(0, 5).map((d, i) => (
              <li key={`es-${i}`} className="flex items-start gap-2 text-[#64748B]"><span className="text-[#94A3B8]">–</span><span>{d}</span></li>
            ))}
            {!enDefs.length && !esDefs.length && <li className="text-xs text-[#94A3B8]">No dictionary senses recorded.</li>}
          </ul>
        </div>
      </div>
    );
  }

  if (tab === "ctx") {
    return (
      <div className="space-y-2.5">
        <p className="font-serif text-[14px] leading-[1.55] text-[#0F172A]">{sentence}</p>
        {translation && <p className="border-t border-[#E2E8F0] pt-2 text-[12.5px] leading-[1.5] text-[#64748B]">{translation}</p>}
        <div className="flex flex-wrap gap-1.5 pt-0.5 text-[11px] font-medium">
          <button type="button" onClick={() => (adapter?.speak || speakSpanish)(sentence, language)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[#64748B] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#0F172A] cursor-pointer"><Volume2 className="h-3 w-3" /> Audio</button>
          {!translation && (
            <button type="button" onClick={onTranslate} disabled={translating} className="inline-flex items-center gap-1.5 rounded-lg border border-[#0F172A] bg-[#0F172A] px-2.5 py-1.5 text-white hover:opacity-90 disabled:opacity-50 cursor-pointer">
              <Languages className="h-3 w-3" /> {translating ? "Translating…" : "Translate"}
            </button>
          )}
          <button type="button" onClick={onExportAnki} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[#64748B] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#0F172A] cursor-pointer"><Download className="h-3 w-3" /> Anki (.apkg)</button>
        </div>
        {canonicalId && (
          <EpubSentenceBankSection canonicalId={canonicalId} userId={userId} language={language} statusMap={statusMap} fetchSentences={adapter?.fetchSentences} speak={adapter?.speak} />
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {!images && <div className="col-span-2 py-4 text-center text-[11.5px] text-[#64748B]">Loading Wikipedia visuals…</div>}
      {images && !images.es && !images.en && <div className="col-span-2 py-4 text-center text-[11.5px] text-[#64748B]">No Wikipedia images found.</div>}
      {[images?.es, images?.en].filter(Boolean).map((hit, i) => (
        <a key={i} href={hit!.page_url} target="_blank" rel="noreferrer" className="flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white hover:border-[#CBD5E1]">
          <div className="flex items-center justify-between gap-1 border-b border-[#E2E8F0] px-2 py-1 text-[10px] font-medium text-[#64748B]">
            <span className="truncate">{hit!.source}</span>
            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
          </div>
          <img src={hit!.url} alt={hit!.title} className="h-24 w-full bg-[#F8FAFC] object-cover" />
        </a>
      ))}
    </div>
  );
};
