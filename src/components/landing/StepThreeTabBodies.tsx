import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Languages, Volume2 } from "lucide-react";
import { fetchWordImagesPair, type WikiImagePair } from "@/lib/wikiImages";
import { HP_CH1_SENTENCE, HP_CH1_TRANSLATION } from "./landingExtensionMocks";

interface MeaningBodyProps {
  defs: string[];
  showAllSenses: boolean;
  onToggleExpand: () => void;
}

export const MeaningTabBody: React.FC<MeaningBodyProps> = ({ defs, showAllSenses, onToggleExpand }) => {
  const primary = defs.slice(0, 2);
  const extra = defs.slice(2);
  const visible = showAllSenses ? defs : primary;
  return (
    <>
      <div className="border-t border-slate-200 pt-2.5">
        <ul className="space-y-1.5 text-[13px] leading-[1.38]">
          {visible.map((d, idx) => (
            <li key={idx} className={`flex items-start gap-2 ${idx >= 2 ? "text-slate-500" : "text-[#0F172A]"}`}>
              <span className="mt-[1px] shrink-0 text-xs text-slate-400">—</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>
      {extra.length > 0 ? (
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-slate-200" />
          <button
            type="button" onClick={onToggleExpand}
            className="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-medium text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-[#0F172A] cursor-pointer"
          >
            {showAllSenses ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            <span>+{extra.length}</span>
          </button>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
      ) : (
        <div className="h-px bg-slate-200" />
      )}
    </>
  );
};

export const ContextTabBody: React.FC<{
  translated: boolean;
  onTranslate: () => void;
  onSpeakSentence: () => void;
}> = ({ translated, onTranslate, onSpeakSentence }) => (
  <div className="space-y-2.5">
    <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-[#0F172A]">
      {HP_CH1_SENTENCE}
    </p>
    {translated && (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-700">
        {HP_CH1_TRANSLATION}
      </div>
    )}
    <div className="flex items-center gap-1.5 pt-0.5">
      <button
        type="button" onClick={onSpeakSentence}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
      >
        <Volume2 className="h-3 w-3" /><span>Audio</span>
      </button>
      {!translated && (
        <button
          type="button" onClick={onTranslate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800 cursor-pointer"
        >
          <Languages className="h-3 w-3" /><span>Translate</span>
        </button>
      )}
    </div>
  </div>
);

export const ImageTabBody: React.FC<{ lemma: string; primaryDef: string }> = ({ lemma, primaryDef }) => {
  const [data, setData] = useState<WikiImagePair | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchWordImagesPair(lemma, primaryDef, "es").then((res) => {
      if (active) { setData(res); setLoading(false); }
    });
    return () => { active = false; };
  }, [lemma, primaryDef]);

  if (loading) return <div className="py-6 text-center text-xs text-slate-400">Searching images…</div>;
  if (!data) return <div className="py-6 text-center text-xs text-slate-400">No images found.</div>;

  const cards = [
    { label: `ES · ${lemma}`, item: data.es },
    { label: `EN · ${data.en?.query || data.en_query || "—"}`, item: data.en },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.map(({ label, item }) => (
        <div key={label} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between gap-1 border-b border-slate-200 px-2 py-1">
            <span className="truncate text-[10px] font-semibold text-slate-600">{label}</span>
            {item?.page_url && item?.url && (
              <a href={item.page_url} target="_blank" rel="noreferrer" title={`${item.title} (${item.source})`} className="text-slate-400 hover:text-slate-900">
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
          {item?.url ? (
            <img src={item.url} alt={item.title || label} referrerPolicy="no-referrer" className="h-24 w-full object-cover" />
          ) : (
            <div className="flex h-24 items-center justify-center text-[11px] text-slate-400">No match found</div>
          )}
        </div>
      ))}
    </div>
  );
};
