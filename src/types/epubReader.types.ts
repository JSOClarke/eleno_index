export type EpubTheme = "light" | "sepia" | "dark";
export type EpubScrollMode = "scroll" | "paged";
export type EpubHighlightMode = "status" | "i1" | "cefr" | "rank" | "off";

export interface EpubChapter {
  index: number;
  id: string;
  href: string;
  title: string;
  paragraphs: string[];
}

export interface EpubBookMeta {
  id: string;
  title: string;
  author: string;
  language: string;
  coverUrl: string | null;
  chapterCount: number;
  addedAt: number;
}

export interface EpubBook extends EpubBookMeta {
  chapters: EpubChapter[];
}

export interface EpubProgress {
  chapterIndex: number;
  pageIndex: number;
  scrollTop: number;
  updatedAt: number;
}

export interface EpubSettings {
  theme: EpubTheme;
  fontSize: number;
  scrollMode: EpubScrollMode;
  highlightUnknown: boolean;
  highlightMode?: EpubHighlightMode;
}

export interface ParsedCanonical {
  id?: string | null;
  canonical_id?: string | null;
  lemma: string;
  pos?: string | null;
  cefr?: string | null;
  ipa?: string | null;
  rank?: number | null;
  definitions?: string[];
  definitions_es?: string[];
  es_definitions?: string[];
}

export interface ParsedToken {
  surface: string;
  start: number;
  end: number;
  is_word?: boolean;
  is_stop?: boolean;
  pos?: string | null;
  morph?: string | Record<string, string>;
  canonical?: ParsedCanonical | null;
  user_status?: "known" | "learning" | null;
}

export interface ParsedPhrase {
  phrase?: string;
  canonical_phrase?: string;
  gloss?: string | null;
  type?: string | null;
  char_start: number;
  char_end: number;
  definitions?: string[];
  cefr?: string | null;
}

export interface ParsedBlockResult {
  text: string;
  tokens: ParsedToken[];
  phrases?: ParsedPhrase[];
  stats?: { total_tokens?: number; phrases_count?: number };
}

export interface SelectedWordContext {
  token: ParsedToken;
  sentence: string;
  phrases: ParsedPhrase[];
  iPlusOne?: { isTarget: boolean; targetSurface: string } | null;
  anchorRect: { top: number; left: number; bottom: number; width: number };
}
