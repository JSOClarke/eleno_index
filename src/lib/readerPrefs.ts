import type { DefinitionLanguage, HighlightMode, RubyPosFilter } from "@/types/reader.types";

const PREFS_KEY = "eleno.reader.prefs";
const LEGACY_FONT_SIZE_KEY = "eleno.reader.fontSize";

export const MIN_FONT_SIZE = 14;
export const MAX_FONT_SIZE = 32;
export const DEFAULT_FONT_SIZE = 20;

export interface ReaderPrefs {
  fontSize: number;
  showRuby: boolean;
  rubyPos: RubyPosFilter;
  showIPlusOne: boolean;
  highlightMode: HighlightMode;
  highlightUnknownOnly: boolean;
  definitionLanguage: DefinitionLanguage;
}

const DEFAULT_PREFS: ReaderPrefs = {
  fontSize: DEFAULT_FONT_SIZE,
  showRuby: true,
  rubyPos: "ALL",
  showIPlusOne: false,
  highlightMode: "none",
  highlightUnknownOnly: true,
  definitionLanguage: "en",
};

export function clampFontSize(value: number): number {
  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, value));
}

function isHighlightMode(value: unknown): value is HighlightMode {
  return value === "none" || value === "cefr" || value === "rank";
}

function isRubyPosFilter(value: unknown): value is RubyPosFilter {
  return value === "ALL" || value === "NOUN" || value === "VERB" || value === "ADJ" || value === "ADV";
}

function isDefinitionLanguage(value: unknown): value is DefinitionLanguage {
  return value === "en" || value === "es";
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
      rubyPos: isRubyPosFilter(parsed.rubyPos) ? parsed.rubyPos : DEFAULT_PREFS.rubyPos,
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
      definitionLanguage: isDefinitionLanguage(parsed.definitionLanguage)
        ? parsed.definitionLanguage
        : DEFAULT_PREFS.definitionLanguage,
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
