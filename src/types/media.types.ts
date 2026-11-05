export type MediaType = "book" | "movie" | "tv_show" | "tv_episode" | "podcast" | "article";
export type MediaFormat = "epub" | "srt" | "vtt" | "txt" | "markdown" | "unknown";

export interface FrequencyTiers {
  tokens?: Record<string, number>;
  lemmas?: Record<string, number>;
  percentages?: {
    top_1k_pct?: number;
    k1_to_5k_pct?: number;
    k5_to_10k_pct?: number;
    rare_pct?: number;
    unranked_pct?: number;
  };
}

export interface VerbProfile {
  moods?: Record<string, number>;
  tenses?: Record<string, number>;
  subjunctive_load?: number;
  preterite_share?: number;
  imperfect_share?: number;
}

export interface MediaMetrics {
  media_item_id: string;
  total_tokens: number;
  content_tokens: number;
  unique_words_count: number;
  trackable_tokens?: number;
  unique_lemmas?: number;
  coverage_90_lemmas?: number | null;
  coverage_95_lemmas?: number | null;
  coverage_98_lemmas?: number | null;
  duration_seconds?: number | null;
  speaking_seconds?: number | null;
  speech_density?: number | null;
  words_per_minute?: number | null;
  cefr_level: string | null;
  cefr_distribution: Record<string, number>;
  lexical_density: number | null;
  type_token_ratio?: number | null;
  hapax_percentage?: number | null;
  mean_sentence_length?: number | null;
  dialogue_ratio?: number | null;
  readability_score: number | null;
  frequency_tiers?: FrequencyTiers;
  pos_distribution?: Record<string, number>;
  verb_profile?: VerbProfile;
}

export interface MediaComprehensionStats {
  media_item_id: string;
  total_words: number;
  known_words: number;
  learning_words?: number;
  comprehension_percentage: number;
  learning_percentage?: number;
  total_tokens: number;
  known_tokens: number;
  learning_tokens?: number;
  text_coverage_percentage: number;
  learning_text_coverage_percentage?: number;
}

export interface ChapterComprehensionStats {
  chapter_index: number;
  chapter_title: string;
  total_words: number;
  known_words: number;
  learning_words?: number;
  chapter_comprehension_percentage: number;
  learning_percentage?: number;
  total_tokens: number;
  known_tokens: number;
  learning_tokens?: number;
  text_coverage_percentage: number | null;
  learning_text_coverage_percentage?: number | null;
  new_words_count: number;
  known_new_words: number;
}

export interface MediaChapterMetrics {
  id: string;
  media_item_id: string;
  chapter_index: number;
  chapter_title: string;
  total_tokens: number;
  content_tokens: number;
  trackable_tokens?: number;
  unique_words_count: number;
  cefr_level: string | null;
  readability_score: number | null;
  dialogue_ratio: number | null;
  user_comprehension?: ChapterComprehensionStats;
}

export interface PreviewWordItem {
  canonical_id: string;
  lemma: string;
  pos: string;
  frequency: number;
  cefr: string;
  rank: number | null;
  sentence: string | null;
}

export interface MediaCatalogItem {
  id: string;
  work_id?: string | null;
  work_title?: string | null;
  work_language?: string | null;
  work_synopsis?: string | null;
  editions?: MediaCatalogItem[];
  type: MediaType;
  title: string;
  creator: string;
  language: string;
  format: MediaFormat;
  cover_image_url: string | null;
  release_year: number | null;
  series_name?: string | null;
  series_order?: number | null;
  metrics: MediaMetrics | null;
  comprehension: MediaComprehensionStats | null;
  previewWords: PreviewWordItem[];
  sampleSnippet: string | null;
  sampleSourceLabel: string;
}
