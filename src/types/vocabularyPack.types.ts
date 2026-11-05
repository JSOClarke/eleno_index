import type { UserVocabStatus } from "./vocabulary.types";

export interface VocabularyPack {
  id: string;
  slug: string;
  title: string;
  description: string;
  group_label: string;
  rule_type: "tubelex_top" | "cefr_levels" | "curated" | string;
  rule_params: { limit?: number; levels?: string[]; count?: number };
  sort_order: number;
  is_active: boolean;
}

export interface VocabularyPackSample {
  canonical_id: string;
  lemma: string;
  pos: string;
  cefr?: string | null;
  status?: UserVocabStatus | null;
}

export interface VocabularyPackPreview {
  pack_id: string;
  total_count: number;
  known_count: number;
  learning_count: number;
  ignored_count: number;
  new_count: number;
  sample: VocabularyPackSample[];
}

export interface VocabularyPackApplication {
  id: string;
  pack_id?: string | null;
  pack_slug: string;
  applied_status: "known" | "learning";
  changed_count: number;
  created_at: string;
  undone_at?: string | null;
}

export interface VocabularyPackApplyResult {
  application_id: string | null;
  changed_count: number;
  total_count: number;
  skipped_count: number;
}
