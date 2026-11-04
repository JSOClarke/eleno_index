import type { HighlightMode } from "@/types/reader.types";

const PREFS_KEY = "eleno.reader.prefs";
const LEGACY_FONT_SIZE_KEY = "eleno.reader.fontSize";

export const MIN_FONT_SIZE = 14;
export const MAX_FONT_SIZE = 32;
export const DEFAULT_FONT_SIZE = 20;

export interface ReaderPrefs {
  fontSize: number;
  showRuby: boolean;
  showIPlusOne: boolean;
  highlightMode: HighlightMode;
  highlightUnknownOnly: boolean;
}

const DEFAULT_PREFS: ReaderPrefs = {
  fontSize: DEFAULT_FONT_SIZE,
  showRuby: true,
  showIPlusOne: false,
  highlightMode: "none",
  highlightUnknownOnly: true,
};

export function clampFontSize(value: number): number {
  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, value));
}

function isHighlightMode(value: unknown): value is HighlightMode {
  return value === "none" || value === "cefr" || value === "rank";
}

export function readReaderPrefs(): ReaderPrefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<ReaderPrefs>) : {};
    const legacyFont = Number(window.localStorage.getItem(LEGACY_FONT_SIZE_KEY));
    const storedFont = Number(parsed.fontSize);

    const fontSize = Number.isFinite(storedFont)
      ? storedFont
      : Number.isFinite(legacyFont) && legacyFont >= MIN_FONT_SIZE
        ? legacyFont
        : DEFAULT_FONT_SIZE;

    return {
      fontSize: clampFontSize(fontSize),
      showRuby: typeof parsed.showRuby === "boolean" ? parsed.showRuby : DEFAULT_PREFS.showRuby,
      showIPlusOne:
        typeof parsed.showIPlusOne === "boolean"
          ? parsed.showIPlusOne
          : DEFAULT_PREFS.showIPlusOne,
      highlightMode: isHighlightMode(parsed.highlightMode)
        ? parsed.highlightMode
        : DEFAULT_PREFS.highlightMode,
      highlightUnknownOnly:
        typeof parsed.highlightUnknownOnly === "boolean"
          ? parsed.highlightUnknownOnly
          : DEFAULT_PREFS.highlightUnknownOnly,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function persistReaderPrefs(prefs: ReaderPrefs): void {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable */
  }
}
