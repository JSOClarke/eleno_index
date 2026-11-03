import type { ElenoLexiconEntry, HighlightMode } from "@/types/reader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

export interface ColorBandItem {
  key: string;
  label: string;
  border: string;
  bg: string;
  text: string;
}

export const CEFR_BANDS: Record<string, ColorBandItem> = {
  A1: { key: "A1", label: "A1", border: "!border-[#22c55e]", bg: "bg-[#22c55e]/15", text: "text-[#15803d]" },
  A2: { key: "A2", label: "A2", border: "!border-[#06b6d4]", bg: "bg-[#06b6d4]/15", text: "text-[#0e7490]" },
  B1: { key: "B1", label: "B1", border: "!border-[#eab308]", bg: "bg-[#eab308]/15", text: "text-[#a16207]" },
  B2: { key: "B2", label: "B2", border: "!border-[#f97316]", bg: "bg-[#f97316]/15", text: "text-[#c2410c]" },
  C1: { key: "C1", label: "C1", border: "!border-[#ef4444]", bg: "bg-[#ef4444]/15", text: "text-[#b91c1c]" },
  C2: { key: "C2", label: "C2", border: "!border-[#a855f7]", bg: "bg-[#a855f7]/15", text: "text-[#7e22ce]" },
};

export const RANK_BANDS: (ColorBandItem & { max: number })[] = [
  { key: "1k", max: 1000, label: "Top 1k", border: "", bg: "bg-zinc-100", text: "text-zinc-600" },
  { key: "3k", max: 3000, label: "1k–3k", border: "!border-[#22c55e]", bg: "bg-[#22c55e]/15", text: "text-[#15803d]" },
  { key: "5k", max: 5000, label: "3k–5k", border: "!border-[#eab308]", bg: "bg-[#eab308]/15", text: "text-[#a16207]" },
  { key: "10k", max: 10000, label: "5k–10k", border: "!border-[#f97316]", bg: "bg-[#f97316]/15", text: "text-[#c2410c]" },
  { key: "rare", max: Infinity, label: "10k+", border: "!border-[#ef4444]", bg: "bg-[#ef4444]/15", text: "text-[#b91c1c]" },
];

export function getRankBand(rank?: number | null): ColorBandItem {
  if (rank == null || rank <= 0) return RANK_BANDS[4];
  return RANK_BANDS.find((b) => rank <= b.max) || RANK_BANDS[4];
}

export function getCefrBand(cefr?: string | null): ColorBandItem | null {
  if (!cefr) return null;
  return CEFR_BANDS[cefr.toUpperCase()] || null;
}

export function getTokenUnderlineClass(
  entry: ElenoLexiconEntry,
  status: UserVocabStatus | undefined,
  highlightMode: HighlightMode,
  highlightUnknownOnly: boolean
): string {
  if (highlightMode === "none") return "";
  const isKnown = status === "known";
  if (highlightUnknownOnly && isKnown) return "";

  if (highlightMode === "cefr") {
    const band = getCefrBand(entry.cefr);
    return band ? `border-solid ${band.border} ` : "border-solid !border-[#94a3b8] ";
  }

  if (highlightMode === "rank") {
    const band = getRankBand(entry.rank);
    return band.border ? `border-solid ${band.border} ` : "";
  }

  return "";
}
