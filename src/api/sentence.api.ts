import { supabase } from "@/lib/supabase";
import type { BankSentence, CanonicalGloss, SentenceToken } from "@/types/sentence.types";

const SENTENCE_SELECT =
  "id, media_item_id, sentence, token_count, source_context, canonical_ids, tokens";

function toToken(raw: any): SentenceToken {
  return {
    surface: String(raw?.surface ?? ""),
    start_char: Number(raw?.start_char ?? 0),
    end_char: Number(raw?.end_char ?? 0),
    canonical_id: raw?.canonical_id ? String(raw.canonical_id) : null,
    lemma: raw?.lemma ? String(raw.lemma) : null,
    pos: raw?.pos ? String(raw.pos) : null,
    morph: raw?.morph ? String(raw.morph) : null,
  };
}

function toBankSentence(raw: any): BankSentence {
  const tokens = Array.isArray(raw?.tokens)
    ? raw.tokens.map(toToken).filter((token: SentenceToken) => token.surface.length > 0)
    : [];
  return {
    id: String(raw?.id ?? ""),
    media_item_id: String(raw?.media_item_id ?? ""),
    sentence: String(raw?.sentence ?? ""),
    token_count: Number(raw?.token_count ?? 0),
    source_context: String(raw?.source_context ?? ""),
    canonical_ids: Array.isArray(raw?.canonical_ids) ? raw.canonical_ids.map(String) : [],
    tokens,
    unknown_count:
      raw?.unknown_count === null || raw?.unknown_count === undefined
        ? undefined
        : Number(raw.unknown_count),
  };
}

export async function fetchCanonicalSentences(
  canonicalId: string,
  mediaItemId?: string,
  limit = 3
): Promise<BankSentence[]> {
  let query = supabase
    .from("sentence_bank")
    .select(SENTENCE_SELECT)
    .contains("canonical_ids", [canonicalId])
    .order("token_count", { ascending: true })
    .limit(limit);

  if (mediaItemId) query = query.eq("media_item_id", mediaItemId);

  const { data, error } = await query;
  if (error) {
    console.error("[sentence.api] Failed to fetch canonical sentences:", error);
    return [];
  }
  return (data || []).map(toBankSentence);
}

export async function fetchIPlusOneSentences(
  canonicalId: string,
  userId: string,
  mediaItemId?: string,
  limit = 10
): Promise<BankSentence[]> {
  const { data, error } = await supabase.rpc("get_i_plus_one_sentences", {
    p_user_id: userId,
    p_canonical_id: canonicalId,
    p_media_item_id: mediaItemId ?? null,
    p_limit: limit,
  });

  if (error) {
    console.error("[sentence.api] Failed to fetch i+1 sentences:", error);
    return [];
  }
  return (data || []).map(toBankSentence);
}

const glossCache = new Map<string, CanonicalGloss>();

export async function fetchCanonicalGlosses(
  canonicalIds: string[]
): Promise<Record<string, CanonicalGloss>> {
  const missing = canonicalIds.filter((id) => !glossCache.has(id));
  if (missing.length > 0) {
    const { data, error } = await supabase
      .from("canonical_lexical_entity")
      .select("id, lemma, pos, definitions")
      .in("id", missing);
    if (!error) {
      for (const row of data || []) {
        glossCache.set(String(row.id), {
          id: String(row.id),
          lemma: String(row.lemma ?? ""),
          pos: String(row.pos ?? ""),
          definitions: Array.isArray(row.definitions) ? row.definitions.map(String) : [],
        });
      }
    }
  }

  const result: Record<string, CanonicalGloss> = {};
  for (const id of canonicalIds) {
    const gloss = glossCache.get(id);
    if (gloss) result[id] = gloss;
  }
  return result;
}
