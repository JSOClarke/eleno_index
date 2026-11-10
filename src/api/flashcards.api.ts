import { supabase } from "@/lib/supabase";
import type { CreateFlashcardPayload, FlashcardQueueSummary, UserFlashcard } from "@/types/flashcard.types";

const INTERVALS = [1, 3, 7, 14, 30, 60];

function normalizeDynamicCard(row: any, userId: string): UserFlashcard {
  return {
    id: String(row.card_id || row.id || row.canonical_id),
    user_id: String(row.user_id || userId),
    canonical_id: String(row.canonical_id),
    sentence: String(row.sentence || ""),
    target_surface: String(row.target_surface || row.target_lemma || ""),
    target_lemma: String(row.target_lemma || ""),
    target_pos: row.target_pos ? String(row.target_pos) : null,
    english_definition: String(row.english_definition || ""),
    source_media_title: row.source_media_title ? String(row.source_media_title) : null,
    source_context: row.source_context ? String(row.source_context) : null,
    level: Number(row.level || row.srs_level || 1),
    interval_days: Number(row.interval_days || row.srs_interval_days || 1),
    due_at: String(row.due_at || row.srs_due_at || new Date().toISOString()),
    review_count: Number(row.review_count || row.srs_review_count || 0),
    consecutive_correct: Number(row.consecutive_correct || row.srs_consecutive_correct || 0),
    last_reviewed_at: row.last_reviewed_at ? String(row.last_reviewed_at) : null,
    is_i_plus_one: Boolean(row.is_i_plus_one),
  };
}

export async function fetchDueFlashcards(userId: string, limit = 20): Promise<UserFlashcard[]> {
  const { data, error } = await supabase.rpc("get_due_flashcards_dynamic", {
    p_user_id: userId,
    p_limit: limit,
  });

  if (!error && Array.isArray(data) && data.length > 0) {
    return data.map((row) => normalizeDynamicCard(row, userId));
  }
  if (error) console.error("[fetchDueFlashcards] RPC error, falling back:", error);

  const { data: vocabRows, error: vErr } = await supabase
    .from("user_vocabulary")
    .select(`id, canonical_id, srs_level, srs_interval_days, srs_due_at, srs_review_count, canonical_lexical_entity!inner (lemma, pos, definitions)`)
    .eq("user_id", userId)
    .eq("status", "learning")
    .order("srs_due_at", { ascending: true })
    .limit(limit);

  if (vErr || !vocabRows) return [];
  return vocabRows.map((r: any) => {
    const cle = r.canonical_lexical_entity || {};
    const lemma = String(cle.lemma || r.canonical_id);
    const def = Array.isArray(cle.definitions) && cle.definitions[0] ? cle.definitions[0] : lemma;
    return normalizeDynamicCard({
      card_id: r.id,
      canonical_id: r.canonical_id,
      sentence: `Esta palabra está en tu lista de aprendizaje: ${lemma}.`,
      target_surface: lemma,
      target_lemma: lemma,
      target_pos: cle.pos,
      english_definition: def,
      level: r.srs_level,
      interval_days: r.srs_interval_days,
      due_at: r.srs_due_at,
      review_count: r.srs_review_count,
      is_i_plus_one: false,
    }, userId);
  });
}

export async function fetchFlashcardQueueSummary(userId: string): Promise<FlashcardQueueSummary> {
  const { data, error } = await supabase.rpc("get_flashcard_queue_summary", {
    p_user_id: userId,
  });
  if (!error && Array.isArray(data) && data[0]) {
    return {
      dueReviews: Number(data[0].due_reviews || 0),
      newUnstarted: Number(data[0].new_unstarted || 0),
      totalLearning: Number(data[0].total_learning || 0),
    };
  }
  return { dueReviews: 0, newUnstarted: 0, totalLearning: 0 };
}

export async function fetchDueCardCount(userId: string): Promise<number> {
  const summary = await fetchFlashcardQueueSummary(userId);
  if (summary.totalLearning > 0) {
    return summary.dueReviews + Math.min(summary.newUnstarted, Math.max(20 - summary.dueReviews, 0));
  }
  const { data } = await supabase.rpc("get_due_flashcard_count");
  return typeof data === "number" ? data : 0;
}

export async function submitFlashcardReview(card: UserFlashcard, isCorrect: boolean): Promise<UserFlashcard> {
  const { data: rpcData, error: rpcError } = await supabase.rpc("submit_flashcard_review", {
    p_canonical_id: card.canonical_id,
    p_is_correct: isCorrect,
  });

  if (!rpcError && rpcData) {
    return {
      ...card,
      level: Number(rpcData.srs_level || 1),
      interval_days: Number(rpcData.srs_interval_days || 1),
      due_at: String(rpcData.srs_due_at || new Date().toISOString()),
      review_count: Number(rpcData.srs_review_count || card.review_count + 1),
      consecutive_correct: Number(rpcData.srs_consecutive_correct || 0),
      last_reviewed_at: rpcData.srs_last_reviewed_at ? String(rpcData.srs_last_reviewed_at) : null,
    };
  }

  const nextLevel = isCorrect ? Math.min(card.level + 1, 6) : 1;
  const nextInterval = isCorrect ? INTERVALS[nextLevel - 1] : 1;
  const dueAt = new Date();
  if (isCorrect) dueAt.setDate(dueAt.getDate() + nextInterval);
  else dueAt.setMinutes(dueAt.getMinutes() + 10);

  const updates = {
    srs_level: nextLevel,
    srs_interval_days: nextInterval,
    srs_due_at: dueAt.toISOString(),
    srs_review_count: card.review_count + 1,
    srs_consecutive_correct: isCorrect ? card.consecutive_correct + 1 : 0,
    last_reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await supabase.from("user_vocabulary").update(updates).eq("user_id", card.user_id).eq("canonical_id", card.canonical_id);
  return { ...card, ...updates, due_at: updates.srs_due_at, review_count: updates.srs_review_count, consecutive_correct: updates.srs_consecutive_correct };
}

export async function upsertWordFlashcard(userId: string, payload: CreateFlashcardPayload): Promise<void> {
  await supabase.from("user_vocabulary").upsert(
    { user_id: userId, canonical_id: payload.canonical_id, status: "learning", updated_at: new Date().toISOString() },
    { onConflict: "user_id, canonical_id" }
  );
}

export async function deleteWordFlashcard(userId: string, canonicalId: string): Promise<void> {
  await supabase.from("user_vocabulary").delete().eq("user_id", userId).eq("canonical_id", canonicalId);
}
