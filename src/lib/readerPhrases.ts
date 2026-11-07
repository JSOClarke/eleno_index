import type {
  ElenoPhraseHint,
  ElenoReaderChapter,
  ElenoReaderManifest,
} from "@/types/reader.types";

const phraseCatalogCache = new WeakMap<ElenoPhraseHint[], Map<string, ElenoPhraseHint>>();

function getPhraseCatalog(phrases: ElenoPhraseHint[]): Map<string, ElenoPhraseHint> {
  let catalog = phraseCatalogCache.get(phrases);
  if (!catalog) {
    catalog = new Map(phrases.map((phrase) => [phrase.id, phrase]));
    phraseCatalogCache.set(phrases, catalog);
  }
  return catalog;
}

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

  const catalog = getPhraseCatalog(manifest.phrases);
  const hints: ElenoPhraseHint[] = [];
  for (const match of matches) {
    if (match.s <= tokenIndex && tokenIndex < match.e) {
      const phrase = catalog.get(match.p);
      if (phrase) hints.push(phrase);
    }
  }
  return hints;
}

export function resolveSentenceText(
  chapter: ElenoReaderChapter | null,
  blockIndex: number,
  sentenceIndex: number
): string | undefined {
  const sentence = chapter?.blocks[blockIndex]?.sentences?.[sentenceIndex];
  if (!sentence || !sentence.length) return undefined;
  return sentence.map((t) => (typeof t === "string" ? t : t[0])).join("").trim();
}
