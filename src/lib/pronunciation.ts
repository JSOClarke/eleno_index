export interface ExtractedPronunciation {
  ipa: string | null;
  reading: string | null;
}

/**
 * Extracts both raw IPA (for existing table columns) and a labeled universal
 * reading string (Pinyin, Hiragana, or IPA) from `lexical_pronunciation`.
 */
export function extractPronunciation(pronunciations: unknown): ExtractedPronunciation {
  if (!Array.isArray(pronunciations) || pronunciations.length === 0) {
    return { ipa: null, reading: null };
  }
  const first = pronunciations[0] as { transcriptions?: Array<Record<string, unknown>> } | undefined;
  const tx = Array.isArray(first?.transcriptions) ? first.transcriptions[0] : undefined;
  if (!tx || typeof tx !== "object") return { ipa: null, reading: null };

  const ipa = typeof tx.ipa === "string" && tx.ipa.trim() ? tx.ipa.trim() : null;
  const pinyin = typeof tx.pinyin === "string" && tx.pinyin.trim() ? tx.pinyin.trim() : null;
  const hiragana =
    typeof tx.hiragana === "string" && tx.hiragana.trim()
      ? tx.hiragana.trim()
      : typeof tx.kana === "string" && tx.kana.trim()
        ? tx.kana.trim()
        : typeof tx.furigana === "string" && tx.furigana.trim()
          ? tx.furigana.trim()
          : null;

  if (pinyin) return { ipa, reading: `Pinyin: ${pinyin}` };
  if (hiragana) return { ipa, reading: `Hiragana: ${hiragana}` };
  if (ipa) return { ipa, reading: `IPA: ${ipa}` };
  return { ipa: null, reading: null };
}
