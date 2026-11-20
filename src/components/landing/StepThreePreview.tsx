import React, { useState } from "react";
import { BookOpen, Check, Eye, GraduationCap, HelpCircle, Image as ImageIcon, Languages, Layers, Tag, Volume2, X } from "lucide-react";
import { ThresholdMark } from "@/components/brand/InputHubBrandLogo";
import { type DemoHighlightMode, getFrequencyBandLabel, HP_CH1_TOKENS, POS_META, speakSpanishDemo } from "./landingExtensionMocks";
import { getDemoTokenStyle, StepThreeHighlightBar } from "./StepThreeHighlightBar";
import { ContextTabBody, ImageTabBody, MeaningTabBody } from "./StepThreeTabBodies";

export const StepThreePreview: React.FC<{ onRequireAuth: () => void }> = ({ onRequireAuth }) => {
  const [tokenIdx, setTokenIdx] = useState(4); // "lechuza" by default
  const [candIdx, setCandIdx] = useState(0);
  const [tab, setTab] = useState<"meaning" | "context" | "image">("meaning");
  const [showAllSenses, setShowAllSenses] = useState(false);
  const [showPosDetail, setShowPosDetail] = useState(false);
  const [translated, setTranslated] = useState(false);
  const [highlightMode, setHighlightMode] = useState<DemoHighlightMode>("status");

  const token = HP_CH1_TOKENS[tokenIdx] || HP_CH1_TOKENS[4];
  const candidates = [token.canonical, ...token.alternatives].filter((c): c is NonNullable<typeof c> => Boolean(c));
  const can = candidates[candIdx] || candidates[0];
  const lemma = can?.lemma || token.lemma;
  const pos = can?.pos || token.pos;
  const rank = can?.tubelex_rank || can?.elelex_rank || null;
  const posMeta = POS_META[pos];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-[#0A0A0C] p-4 space-y-3">
      <StepThreeHighlightBar mode={highlightMode} onChange={setHighlightMode} />

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="font-sans text-[16.5px] leading-[1.65] text-[#0F172A]">
          {HP_CH1_TOKENS.map((t, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && " "}
              <button
                type="button"
                onClick={() => { setTokenIdx(idx); setCandIdx(0); setShowAllSenses(false); setShowPosDetail(false); }}
                style={getDemoTokenStyle(t, highlightMode, idx === tokenIdx)}
                className="rounded-[3px] py-[1px] transition-colors hover:brightness-95 cursor-pointer"
              >
                {t.surface}
              </button>
            </React.Fragment>
          ))}.
        </p>
      </div>

      <div className="w-full max-w-[376px] overflow-hidden rounded-[16px] bg-white text-[#0F172A] shadow-[0_20px_45px_rgba(15,23,42,0.16),0_4px_12px_rgba(15,23,42,0.08)]">
        <div className="h-[3px] w-full bg-[#0F172A]" />
        <div className="p-[16px_18px] space-y-3">
          {tab === "meaning" ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-end gap-2">
                    <span className="font-serif text-[30px] font-medium leading-[1.02] tracking-[-0.02em]">{lemma}</span>
                    {can?.ipa && <span className="pb-0.5 font-mono text-[11.5px] font-medium text-slate-500">{can.ipa}</span>}
                    <button
                      type="button" title="Play pronunciation · Right-click for 0.7x slow"
                      onClick={() => speakSpanishDemo(lemma, 1.0)}
                      onContextMenu={(e) => { e.preventDefault(); speakSpanishDemo(lemma, 0.72); }}
                      className="mb-0.5 inline-flex h-[26px] w-[26px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-[#0F172A] cursor-pointer"
                    ><Volume2 className="h-3.5 w-3.5" /></button>
                  </div>
                  {token.surface.toLowerCase() !== lemma.toLowerCase() && (
                    <div className="mt-1 text-[11px] text-slate-500">In text: “{token.surface}”</div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[#0F172A]">
                  <ThresholdMark className="h-3.5 w-3.5" />
                  <X className="h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 text-[10px] font-medium">
                {can?.cefr && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#0F172A] bg-[#0F172A] px-[7px] py-[2px] text-white">
                    <GraduationCap className="h-2.5 w-2.5" /><span>{can.cefr}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-[7px] py-[2px] text-[#0F172A]">
                  <Layers className="h-2.5 w-2.5" /><span>{getFrequencyBandLabel(rank)}</span>
                </span>
                {posMeta && (
                  <button
                    type="button" onClick={() => setShowPosDetail((v) => !v)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-[7px] py-[2px] text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <Tag className="h-2.5 w-2.5" /><span>{posMeta.label}</span><HelpCircle className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>

              {candidates.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {candidates.map((c, idx) => (
                    <button
                      key={c.id} type="button" aria-label={`Switch to ${c.lemma}`}
                      onClick={() => { setCandIdx(idx); setShowAllSenses(false); setShowPosDetail(false); }}
                      className={`h-[7px] rounded-full transition-all cursor-pointer ${idx === candIdx ? "w-[18px] bg-[#0F172A]" : "w-[7px] bg-slate-300 hover:bg-slate-400"}`}
                    />
                  ))}
                  <span className="ml-auto font-mono text-[10px] text-slate-500">
                    {candIdx === 0 ? `Parsed · 1/${candidates.length}` : `Alt · ${candIdx + 1}/${candidates.length}`}
                  </span>
                </div>
              )}

              {showPosDetail && posMeta && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs">
                  <div className="font-semibold text-[#0F172A]">{posMeta.label} · <span className="font-normal">{posMeta.esLabel}</span></div>
                  <div className="mt-0.5 text-slate-500">{posMeta.desc}</div>
                </div>
              )}

              <MeaningTabBody defs={can?.definitions || []} showAllSenses={showAllSenses} onToggleExpand={() => setShowAllSenses((v) => !v)} />

              <div className="flex gap-2">
                <button type="button" onClick={onRequireAuth} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 py-[7px] text-[11.5px] font-medium text-slate-600 cursor-pointer transition"><Eye className="h-3.5 w-3.5" /> Learn</button>
                <button type="button" onClick={onRequireAuth} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 py-[7px] text-[11.5px] font-semibold text-white cursor-pointer transition"><Check className="h-3.5 w-3.5" /> Known</button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-lg font-medium">{lemma}</span>
                  {can?.ipa && <span className="font-mono text-[11px] text-slate-500">{can.ipa}</span>}
                </div>
                <X className="h-4 w-4 text-slate-400" />
              </div>
              {tab === "context" ? (
                <ContextTabBody translated={translated} onTranslate={() => setTranslated(true)} onSpeakSentence={() => speakSpanishDemo(HP_CH1_TOKENS.map((x) => x.surface).join(" "), 1.0)} />
              ) : (
                <ImageTabBody lemma={lemma} primaryDef={can?.definitions?.[0] || ""} />
              )}
            </>
          )}
        </div>

        <div className="flex border-t border-slate-200 bg-slate-50 px-2.5 py-1.5 gap-1 text-[10px]">
          {([["meaning", "Meaning", BookOpen], ["context", "Context", Languages], ["image", "Image", ImageIcon]] as const).map(([id, label, Icon]) => (
            <button key={id} type="button" onClick={() => setTab(id)} className={`flex-1 flex flex-col items-center gap-0.5 rounded-lg py-1.5 cursor-pointer transition ${tab === id ? "bg-[#0F172A] font-semibold text-white" : "text-slate-500 hover:bg-slate-200/60"}`}>
              <Icon className="h-3.5 w-3.5" /><span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
