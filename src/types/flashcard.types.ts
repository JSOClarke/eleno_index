export interface UserFlashcard {
  id: string;
  user_id: string;
  canonical_id: string;
  sentence: string;
  target_surface: string;
  target_lemma: string;
  target_pos: string | null;
  english_definition: string;
  source_media_title: string | null;
  source_context: string | null;
  level: number;
  interval_days: number;
  due_at: string;
  review_count: number;
  consecutive_correct: number;
  last_reviewed_at: string | null;
  is_i_plus_one?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FlashcardReviewResult {
  card: UserFlashcard;
  isCorrect: boolean;
  userInput: string;
  previousLevel: number;
  newLevel: number;
  nextIntervalDays: number;
}

export interface FlashcardSessionStats {
  total: number;
  completed: number;
  correct: number;
  streak: number;
  graduated: number;
}

export interface CreateFlashcardPayload {
  canonical_id: string;
  sentence: string;
  target_surface: string;
  target_lemma: string;
  target_pos?: string | null;
  english_definition: string;
  source_media_title?: string | null;
  source_context?: string | null;
}
