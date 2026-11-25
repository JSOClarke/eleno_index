import React from "react";
import { formatNumber, formatPercent } from "@/lib/formatters";
import { formatProficiencyLevel, getProficiencySystemLabel } from "@/lib/proficiencyScale";
import type { MediaMetrics } from "@/types/media.types";
import { MiniBarsChart, MiniDonutChart } from "./MetricMiniCharts";

export interface MetricCardSpec {
  label: string;
  value: string;
  sub: string;
  tooltip: string;
  chart?: React.ReactNode;
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
  if (score >= 30) return "Challenging · Dense";
  return "Complex · Academic";
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
      chart: cov90 && cov95 && cov98 && uniqueLemmas ? (
        <MiniBarsChart bars={[
          { label: "90%", value: cov90, max: uniqueLemmas, color: "#10B981" },
          { label: "95%", value: cov95, max: uniqueLemmas, color: "#0EA5E9" },
          { label: "98%", value: cov98, max: uniqueLemmas, color: "#6366F1" },
        ]} />
      ) : undefined,
    },
    {
      label: "Core Vocab (Top 1k)",
      value: pct?.top_1k_pct != null ? formatPercent(pct.top_1k_pct, 1) : "—",
      sub: pct?.k1_to_5k_pct != null ? `1k–5k: ${formatPercent(pct.k1_to_5k_pct, 1)}` : "of running tokens",
      tooltip: "Share of running words from the top 1,000 most common words in the language (donut shows Top 1k, 1k–5k, 5k–10k, and Rare).",
      chart: pct?.top_1k_pct != null ? (
        <MiniDonutChart segments={[
          { value: pct.top_1k_pct ?? 0, color: "#10B981" },
          { value: pct.k1_to_5k_pct ?? 0, color: "#0EA5E9" },
          { value: pct.k5_to_10k_pct ?? 0, color: "#6366F1" },
          { value: (pct.rare_pct ?? 0) + (pct.unranked_pct ?? 0), color: "#CBD5E1" },
        ]} />
      ) : undefined,
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
      chart: !wpm && metrics.dialogue_ratio != null ? (
        <MiniDonutChart segments={[
          { value: metrics.dialogue_ratio, color: "#0EA5E9" },
          { value: Math.max(0, 100 - metrics.dialogue_ratio), color: "#E2E8F0" },
        ]} />
      ) : undefined,
    },
    {
      label: "Lexical Variety",
      value: metrics.hapax_percentage != null ? `${formatPercent(metrics.hapax_percentage, 1)} hapax` : (lexDensity || "—"),
      sub: lexDensity ? `Lexical density ${lexDensity}` : "one-time lemmas",
      tooltip: "Hapax % is the share of lemmas appearing only once (higher = richer/rarer vocabulary); lexical density is the ratio of content words.",
      chart: metrics.hapax_percentage != null ? (
        <MiniDonutChart segments={[
          { value: metrics.hapax_percentage, color: "#6366F1" },
          { value: Math.max(0, 100 - metrics.hapax_percentage), color: "#E2E8F0" },
        ]} />
      ) : undefined,
    },
    useGrammarVerbCard
      ? {
          label: "Subjunctive Load",
          value: formatPercent(subj, 1),
          sub: metrics.verb_profile?.imperfect_share != null
            ? `Imp ${metrics.verb_profile.imperfect_share.toFixed(0)}% · Pret ${(metrics.verb_profile.preterite_share ?? 0).toFixed(0)}%`
            : "of finite verb forms",
          tooltip: "Percentage of finite verbs in the subjunctive mood, plus imperfect vs. preterite tense split.",
          chart: subj != null ? (
            <MiniDonutChart segments={[
              { value: subj, color: "#0EA5E9" },
              { value: Math.max(0, 100 - subj), color: "#CBD5E1" },
            ]} />
          ) : undefined,
        }
      : {
          label: "POS Balance",
          value: hasPos ? `N ${(pos.NOUN ?? 0).toFixed(0)}% · V ${(pos.VERB ?? 0).toFixed(0)}%` : "—",
          sub: hasPos ? `Adj ${(pos.ADJ ?? 0).toFixed(0)}% · Adv ${(pos.ADV ?? 0).toFixed(0)}%` : "—",
          tooltip: "Part-of-speech breakdown across Nouns, Verbs, Adjectives, and Adverbs.",
          chart: hasPos ? (
            <MiniDonutChart segments={[
              { value: pos.NOUN ?? 0, color: "#10B981" },
              { value: pos.VERB ?? 0, color: "#0EA5E9" },
              { value: pos.ADJ ?? 0, color: "#6366F1" },
              { value: pos.ADV ?? 0, color: "#94A3B8" },
            ]} />
          ) : undefined,
        },
  ];
}
