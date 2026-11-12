import type { AudioSentenceSpan, AudioWordSpan } from "@/types/readerAudio.types";

export function findActiveWord(
  words: AudioWordSpan[],
  timeMs: number
): { bIdx: number; sIdx: number; tIdx: number } | null {
  if (!words.length) return null;
  let low = 0;
  let high = words.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const w = words[mid];
    if (timeMs < w.start_ms) {
      high = mid - 1;
    } else if (timeMs >= w.end_ms) {
      low = mid + 1;
    } else {
      return { bIdx: w.bIdx, sIdx: w.sIdx, tIdx: w.tIdx };
    }
  }
  return null;
}

export function findActiveSentence(
  sentences: AudioSentenceSpan[],
  timeMs: number
): { bIdx: number; sIdx: number } | null {
  if (!sentences.length) return null;
  let low = 0;
  let high = sentences.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const s = sentences[mid];
    if (timeMs < s.start_ms) {
      high = mid - 1;
    } else if (timeMs >= s.end_ms) {
      low = mid + 1;
    } else {
      return { bIdx: s.bIdx, sIdx: s.sIdx };
    }
  }
  return null;
}

export function findTokenTime(
  words: AudioWordSpan[],
  bIdx: number,
  sIdx: number,
  tIdx: number
): number | null {
  const match = words.find((w) => w.bIdx === bIdx && w.sIdx === sIdx && w.tIdx === tIdx);
  return match ? match.start_ms : null;
}

export function findSentenceTime(
  sentences: AudioSentenceSpan[],
  bIdx: number,
  sIdx: number
): number | null {
  const match = sentences.find((s) => s.bIdx === bIdx && s.sIdx === sIdx);
  return match ? match.start_ms : null;
}
