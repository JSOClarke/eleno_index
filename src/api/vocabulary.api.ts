import { supabase } from "@/lib/supabase";
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
  const pageSize = 1000;
  const maxRows = 12000;
  const rows: any[] = [];

  for (let from = 0; from < maxRows; from += pageSize) {
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
      .in("status", ["known", "learning"])
      .order("updated_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error || !data || data.length === 0) break;
    rows.push(...data);
    if (data.length < pageSize) break;
  }

  return rows.map((row: any) => {
    const entity = row.canonical_lexical_entity || {};
    const rankings: LexicalRanking[] = entity.lexical_ranking || [];
    const pronunciations = entity.lexical_pronunciation || [];

    const cefrRanking =
      rankings.find((r) => r.source === "elelex_v2020" && r.cefr) ||
      rankings.find((r) => r.cefr);
    const cefr = cefrRanking?.cefr || "B2";

    const tubelexRanking = rankings.find((r) => r.source === "tubelex_v2025");
    const rank = tubelexRanking?.rank ? Number(tubelexRanking.rank) : null;

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
      definitions: Array.isArray(entity.definitions) ? entity.definitions : [],
      cefr,
      global_rank: rank,
      rankings,
      ipa,
    };
  });
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
