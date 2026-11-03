const FONT_SIZE_KEY = "eleno.reader.fontSize";

export const MIN_FONT_SIZE = 14;
export const MAX_FONT_SIZE = 32;
export const DEFAULT_FONT_SIZE = 20;

export function clampFontSize(value: number): number {
  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, value));
}

export function readStoredFontSize(): number {
  try {
    const stored = Number(window.localStorage.getItem(FONT_SIZE_KEY));
    return stored >= MIN_FONT_SIZE && stored <= MAX_FONT_SIZE ? stored : DEFAULT_FONT_SIZE;
  } catch {
    return DEFAULT_FONT_SIZE;
  }
}

export function persistFontSize(value: number): void {
  try {
    window.localStorage.setItem(FONT_SIZE_KEY, String(value));
  } catch {
    /* storage unavailable */
  }
}
