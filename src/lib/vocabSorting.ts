import type {
  KnownWordEntry,
  LexicalRanking,
  UserVocabStatus,
  VocabularyWord,
} from "@/types/vocabulary.types";

export type PrimerSortField = "lemma" | "pos" | "cefr" | "frequency" | "rank" | "debut";
export type KnownSortField = "lemma" | "pos" | "cefr" | "rank" | "added";
export type SortDirection = "asc" | "desc";
export type VocabStatusFilter = "ALL" | "UNKNOWN" | "LEARNING" | "KNOWN";
export type RankingSourceKey = "tubelex_v2025" | "elelex_v2020" | "flelex_v2020" | "lexique383" | "subtlex_ch";

const CEFR_ORDER: Record<string, number> = {
  A1: 1, "HSK 1": 1, N5: 1,
  A2: 2, "HSK 2": 2, N4: 2,
  B1: 3, "HSK 3": 3, N3: 3,
  B2: 4, "HSK 4": 4, N2: 4,
  C1: 5, "HSK 5": 5, N1: 5,
  C2: 6, "HSK 6": 6, "N1+": 6,
};

export function getDefaultRankSource(language?: string | null): RankingSourceKey {
  return (language || "").toLowerCase().startsWith("fr") ? "lexique383" : "tubelex_v2025";
}

export function getRankOptionsForLanguage(language?: string | null): ReadonlyArray<{ value: RankingSourceKey; label: string }> {
  const l = (language || "es").toLowerCase();
  if (l.startsWith("zh")) {
    return [{ value: "tubelex_v2025", label: "TubeLex" }, { value: "subtlex_ch", label: "SUBTLEX-CH" }];
  }
  if (l.startsWith("fr")) {
    return [{ value: "lexique383", label: "Lexique" }, { value: "flelex_v2020", label: "FLELex" }];
  }
  return [{ value: "tubelex_v2025", label: "TubeLex" }, { value: "elelex_v2020", label: "ELELex" }];
}

export function getRankSourceLabel(source: RankingSourceKey): string {
  if (source === "subtlex_ch") return "SUBTLEX-CH";
  if (source === "lexique383") return "Lexique";
  if (source === "flelex_v2020") return "FLELex";
  if (source === "elelex_v2020") return "ELELex";
  return "TubeLex";
}

export function getRankingEntry(rankings: LexicalRanking[] | undefined, source: RankingSourceKey): LexicalRanking | undefined {
  return rankings?.find((r) =>
    source === "flelex_v2020" ? r.source === "flelex_v2020" || r.source === "flelex_v1" : r.source === source
  );
}

export function getWordRankForSource(
  rankings: LexicalRanking[] | undefined,
  source: RankingSourceKey
): number | null {
  const val = getRankingEntry(rankings, source)?.rank ?? null;
  return val && val > 0 ? val : null;
}

export function matchesStatusFilter(
  status: UserVocabStatus | undefined,
  filter: VocabStatusFilter
): boolean {
  if (filter === "ALL") return true;
  if (filter === "KNOWN") return status === "known";
  if (filter === "LEARNING") return status === "learning";
  return !status || (status !== "known" && status !== "learning");
}

export function sortPrimerWords(
  words: VocabularyWord[],
  field: PrimerSortField,
  dir: SortDirection,
  rankingSource: RankingSourceKey
): VocabularyWord[] {
  const mult = dir === "asc" ? 1 : -1;
  return [...words].sort((a, b) => {
    if (field === "lemma") {
      return mult * a.lemma.localeCompare(b.lemma, "es");
    }
    if (field === "pos") {
      const cmp = a.pos.localeCompare(b.pos);
      return cmp !== 0 ? mult * cmp : b.frequency - a.frequency;
    }
    if (field === "cefr") {
      const ca = CEFR_ORDER[a.cefr] ?? 99;
      const cb = CEFR_ORDER[b.cefr] ?? 99;
      return ca !== cb ? mult * (ca - cb) : b.frequency - a.frequency;
    }
    if (field === "frequency") {
      return a.frequency !== b.frequency
        ? mult * (a.frequency - b.frequency)
        : a.lemma.localeCompare(b.lemma, "es");
    }
    if (field === "rank") {
      const ra = getWordRankForSource(a.rankings, rankingSource);
      const rb = getWordRankForSource(b.rankings, rankingSource);
      if (ra === null && rb === null) return b.frequency - a.frequency;
      if (ra === null) return 1;
      if (rb === null) return -1;
      return mult * (ra - rb);
    }
    if (field === "debut") {
      const da = a.first_occurrence_index || 1;
      const db = b.first_occurrence_index || 1;
      return da !== db ? mult * (da - db) : b.frequency - a.frequency;
    }
    return 0;
  });
}

export function sortKnownWords(
  words: KnownWordEntry[],
  field: KnownSortField,
  dir: SortDirection,
  rankingSource: RankingSourceKey
): KnownWordEntry[] {
  const mult = dir === "asc" ? 1 : -1;
  return [...words].sort((a, b) => {
    if (field === "lemma") return mult * a.lemma.localeCompare(b.lemma, "es");
    if (field === "pos") return mult * a.pos.localeCompare(b.pos);
    if (field === "cefr") {
      const ca = CEFR_ORDER[a.cefr] ?? 99;
      const cb = CEFR_ORDER[b.cefr] ?? 99;
      return ca !== cb ? mult * (ca - cb) : a.lemma.localeCompare(b.lemma, "es");
    }
    if (field === "rank") {
      const ra = getWordRankForSource(a.rankings, rankingSource);
      const rb = getWordRankForSource(b.rankings, rankingSource);
      if (ra === null && rb === null) return a.lemma.localeCompare(b.lemma, "es");
      if (ra === null) return 1;
      if (rb === null) return -1;
      return mult * (ra - rb);
    }
    if (field === "added") {
      const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const tb = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return mult * (ta - tb);
    }
    return 0;
  });
}
