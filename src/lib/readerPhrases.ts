import type {
  ElenoPhraseHint,
  ElenoReaderChapter,
  ElenoReaderManifest,
} from "@/types/reader.types";

export function resolvePhraseHints(
  chapter: ElenoReaderChapter | null,
  manifest: ElenoReaderManifest | null,
  blockIndex: number,
  sentenceIndex: number,
  tokenIndex: number
): ElenoPhraseHint[] {
  const matches =
    chapter?.blocks[blockIndex]?.phrase_matches?.[sentenceIndex] || [];
  if (!matches.length || !manifest?.phrases?.length) return [];

  const catalog = new Map(manifest.phrases.map((phrase) => [phrase.id, phrase]));
  const hints: ElenoPhraseHint[] = [];
  for (const match of matches) {
    if (match.s <= tokenIndex && tokenIndex < match.e) {
      const phrase = catalog.get(match.p);
      if (phrase) hints.push(phrase);
    }
  }
  return hints;
}
