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
  ipa: string | null;
}

export interface QuarantineItem {
  id: string;
  media_item_id: string;
  surface_form: string;
  suggested_lemma: string | null;
  pos: string | null;
  reason: "PROPER_NOUN" | "OOV" | "NOISE" | string;
  frequency: number;
  context_snippet: string | null;
}
