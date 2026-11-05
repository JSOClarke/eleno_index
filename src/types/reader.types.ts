export type HighlightMode = "none" | "cefr" | "rank";
export type RubyPosFilter = "ALL" | "NOUN" | "VERB" | "ADJ" | "ADV";

export type ProgressSyncState = "idle" | "saving" | "saved" | "error";
export type ProgressSaveResult = "saved" | "skipped" | "error";

export interface ElenoLexiconEntry {
  /** Canonical UUID, or null for a wordform without a canonical row. */
  id: string | null;
  /** false = untracked wordform (proper noun, typo, unindexed); never mark it known. */
  tracked?: boolean;
  lemma: string;
  pos: string;
  cefr: string;
  rank?: number | null;
  rank_source?: string | null;
  ipa?: string | null;
  hint?: string | null;
  definitions: string[];
}

/** A lexicon entry that is guaranteed to have an authoritative canonical row. */
export type TrackedLexiconEntry = ElenoLexiconEntry & { id: string };

export interface ElenoReaderChapterMeta {
  index: number;
  title: string;
  token_count: number;
  block_count: number;
}

export interface ElenoReaderManifest {
  schema_version: number;
  media_item_id: string;
  title: string;
  creator: string;
  type: string;
  language: string;
  total_chapters: number;
  chapters: ElenoReaderChapterMeta[];
  lexicon: ElenoLexiconEntry[];
}

/**
 * A token is EITHER:
 * - A string: whitespace, punctuation, number, or untracked proper noun
 * - A tuple [surface, lexIdx, morph?]: trackable word where lexIdx indexes manifest.lexicon[]
 */
export type ElenoToken = string | [surface: string, lexIdx: number, morph?: string];

export interface ElenoReaderBlock {
  type: "h1" | "h2" | "h3" | "p" | "quote" | "cue";
  time_ms?: [number, number];
  sentences: ElenoToken[][];
}

export interface ElenoReaderChapter {
  schema_version: number;
  media_item_id: string;
  chapter_index: number;
  chapter_title: string;
  blocks: ElenoReaderBlock[];
}

export interface ReadingBookmark {
  id: string;
  chapter_index: number;
  block_index: number;
  note?: string;
  created_at: string;
}

export interface ReadingProgress {
  user_id?: string;
  media_item_id: string;
  chapter_index: number;
  block_index: number;
  token_index: number;
  percentage: number;
  bookmarks: ReadingBookmark[];
  updated_at?: string;
}
