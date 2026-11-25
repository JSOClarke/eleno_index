import React from "react";
import { formatNumber, formatPercent } from "@/lib/formatters";
import { formatProficiencyLevel, getProficiencySystemLabel } from "@/lib/proficiencyScale";
import type { MediaMetrics } from "@/types/media.types";
import type { ChartSegment } from "./MetricMiniCharts";

export interface MetricCardSpec {
  label: string;
  value: string;
  sub: string;
  tooltip: string;
  segments?: ChartSegment[];
}

function getFormulaShort(formula?: string | null, language?: string): string {
  const f = (formula || "").toLowerCase();
  const l = (language || "").toLowerCase();
  if (f.includes("kandel") || l.startsWith("fr")) return "K-M";
  if (f.includes("oborneva") || l.startsWith("ru")) return "Oborneva";
  if (f.includes("chinese") || l.startsWith("zh")) return "ZH";
  return "F-H";
}

function getEnglishReadabilityLabel(score: number): string {
  if (score >= 90) return "Very Easy · Elementary";
  if (score >= 80) return "Easy · Popular fiction";
  if (score >= 70) return "Fairly Easy · Accessible";
  if (score >= 60) return "Standard · General";
  if (score >= 50) return "Moderate · Literary";
  return score >= 30 ? "Challenging · Dense" : "Complex · Academic";
}

export function buildMetricCards(metrics: MediaMetrics, language?: string): MetricCardSpec[] {
  const lang = (language || "").toLowerCase();
  const cefr = metrics.cefr_level || "";
  const scoreNum = metrics.readability_score ?? null;
  const formulaShort = getFormulaShort(metrics.readability_details?.formula, language);

  const uniqueLemmas = metrics.unique_lemmas || metrics.unique_words_count;
  const cov90 = metrics.coverage_90_lemmas ?? null;
  const cov95 = metrics.coverage_95_lemmas ?? null;
  const cov98 = metrics.coverage_98_lemmas ?? null;

  const pct = metrics.frequency_tiers?.percentages;
  const wpm = metrics.words_per_minute ? Math.round(metrics.words_per_minute) : null;
  const wordforms = metrics.unique_wordforms;
  const formRatio = wordforms && uniqueLemmas ? (wordforms / uniqueLemmas).toFixed(1) : null;
  const lexDensity = metrics.lexical_density != null ? `${(metrics.lexical_density * 100).toFixed(0)}%` : null;

  const pos = metrics.pos_distribution || {};
  const hasPos = Object.keys(pos).length > 0;
  const subj = metrics.verb_profile?.subjunctive_load;
  const useGrammarVerbCard = (lang.startsWith("es") || lang.startsWith("fr")) && subj != null;

  return [
    {
      label: `${getProficiencySystemLabel(language)} & Readability`,
      value: [formatProficiencyLevel(cefr, language), scoreNum != null ? `${formulaShort} ${scoreNum.toFixed(1)}` : ""].filter(Boolean).join(" · ") || "—",
      sub: scoreNum != null ? getEnglishReadabilityLabel(scoreNum) : "—",
      tooltip: "Overall proficiency estimate and language-specific readability score (higher = simpler sentences & shorter words).",
    },
    {
      label: "95% Target",
      value: cov95 != null ? `${formatNumber(cov95)} lemmas` : "—",
      sub: cov90 != null || cov98 != null ? `90%: ${cov90 != null ? formatNumber(cov90) : "—"} · 98%: ${cov98 != null ? formatNumber(cov98) : "—"}` : "—",
      tooltip: "How many unique dictionary headwords (lemmas) you need to know to understand 90%, 95%, and 98% of all running words.",
      segments: cov90 && cov95 && cov98 && uniqueLemmas ? [
        { label: "90%", value: cov90, color: "#10B981" },
        { label: "95%", value: Math.max(0, cov95 - cov90), color: "#0EA5E9" },
        { label: "98%", value: Math.max(0, cov98 - cov95), color: "#6366F1" },
        { label: "Rest", value: Math.max(0, uniqueLemmas - cov98), color: "#CBD5E1" },
      ] : undefined,
    },
    {
      label: "Core Vocab (Top 1k)",
      value: pct?.top_1k_pct != null ? formatPercent(pct.top_1k_pct, 1) : "—",
      sub: pct?.k1_to_5k_pct != null ? `1k–5k: ${formatPercent(pct.k1_to_5k_pct, 1)}` : "of running tokens",
      tooltip: "Share of running words from the top 1,000 most common words in the language.",
      segments: pct?.top_1k_pct != null ? [
        { label: "1k", value: pct.top_1k_pct ?? 0, color: "#10B981" },
        { label: "1–5k", value: pct.k1_to_5k_pct ?? 0, color: "#0EA5E9" },
        { label: "5–10k", value: pct.k5_to_10k_pct ?? 0, color: "#6366F1" },
        { label: "Rare", value: (pct.rare_pct ?? 0) + (pct.unranked_pct ?? 0), color: "#CBD5E1" },
      ] : undefined,
    },
    {
      label: "Unique Vocabulary",
      value: `${formatNumber(uniqueLemmas)} lemmas`,
      sub: wordforms ? `${formatNumber(wordforms)} forms (${formRatio}×)` : `${formatNumber(metrics.total_tokens)} tokens`,
      tooltip: "Total distinct base words (lemmas) vs. inflected surface forms (e.g. conjugated verbs or plurals) across the whole work.",
    },
    {
      label: "Sentence Length",
      value: metrics.mean_sentence_length != null ? `${metrics.mean_sentence_length.toFixed(1)} words` : "—",
      sub: metrics.median_sentence_length != null
        ? `Median ${metrics.median_sentence_length}${metrics.total_sentences ? ` · ${formatNumber(metrics.total_sentences)} sents` : ""}`
        : metrics.total_sentences ? `${formatNumber(metrics.total_sentences)} sentences` : "average span",
      tooltip: "Mean and median words per sentence. Shorter sentences are generally easier to parse when reading or listening.",
    },
    {
      label: wpm ? "Speaking Rate" : "Dialogue Share",
      value: wpm ? `${wpm} WPM` : (metrics.dialogue_ratio != null ? formatPercent(metrics.dialogue_ratio, 1) : "—"),
      sub: wpm ? (metrics.speech_density ? `${metrics.speech_density.toFixed(1)}% speech density` : "active speech cadence") : "conversational lines",
      tooltip: wpm
        ? "Average spoken words per minute and percentage of runtime containing speech."
        : "Percentage of lines that are dialogue rather than narration (higher dialogue usually means more everyday phrasing).",
      segments: !wpm && metrics.dialogue_ratio != null ? [
        { label: "Dial", value: metrics.dialogue_ratio, color: "#0EA5E9" },
        { label: "Narr", value: Math.max(0, 100 - metrics.dialogue_ratio), color: "#E2E8F0" },
      ] : undefined,
    },
    {
      label: "Lexical Variety",
      value: metrics.hapax_percentage != null ? `${formatPercent(metrics.hapax_percentage, 1)} hapax` : (lexDensity || "—"),
      sub: lexDensity ? `Lexical density ${lexDensity}` : "one-time lemmas",
      tooltip: "Hapax % is the share of lemmas appearing only once (higher = richer/rarer vocabulary); lexical density is the ratio of content words.",
      segments: metrics.hapax_percentage != null ? [
        { label: "Hapax", value: metrics.hapax_percentage, color: "#6366F1" },
        { label: "Repeat", value: Math.max(0, 100 - metrics.hapax_percentage), color: "#E2E8F0" },
      ] : undefined,
    },
    useGrammarVerbCard
      ? {
          label: "Subjunctive Load",
          value: formatPercent(subj, 1),
          sub: metrics.verb_profile?.imperfect_share != null
            ? `Imp ${metrics.verb_profile.imperfect_share.toFixed(0)}% · Pret ${(metrics.verb_profile.preterite_share ?? 0).toFixed(0)}%`
            : "of finite verb forms",
          tooltip: "Percentage of finite verbs in the subjunctive mood, plus imperfect vs. preterite tense split.",
          segments: subj != null ? [
            { label: "Subj", value: subj, color: "#0EA5E9" },
            { label: "Other", value: Math.max(0, 100 - subj), color: "#CBD5E1" },
          ] : undefined,
        }
      : {
          label: "POS Balance",
          value: hasPos ? `N ${(pos.NOUN ?? 0).toFixed(0)}% · V ${(pos.VERB ?? 0).toFixed(0)}%` : "—",
          sub: hasPos ? `Adj ${(pos.ADJ ?? 0).toFixed(0)}% · Adv ${(pos.ADV ?? 0).toFixed(0)}%` : "—",
          tooltip: "Part-of-speech breakdown across Nouns, Verbs, Adjectives, and Adverbs.",
          segments: hasPos ? [
            { label: "N", value: pos.NOUN ?? 0, color: "#10B981" },
            { label: "V", value: pos.VERB ?? 0, color: "#0EA5E9" },
            { label: "Adj", value: pos.ADJ ?? 0, color: "#6366F1" },
            { label: "Adv", value: pos.ADV ?? 0, color: "#94A3B8" },
          ] : undefined,
        },
  ];
}
