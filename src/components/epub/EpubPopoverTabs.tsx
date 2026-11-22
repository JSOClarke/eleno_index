import React from "react";
import { Download, Languages, Volume2 } from "lucide-react";
import { speakSpanish, type WordImagePair } from "@/lib/epub/epubParseClient";
import type { ParsedPhrase } from "@/types/epubReader.types";

interface EpubPopoverTabsProps {
  tab: "defs" | "ctx" | "img";
  defLang: "en" | "es" | "both";
  onChangeDefLang: (dl: "en" | "es" | "both") => void;
  enDefs: string[];
  esDefs: string[];
  phrases: ParsedPhrase[];
  sentence: string;
  language: string;
  translation: string | null;
  translating: boolean;
  images: WordImagePair | null;
  onTranslate: () => void;
  onExportAnki: () => void;
}

export const EpubPopoverTabs: React.FC<EpubPopoverTabsProps> = ({
  tab, defLang, onChangeDefLang, enDefs, esDefs, phrases, sentence, language,
  translation, translating, images, onTranslate, onExportAnki,
}) => {
  if (tab === "defs") {
    return (
      <div className="space-y-2.5 text-xs">
        <div className="flex gap-1">
          {(["en", "es", "both"] as const).map((dl) => (
            <button key={dl} type="button" onClick={() => onChangeDefLang(dl)}
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase cursor-pointer ${defLang === dl ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>
              {dl}
            </button>
          ))}
        </div>
        {(defLang === "en" || defLang === "both") && enDefs.slice(0, 4).map((d, i) => <div key={`en-${i}`} className="text-slate-700">• {d}</div>)}
        {(defLang === "es" || defLang === "both") && esDefs.slice(0, 4).map((d, i) => <div key={`es-${i}`} className="text-slate-500 italic">• {d}</div>)}
        {!enDefs.length && !esDefs.length && <div className="text-slate-400">No dictionary senses recorded.</div>}
        {phrases.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Idioms & Phrases</div>
            {phrases.map((p, i) => <div key={i}><strong className="text-slate-900">{p.phrase}</strong>{p.definitions?.[0] ? ` — ${p.definitions[0]}` : ""}</div>)}
          </div>
        )}
      </div>
    );
  }

  if (tab === "ctx") {
    return (
      <div className="space-y-2.5 text-xs">
        <p className="rounded-xl bg-slate-50 p-3 font-serif text-sm leading-relaxed text-slate-800">{sentence}</p>
        {translation && <p className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600">{translation}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => speakSpanish(sentence, language)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"><Volume2 className="h-3.5 w-3.5" /> Audio</button>
          {!translation && (
            <button type="button" onClick={onTranslate} disabled={translating} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Languages className="h-3.5 w-3.5" /> {translating ? "Translating…" : "Translate"}
            </button>
          )}
          <button type="button" onClick={onExportAnki} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 font-medium text-white hover:bg-slate-800 cursor-pointer"><Download className="h-3.5 w-3.5" /> Anki (.apkg)</button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      {!images && <div className="col-span-2 py-4 text-center text-slate-400">Loading Wikipedia visuals…</div>}
      {images && !images.es && !images.en && <div className="col-span-2 py-4 text-center text-slate-400">No Wikipedia images found.</div>}
      {[images?.es, images?.en].filter(Boolean).map((hit, i) => (
        <a key={i} href={hit!.page_url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-slate-200 hover:border-slate-400">
          <img src={hit!.url} alt={hit!.title} className="h-24 w-full object-cover" />
          <div className="truncate px-2 py-1 text-[10px] text-slate-600">{hit!.title}</div>
        </a>
      ))}
    </div>
  );
};
