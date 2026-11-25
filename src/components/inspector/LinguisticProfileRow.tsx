import React from "react";
import { formatNumber, formatPercent } from "@/lib/formatters";
import { formatProficiencyLevel, getProficiencySystemLabel } from "@/lib/proficiencyScale";
import type { MediaMetrics } from "@/types/media.types";

interface LinguisticProfileRowProps {
  metrics: MediaMetrics | null;
  language?: string;
}

function getFormulaMeta(formula?: string | null, language?: string) {
  const f = (formula || "").toLowerCase();
  const l = (language || "").toLowerCase();
  if (f.includes("kandel") || l.startsWith("fr")) return { short: "K-M", sub: "Kandel-Moles scale" };
  if (f.includes("oborneva") || l.startsWith("ru")) return { short: "Oborneva", sub: "Oborneva RU scale" };
  if (f.includes("chinese") || l.startsWith("zh")) return { short: "ZH", sub: "Chinese readability" };
  return { short: "F-H", sub: "Fernández-Huerta scale" };
}

export const LinguisticProfileRow: React.FC<LinguisticProfileRowProps> = ({ metrics, language }) => {
  if (!metrics) return null;

  const lang = (language || "").toLowerCase();
  const cefr = metrics.cefr_level || "B1";
  const score = (metrics.readability_score ?? 70).toFixed(1);
  const fMeta = getFormulaMeta(metrics.readability_details?.formula, language);

  const uniqueLemmas = metrics.unique_lemmas || metrics.unique_words_count;
  const cov90 = metrics.coverage_90_lemmas ?? Math.round(uniqueLemmas * 0.25);
  const cov95 = metrics.coverage_95_lemmas ?? Math.round(uniqueLemmas * 0.42);
  const cov98 = metrics.coverage_98_lemmas ?? Math.round(uniqueLemmas * 0.68);

  const pct = metrics.frequency_tiers?.percentages;
  const wpm = metrics.words_per_minute ? Math.round(metrics.words_per_minute) : null;
  const wordforms = metrics.unique_wordforms;
  const formRatio = wordforms && uniqueLemmas ? (wordforms / uniqueLemmas).toFixed(1) : null;
  const lexDensity = metrics.lexical_density != null ? `${(metrics.lexical_density * 100).toFixed(0)}%` : null;

  const pos = metrics.pos_distribution || {};
  const subj = metrics.verb_profile?.subjunctive_load;
  const useGrammarVerbCard = (lang.startsWith("es") || lang.startsWith("fr")) && subj != null;

  const cards = [
    {
      label: `${getProficiencySystemLabel(language)} & Readability`,
      value: `${formatProficiencyLevel(cefr, language)} · ${fMeta.short} ${score}`,
      sub: metrics.readability_details?.label || fMeta.sub,
    },
    {
      label: "95% Target",
      value: `${formatNumber(cov95)} lemmas`,
      sub: `90%: ${formatNumber(cov90)} · 98%: ${formatNumber(cov98)}`,
    },
    {
      label: "Core Vocab (Top 1k)",
      value: pct?.top_1k_pct != null ? formatPercent(pct.top_1k_pct, 1) : "—",
      sub: pct?.k1_to_5k_pct != null ? `1k–5k: ${formatPercent(pct.k1_to_5k_pct, 1)}` : "of running tokens",
    },
    {
      label: "Unique Vocabulary",
      value: `${formatNumber(uniqueLemmas)} lemmas`,
      sub: wordforms ? `${formatNumber(wordforms)} forms (${formRatio}×)` : `${formatNumber(metrics.total_tokens)} tokens`,
    },
    {
      label: "Sentence Length",
      value: metrics.mean_sentence_length != null ? `${metrics.mean_sentence_length.toFixed(1)} words` : "—",
      sub: metrics.median_sentence_length != null
        ? `Median ${metrics.median_sentence_length}${metrics.total_sentences ? ` · ${formatNumber(metrics.total_sentences)} sents` : ""}`
        : metrics.total_sentences ? `${formatNumber(metrics.total_sentences)} sentences` : "average span",
    },
    {
      label: wpm ? "Speaking Rate" : "Dialogue Share",
      value: wpm ? `${wpm} WPM` : formatPercent(metrics.dialogue_ratio, 1),
      sub: wpm
        ? (metrics.speech_density ? `${metrics.speech_density.toFixed(1)}% speech density` : "active speech cadence")
        : "conversational lines",
    },
    {
      label: "Lexical Variety",
      value: metrics.hapax_percentage != null ? `${formatPercent(metrics.hapax_percentage, 1)} hapax` : (lexDensity || "—"),
      sub: lexDensity ? `Lexical density ${lexDensity}` : "one-time lemmas",
    },
    useGrammarVerbCard
      ? {
          label: "Subjunctive Load",
          value: formatPercent(subj, 1),
          sub: metrics.verb_profile?.imperfect_share != null
            ? `Imp ${metrics.verb_profile.imperfect_share.toFixed(0)}% · Pret ${(metrics.verb_profile.preterite_share ?? 0).toFixed(0)}%`
            : "of finite verb forms",
        }
      : {
          label: "POS Balance",
          value: `N ${(pos.NOUN ?? 0).toFixed(0)}% · V ${(pos.VERB ?? 0).toFixed(0)}%`,
          sub: `Adj ${(pos.ADJ ?? 0).toFixed(0)}% · Adv ${(pos.ADV ?? 0).toFixed(0)}%`,
        },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-xs">
          <div className="truncate text-[11px] font-medium text-slate-500">{c.label}</div>
          <div className="mt-1 truncate text-base font-bold text-slate-900 tabular-nums">{c.value}</div>
          <div className="mt-0.5 truncate text-[11px] text-slate-500">{c.sub}</div>
        </div>
      ))}
    </div>
  );
};
