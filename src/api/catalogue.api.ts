import { supabase } from "@/lib/supabase";
import type {
  MediaComprehensionStats,
  PreviewWordItem,
} from "@/types/media.types";
import { normalizeMediaComprehension } from "./normalizers";

export async function fetchPreviewWordsBatch(
  userId?: string | null
): Promise<Record<string, PreviewWordItem[]>> {
  const lookup: Record<string, PreviewWordItem[]> = {};

  const { data: rpcData, error: rpcErr } = await supabase.rpc(
    "get_user_media_preview_words",
    { p_user_id: userId || null, p_limit_per_item: 8 }
  );

  if (!rpcErr && rpcData) {
    for (const row of rpcData) {
      if (row.pos === "PROPN") continue;
      const mId = String(row.media_item_id);
      if (!lookup[mId]) lookup[mId] = [];
      lookup[mId].push({
        canonical_id: String(row.canonical_id),
        lemma: String(row.lemma),
        pos: String(row.pos || "NOUN"),
        frequency: Number(row.frequency || 1),
        cefr: "B1",
        rank: null,
        sentence: row.first_context_snippet || null,
      });
    }
  }
  return lookup;
}

export async function fetchMediaComprehensionMap(
  userId?: string | null
): Promise<Record<string, MediaComprehensionStats>> {
  if (!userId) return {};
  const { data, error } = await supabase.rpc("get_user_media_comprehension", {
    p_user_id: userId,
  });
  if (error || !data) return {};

  const map: Record<string, MediaComprehensionStats> = {};
  for (const row of data) {
    const parsed = normalizeMediaComprehension(row);
    map[parsed.media_item_id] = parsed;
  }
  return map;
}

export async function fetchCatalogueEnrichment(userId?: string | null) {
  const [compMap, previewLookup] = await Promise.all([
    fetchMediaComprehensionMap(userId),
    fetchPreviewWordsBatch(userId),
  ]);
  return { compMap, previewLookup };
}
