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

/**
 * Returns the native proficiency scale name for a language (HSK for Chinese,
 * JLPT for Japanese, CEFR for European languages).
 */
export function getProficiencySystemLabel(language?: string | null): string {
  const l = (language || "").toLowerCase();
  if (l.startsWith("zh")) return "HSK";
  if (l.startsWith("ja")) return "JLPT";
  return "CEFR";
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
  return upper;
}
