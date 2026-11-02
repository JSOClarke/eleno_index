import { supabase } from "@/lib/supabase";
import type { UserVocabStatus } from "@/types/vocabulary.types";

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
