import { supabase } from "@/lib/supabase";
import type {
  VocabularyPack,
  VocabularyPackApplication,
  VocabularyPackApplyResult,
  VocabularyPackPreview,
  VocabularyPackSample,
} from "@/types/vocabularyPack.types";

function toPack(row: any): VocabularyPack {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description || ""),
    group_label: String(row.group_label || "OTHER"),
    rule_type: String(row.rule_type),
    rule_params: row.rule_params || {},
    sort_order: Number(row.sort_order || 0),
    is_active: Boolean(row.is_active),
  };
}

function toSample(row: any): VocabularyPackSample {
  return {
    canonical_id: String(row.canonical_id),
    lemma: String(row.lemma || ""),
    pos: String(row.pos || ""),
    cefr: row.cefr ? String(row.cefr) : null,
    status: row.status || null,
  };
}

function toPreview(row: any): VocabularyPackPreview {
  return {
    pack_id: String(row.pack_id),
    total_count: Number(row.total_count || 0),
    known_count: Number(row.known_count || 0),
    learning_count: Number(row.learning_count || 0),
    ignored_count: Number(row.ignored_count || 0),
    new_count: Number(row.new_count || 0),
    sample: Array.isArray(row.sample) ? row.sample.map(toSample) : [],
  };
}

export async function fetchVocabularyPacks(): Promise<VocabularyPack[]> {
  const { data, error } = await supabase
    .from("vocabulary_pack")
    .select("*")
    .eq("is_active", true)
    .order("group_label")
    .order("sort_order");

  if (error || !data) return [];
  return data.map(toPack);
}

export async function previewVocabularyPack(
  userId: string,
  packId: string
): Promise<VocabularyPackPreview | null> {
  const { data, error } = await supabase.rpc("preview_vocabulary_pack", {
    p_user_id: userId,
    p_pack_id: packId,
  });

  if (error || !data) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? toPreview(row) : null;
}

export async function applyVocabularyPack(
  userId: string,
  packId: string,
  preserveLearning = true,
  preserveIgnored = true
): Promise<VocabularyPackApplyResult> {
  const { data, error } = await supabase.rpc("apply_vocabulary_pack", {
    p_user_id: userId,
    p_pack_id: packId,
    p_status: "known",
    p_preserve_learning: preserveLearning,
    p_preserve_ignored: preserveIgnored,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    application_id: row?.application_id ? String(row.application_id) : null,
    changed_count: Number(row?.changed_count || 0),
    total_count: Number(row?.total_count || 0),
    skipped_count: Number(row?.skipped_count || 0),
  };
}

export async function undoVocabularyPack(
  userId: string,
  applicationId: string
): Promise<number> {
  const { data, error } = await supabase.rpc("undo_vocabulary_pack", {
    p_user_id: userId,
    p_application_id: applicationId,
  });

  if (error) throw error;
  return Number(data || 0);
}

function toApplication(row: any): VocabularyPackApplication {
  return {
    id: String(row.id),
    pack_id: row.pack_id ? String(row.pack_id) : null,
    pack_slug: String(row.pack_slug),
    applied_status: row.applied_status === "learning" ? "learning" : "known",
    changed_count: Number(row.changed_count || 0),
    created_at: String(row.created_at),
    undone_at: row.undone_at || null,
  };
}

export async function fetchPackApplications(
  userId: string
): Promise<VocabularyPackApplication[]> {
  const { data, error } = await supabase
    .from("user_vocabulary_pack_application")
    .select("id, pack_id, pack_slug, applied_status, changed_count, created_at, undone_at")
    .eq("user_id", userId)
    .is("undone_at", null)
    .order("created_at", { ascending: false })
    .range(0, 499);

  if (error || !data) return [];
  return data.map(toApplication);
}

export async function fetchLatestPackApplication(
  userId: string
): Promise<VocabularyPackApplication | null> {
  const applications = await fetchPackApplications(userId);
  return applications[0] || null;
}
