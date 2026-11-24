const ZH_LEVEL_MAP: Record<string, string> = {
  A1: "HSK 1",
  A2: "HSK 2",
  B1: "HSK 3",
  B2: "HSK 4",
  C1: "HSK 5",
  C2: "HSK 6",
};

const JA_LEVEL_MAP: Record<string, string> = {
  A1: "N5",
  A2: "N4",
  B1: "N3",
  B2: "N2",
  C1: "N1",
  C2: "N1+",
};

const RU_LEVEL_MAP: Record<string, string> = {
  A1: "TEU",
  A2: "TBU",
  B1: "TRKI 1",
  B2: "TRKI 2",
  C1: "TRKI 3",
  C2: "TRKI 4",
};

/**
 * Returns the native proficiency scale name for a language (HSK for Chinese,
 * JLPT for Japanese, TRKI for Russian, CEFR for European languages).
 */
export function getProficiencySystemLabel(language?: string | null): string {
  const l = (language || "").toLowerCase();
  if (l.startsWith("zh")) return "HSK";
  if (l.startsWith("ja")) return "JLPT";
  if (l.startsWith("ru")) return "TRKI";
  return "CEFR";
}

const BUCKET_MAP: Record<string, string> = {
  "HSK 1": "A1", "HSK 2": "A2", "HSK 3": "B1", "HSK 4": "B2", "HSK 5": "C1", "HSK 6": "C2",
  N5: "A1", N4: "A2", N3: "B1", N2: "B2", N1: "C1", "N1+": "C2",
  TEU: "A1", TBU: "A2", "TRKI 1": "B1", "TRKI 2": "B2", "TRKI 3": "C1", "TRKI 4": "C2",
};

/** Maps any proficiency label (CEFR, HSK, JLPT, TRKI) to its 6-tier filter bucket key (A1-C2). */
export function normalizeLevelBucket(level?: string | null): string {
  const key = (level || "B1").trim().toUpperCase();
  return BUCKET_MAP[key] || key;
}

/**
 * Maps internal A1-C2 difficulty bands to the language's native proficiency label.
 */
export function formatProficiencyLevel(level?: string | null, language?: string | null): string {
  const raw = (level || "B1").trim();
  const upper = raw.toUpperCase();
  const l = (language || "").toLowerCase();
  if (l.startsWith("zh")) return ZH_LEVEL_MAP[upper] || raw;
  if (l.startsWith("ja")) return JA_LEVEL_MAP[upper] || raw;
  if (l.startsWith("ru")) return RU_LEVEL_MAP[upper] || raw;
  return upper;
}
