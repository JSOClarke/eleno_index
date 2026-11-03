export interface SentenceToken {
  surface: string;
  start_char: number;
  end_char: number;
  canonical_id?: string | null;
  lemma?: string | null;
  pos?: string | null;
  morph?: string | null;
}

export interface BankSentence {
  id: string;
  media_item_id: string;
  sentence: string;
  token_count: number;
  source_context: string;
  canonical_ids: string[];
  tokens: SentenceToken[];
  unknown_count?: number;
}

export interface CanonicalGloss {
  id: string;
  lemma: string;
  pos: string;
  definitions: string[];
}
