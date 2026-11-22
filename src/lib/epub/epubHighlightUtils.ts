import type { EpubHighlightMode, ParsedBlockResult, ParsedToken } from "@/types/epubReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

export interface FrequencyBandInfo {
  band: "top1k" | "top3k" | "top5k" | "top10k" | "rare";
  label: string;
}

export function getFrequencyBand(rank?: number | null): FrequencyBandInfo {
  if (!rank || rank <= 0) return { band: "rare", label: "10k+" };
  if (rank <= 1000) return { band: "top1k", label: "Top 1k" };
  if (rank <= 3000) return { band: "top3k", label: "Top 3k" };
  if (rank <= 5000) return { band: "top5k", label: "Top 5k" };
  if (rank <= 10000) return { band: "top10k", label: "Top 10k" };
  return { band: "rare", label: "10k+" };
}

export function computeIPlusOneMap(
  parsed: ParsedBlockResult,
  statusMap: Record<string, UserVocabStatus>
): Map<number, { isTarget: boolean; targetSurface: string }> {
  const result = new Map<number, { isTarget: boolean; targetSurface: string }>();
  const tokens = parsed.tokens || [];
  if (!tokens.length) return result;

  const groups: number[][] = [];
  let curr: number[] = [];
  for (let i = 0; i < tokens.length; i++) {
    curr.push(i);
    if (/[.!?…]/.test(tokens[i].surface || "") || i === tokens.length - 1) {
      groups.push(curr);
      curr = [];
    }
  }

  for (const indices of groups) {
    const unknownByKey = new Map<string, number[]>();
    let wordCount = 0;
    for (const idx of indices) {
      const tok = tokens[idx];
      const can = tok.canonical;
      const cid = can?.canonical_id || can?.id;
      if (!cid || tok.is_word === false) continue;
      if (tok.pos === "PROPN" || can?.pos === "PROPN") continue;
      wordCount++;
      const status = statusMap[cid] || tok.user_status || null;
      if (status !== "known") {
        if (!unknownByKey.has(cid)) unknownByKey.set(cid, []);
        unknownByKey.get(cid)!.push(idx);
      }
    }
    if (wordCount >= 3 && unknownByKey.size === 1) {
      const [, targetIndices] = [...unknownByKey.entries()][0];
      const targetSurface = tokens[targetIndices[0]].surface;
      const targetSet = new Set(targetIndices);
      for (const idx of indices) {
        result.set(idx, { isTarget: targetSet.has(idx), targetSurface });
      }
    }
  }
  return result;
}

const CEFR_BG: Record<string, string> = {
  A1: "bg-[rgba(16,185,129,0.16)]",
  A2: "bg-[rgba(6,182,212,0.16)]",
  B1: "bg-[rgba(234,179,8,0.18)]",
  B2: "bg-[rgba(249,115,22,0.18)]",
  C1: "bg-[rgba(244,63,94,0.18)]",
  C2: "bg-[rgba(139,92,246,0.18)]",
};

const RANK_BG: Record<FrequencyBandInfo["band"], string> = {
  top1k: "bg-[rgba(16,185,129,0.16)]",
  top3k: "bg-[rgba(16,185,129,0.16)]",
  top5k: "bg-[rgba(234,179,8,0.18)]",
  top10k: "bg-[rgba(249,115,22,0.18)]",
  rare: "bg-[rgba(244,63,94,0.18)]",
};

export function getTokenHighlightClass(
  tok: ParsedToken,
  status: UserVocabStatus | null,
  mode: EpubHighlightMode,
  isSelected: boolean,
  inPhrase: boolean,
  i1: { isTarget: boolean; targetSurface: string } | null
): string {
  if (isSelected) return "bg-[rgba(15,23,42,0.16)] rounded-[2px]";
  const classes: string[] = [];
  if (inPhrase) classes.push("underline decoration-dotted decoration-[rgba(14,116,144,0.85)]");
  if (mode === "off") return classes.join(" ");

  if (i1?.isTarget) classes.push("bg-[rgba(6,182,212,0.28)] rounded-[2px]");
  else if (i1) classes.push("bg-[rgba(14,116,144,0.075)]");

  if (mode === "status" && !i1?.isTarget && !tok.is_stop) {
    if (status === "learning") classes.push("bg-[rgba(245,158,11,0.24)] rounded-[2px]");
    else if (status !== "known" && tok.canonical) classes.push("bg-[rgba(14,165,233,0.16)] rounded-[2px]");
  } else if (mode === "cefr" && tok.canonical?.cefr) {
    classes.push(CEFR_BG[tok.canonical.cefr.toUpperCase()] || "");
  } else if (mode === "rank" && tok.canonical) {
    classes.push(RANK_BG[getFrequencyBand(tok.canonical.rank).band]);
  }
  return classes.filter(Boolean).join(" ");
}
