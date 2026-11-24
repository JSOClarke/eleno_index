import type { MediaCatalogItem } from "@/types/media.types";

export type SupportedLanguage = "es" | "fr" | "zh";

/** Ordered edition languages used when choosing a work's default catalogue edition. */
export const PRIMARY_EDITION_PRIORITY: SupportedLanguage[] = ["es", "fr", "zh"];

/** Languages the reader pipeline currently supports. */
export const READABLE_LANGUAGES = new Set<string>(["es", "fr", "zh"]);

const ACTIVE_LANG_STORAGE_KEY = "eleno_active_language";

export function readActiveLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "es";
  const raw = window.localStorage.getItem(ACTIVE_LANG_STORAGE_KEY);
  return raw === "fr" || raw === "zh" ? raw : "es";
}

export function writeActiveLanguage(lang: SupportedLanguage): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_LANG_STORAGE_KEY, lang);
  window.dispatchEvent(new CustomEvent("eleno-language-change", { detail: lang }));
}

export function getLanguageLabel(lang?: string | null): string {
  const l = (lang || "es").toLowerCase();
  if (l.startsWith("fr")) return "French";
  if (l.startsWith("zh")) return "Chinese";
  return "Spanish";
}

export function getTtsLocale(lang?: string | null): string {
  const l = (lang || readActiveLanguage()).toLowerCase();
  if (l.startsWith("fr")) return "fr-FR";
  if (l.startsWith("zh")) return "zh-CN";
  return "es-ES";
}

/** Project a work item onto its edition for the active target language, or null if none exists. */
export function selectWorkEditionForLanguage(
  item: MediaCatalogItem,
  lang: SupportedLanguage
): MediaCatalogItem | null {
  if (item.language === lang) return item;
  const match = item.editions?.find((ed) => ed.language === lang);
  if (!match) return null;
  return {
    ...match,
    work_id: item.work_id,
    work_title: item.work_title,
    work_language: item.work_language,
    work_synopsis: item.work_synopsis,
    sampleSnippet: item.work_synopsis || match.sampleSnippet,
    sampleSourceLabel: item.work_synopsis ? "WORK SYNOPSIS · EN" : match.sampleSourceLabel,
    editions: item.editions,
  };
}
