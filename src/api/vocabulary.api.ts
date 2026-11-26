import { extractPronunciation } from "@/lib/pronunciation";
import { supabase } from "@/lib/supabase";
import type {
  KnownWordEntry,
  LexicalRanking,
  UserVocabStatus,
} from "@/types/vocabulary.types";

export async function fetchAllUserVocabulary(
  userId: string,
  language = "es"
): Promise<Record<string, UserVocabStatus>> {
  const map: Record<string, UserVocabStatus> = {};
  const pageSize = 1000;
  let useRpc = true;

  for (let from = 0; ; from += pageSize) {
    if (useRpc) {
      const { data: rpcData, error: rpcErr } = await supabase
        .rpc("get_user_vocabulary_map", { p_user_id: userId, p_language: language })
        .range(from, from + pageSize - 1);
      if (!rpcErr && Array.isArray(rpcData)) {
        for (const row of rpcData as Array<{ canonical_id?: string; status?: string }>) {
          if (row.canonical_id && row.status) map[row.canonical_id] = row.status as UserVocabStatus;
        }
        if (rpcData.length < pageSize) break;
        continue;
      }
      useRpc = false;
    }

    const { data, error } = await supabase
      .from("user_vocabulary")
      .select("canonical_id, status, canonical_lexical_entity!inner(language)")
      .eq("user_id", userId)
      .eq("canonical_lexical_entity.language", language)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      map[row.canonical_id] = row.status as UserVocabStatus;
    }
    if (data.length < pageSize) break;
  }

  return map;
}

export async function fetchKnownCountsByLanguage(
  userId: string
): Promise<Record<"es" | "fr" | "zh" | "ru", number>> {
  const counts: Record<"es" | "fr" | "zh" | "ru", number> = { es: 0, fr: 0, zh: 0, ru: 0 };
  const { data, error } = await supabase.rpc("get_user_known_counts", { p_user_id: userId });
  if (error || !Array.isArray(data)) return counts;
  for (const row of data as Array<{ language?: string; known_count?: number | string }>) {
    const lang = (row.language || "").toLowerCase();
    if (lang === "es" || lang === "fr" || lang === "zh" || lang === "ru") {
      counts[lang] = Number(row.known_count ?? 0);
    }
  }
  return counts;
}

export async function fetchKnownWordsDetails(
  userId: string,
  language = "es"
): Promise<KnownWordEntry[]> {
  const pageSize = 1000;
  const maxRows = 12000;
  const rows: any[] = [];

  for (let from = 0; from < maxRows; from += pageSize) {
    const { data, error } = await supabase.rpc("get_user_known_words_details", {
      p_user_id: userId,
      p_language: language,
      p_limit: pageSize,
      p_offset: from,
    });
    if (error || !Array.isArray(data) || data.length === 0) break;
    rows.push(...data);
    if (data.length < pageSize) break;
  }

  return rows.map((row: any) => {
    const rankings: LexicalRanking[] = row.rankings || [];
    const pronunciations = row.primary_transcription ? [{ transcriptions: [row.primary_transcription] }] : [];

    const cefrRanking =
      rankings.find((r) => (r.source === "elelex_v2020" || r.source === "flelex_v2020" || r.source === "flelex_v1") && r.cefr) ||
      rankings.find((r) => r.cefr);
    const cefr = cefrRanking?.cefr || "";

    const freqRanking = rankings.find((r) => r.source === "tubelex_v2025" || r.source === "lexique383");
    const rank = freqRanking?.rank ? Number(freqRanking.rank) : null;

    const { ipa, reading } = extractPronunciation(pronunciations);

    return {
      canonical_id: String(row.canonical_id || ""),
      language,
      status: (row.status || "known") as UserVocabStatus,
      updated_at: row.updated_at || null,
      lemma: String(row.lemma || row.canonical_id || ""),
      pos: String(row.pos || ""),
      definitions: Array.isArray(row.definitions) ? row.definitions : [],
      cefr,
      global_rank: rank,
      rankings,
      ipa,
      reading,
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
