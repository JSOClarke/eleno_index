import { supabase } from "@/lib/supabase";
import type { CreateFlashcardPayload, UserFlashcard } from "@/types/flashcard.types";

const INTERVALS = [1, 3, 7, 14, 30, 60];

function normalizeFlashcard(row: any): UserFlashcard {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    canonical_id: String(row.canonical_id),
    sentence: String(row.sentence || ""),
    target_surface: String(row.target_surface || ""),
    target_lemma: String(row.target_lemma || ""),
    target_pos: row.target_pos ? String(row.target_pos) : null,
    english_definition: String(row.english_definition || ""),
    source_media_title: row.source_media_title ? String(row.source_media_title) : null,
    source_context: row.source_context ? String(row.source_context) : null,
    level: Number(row.level || 1),
    interval_days: Number(row.interval_days || 1),
    due_at: String(row.due_at || new Date().toISOString()),
    review_count: Number(row.review_count || 0),
    consecutive_correct: Number(row.consecutive_correct || 0),
    last_reviewed_at: row.last_reviewed_at ? String(row.last_reviewed_at) : null,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export async function fetchDueFlashcards(
  userId: string,
  limit: number = 50
): Promise<UserFlashcard[]> {
  const { data, error } = await supabase
    .from("user_flashcards")
    .select("*")
    .eq("user_id", userId)
    .lte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(normalizeFlashcard);
}

export async function fetchDueCardCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("user_flashcards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .lte("due_at", new Date().toISOString());

  if (error) {
    console.warn("fetchDueCardCount error:", error.message);
    return 0;
  }
  return count || 0;
}

export async function submitFlashcardReview(
  card: UserFlashcard,
  isCorrect: boolean
): Promise<UserFlashcard> {
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "submit_flashcard_review",
    { p_card_id: card.id, p_is_correct: isCorrect }
  );

  if (!rpcError && rpcData) {
    return normalizeFlashcard(rpcData);
  }

  // Fallback direct update if RPC is not deployed yet
  const nextLevel = isCorrect ? Math.min(card.level + 1, 6) : 1;
  const nextInterval = isCorrect ? INTERVALS[nextLevel - 1] : 1;
  const dueAt = new Date();
  if (isCorrect) {
    dueAt.setDate(dueAt.getDate() + nextInterval);
  } else {
    dueAt.setMinutes(dueAt.getMinutes() + 10);
  }

  const updates = {
    level: nextLevel,
    interval_days: nextInterval,
    due_at: dueAt.toISOString(),
    review_count: card.review_count + 1,
    consecutive_correct: isCorrect ? card.consecutive_correct + 1 : 0,
    last_reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("user_flashcards")
    .update(updates)
    .eq("id", card.id)
    .select("*")
    .single();

  if (error) throw error;
  return normalizeFlashcard(data);
}

export async function upsertWordFlashcard(
  userId: string,
  payload: CreateFlashcardPayload
): Promise<UserFlashcard> {
  const record = {
    user_id: userId,
    canonical_id: payload.canonical_id,
    sentence: payload.sentence.trim(),
    target_surface: payload.target_surface.trim(),
    target_lemma: payload.target_lemma.trim(),
    target_pos: payload.target_pos || null,
    english_definition: payload.english_definition.trim(),
    source_media_title: payload.source_media_title || null,
    source_context: payload.source_context || null,
    level: 1,
    interval_days: 1,
    due_at: new Date().toISOString(),
    review_count: 0,
    consecutive_correct: 0,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("user_flashcards")
    .upsert(record, { onConflict: "user_id, canonical_id" })
    .select("*")
    .single();

  if (error) throw error;
  return normalizeFlashcard(data);
}

export async function deleteWordFlashcard(
  userId: string,
  canonicalId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_flashcards")
    .delete()
    .eq("user_id", userId)
    .eq("canonical_id", canonicalId);

  if (error) throw error;
}
