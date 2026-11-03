export type HighlightMode = "none" | "cefr" | "rank";

export interface ElenoLexiconEntry {
  id: string;
  lemma: string;
  pos: string;
  cefr: string;
  rank?: number | null;
  ipa?: string | null;
  hint?: string | null;
  definitions: string[];
}

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
