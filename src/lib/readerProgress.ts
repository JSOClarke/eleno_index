import type { ElenoReaderManifest } from "@/types/reader.types";

export function totalBookTokens(manifest: ElenoReaderManifest): number {
  return manifest.chapters.reduce((sum, chapter) => sum + Math.max(chapter.token_count, 0), 0);
}

export function priorBookTokens(
  manifest: ElenoReaderManifest,
  chapterIndex: number
): number {
  return manifest.chapters
    .filter((chapter) => chapter.index < chapterIndex)
    .reduce((sum, chapter) => sum + Math.max(chapter.token_count, 0), 0);
}

export function chapterTokenCount(
  manifest: ElenoReaderManifest,
  chapterIndex: number
): number {
  return Math.max(
    manifest.chapters.find((chapter) => chapter.index === chapterIndex)?.token_count ?? 0,
    0
  );
}

export function bookFractionFromChapter(
  manifest: ElenoReaderManifest,
  chapterIndex: number,
  chapterFraction: number
): number {
  const total = totalBookTokens(manifest);
  if (total <= 0) return 0;
  const value =
    (priorBookTokens(manifest, chapterIndex) +
      Math.max(0, Math.min(1, chapterFraction)) * chapterTokenCount(manifest, chapterIndex)) /
    total;
  return Math.max(0, Math.min(1, value));
}

export function bookPercentageForBlock(
  manifest: ElenoReaderManifest,
  chapterIndex: number,
  blockIndex: number,
  blockCount: number
): number {
  const fraction = blockCount > 0 ? Math.min(1, (blockIndex + 1) / blockCount) : 0;
  return Math.round(bookFractionFromChapter(manifest, chapterIndex, fraction) * 100);
}
