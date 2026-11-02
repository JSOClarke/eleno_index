export type UserVocabStatus = "known" | "learning" | "ignored";

export interface UserProfile {
  id: string;
  email: string | null;
}

export interface LexicalRanking {
  source: string;
  rank: number | null;
  cefr: string | null;
  count?: number | null;
}

export interface VocabularyWord {
  canonical_id: string;
  lemma: string;
  pos: string;
  frequency: number;
  first_occurrence_index: number;
  first_timestamp_ms: number | null;
  first_context_snippet: string | null;
  cefr: string;
  global_rank: number | null;
  rankings?: LexicalRanking[];
  ipa: string | null;
}

export interface KnownWordEntry {
  canonical_id: string;
  status: UserVocabStatus;
  updated_at: string | null;
  lemma: string;
  pos: string;
  cefr: string;
  global_rank: number | null;
  rankings: LexicalRanking[];
  ipa: string | null;
}

export interface QuarantineItem {
  id: string;
  media_item_id: string;
  token: string;
  category: "proper_noun" | "noise_and_typos" | string;
  frequency: number;
}
