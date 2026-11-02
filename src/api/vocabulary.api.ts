import { supabase } from "@/lib/supabase";
import type { WordSentenceEntry } from "@/api/inspector.api";
import type {
  KnownWordEntry,
  LexicalRanking,
  UserVocabStatus,
} from "@/types/vocabulary.types";

export async function fetchAllUserVocabulary(
  userId: string
): Promise<Record<string, UserVocabStatus>> {
  const map: Record<string, UserVocabStatus> = {};
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("user_vocabulary")
      .select("canonical_id, status")
      .eq("user_id", userId)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      map[row.canonical_id] = row.status as UserVocabStatus;
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return map;
}

export async function fetchKnownWordsDetails(userId: string): Promise<KnownWordEntry[]> {
  const { data, error } = await supabase
    .from("user_vocabulary")
    .select(
      `
      canonical_id,
      status,
      updated_at,
      canonical_lexical_entity!inner (
        lemma,
        pos,
        lexical_ranking (source, cefr, rank, count),
        lexical_pronunciation (transcriptions)
      )
    `
    )
    .eq("user_id", userId)
    .eq("status", "known")
    .order("updated_at", { ascending: false })
    .range(0, 1999);

  if (error || !data) return [];

  return data.map((row: any) => {
    const entity = row.canonical_lexical_entity || {};
    const rankings: LexicalRanking[] = entity.lexical_ranking || [];
    const pronunciations = entity.lexical_pronunciation || [];

    const cefrRanking =
      rankings.find((r) => r.source === "elelex_v2020" && r.cefr) ||
      rankings.find((r) => r.cefr);
    const cefr = cefrRanking?.cefr || "B2";

    const primaryRanking =
      rankings.find((r) => r.source === "tubelex_v2025") || rankings[0];
    const rank = primaryRanking?.rank ? Number(primaryRanking.rank) : null;

    let ipa: string | null = null;
    if (pronunciations.length > 0 && pronunciations[0]?.transcriptions?.length > 0) {
      ipa = pronunciations[0].transcriptions[0].ipa || null;
    }

    return {
      canonical_id: String(row.canonical_id || ""),
      status: (row.status || "known") as UserVocabStatus,
      updated_at: row.updated_at || null,
      lemma: String(entity.lemma || row.canonical_id || ""),
      pos: String(entity.pos || "NOUN"),
      cefr,
      global_rank: rank,
      rankings,
      ipa,
    };
  });
}

export async function fetchGlobalWordSentences(
  canonicalId: string
): Promise<WordSentenceEntry[]> {
  const { data, error } = await supabase
    .from("sentence_bank")
    .select("sentence, target_form, source_context")
    .eq("canonical_id", canonicalId)
    .limit(3);

  if (error || !data) return [];
  return data;
}

export async function persistUserWordStatus(
  userId: string,
  canonicalId: string,
  status: UserVocabStatus | null
): Promise<void> {
  if (status === null) {
    const { error } = await supabase
      .from("user_vocabulary")
      .delete()
      .eq("user_id", userId)
      .eq("canonical_id", canonicalId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("user_vocabulary").upsert(
      {
        user_id: userId,
        canonical_id: canonicalId,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id, canonical_id" }
    );
    if (error) throw error;
  }
}
