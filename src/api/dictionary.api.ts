import { supabase } from "@/lib/supabase";
import type { DictionarySentence, DictionaryWord } from "@/types/dictionary.types";
import type { SentenceToken } from "@/types/sentence.types";

const searchCache = new Map<string, DictionaryWord[]>();
const sentenceCache = new Map<string, DictionarySentence[]>();

function extractPronunciations(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) out.push(item.trim());
    else if (item && typeof item === "object") {
      const ipa = (item as any).ipa || (item as any).text || (item as any).pinyin;
      if (typeof ipa === "string" && ipa.trim()) out.push(ipa.trim());
    }
  }
  return Array.from(new Set(out)).slice(0, 3);
}

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

export async function searchDictionaryWords(
  language: string,
  query: string,
  limit = 25
): Promise<DictionaryWord[]> {
  const clean = query.trim().toLowerCase();
  const key = `${language}|${clean}|${limit}`;
  const cached = searchCache.get(key);
  if (cached) return cached;

  const { data, error } = await supabase.rpc("search_dictionary_words", {
    p_language: language,
    p_query: clean,
    p_limit: limit,
  });
  if (error) {
    console.error("[dictionary.api] search_dictionary_words error:", error);
    return [];
  }

  const parsed: DictionaryWord[] = (data || []).map((row: any) => ({
    id: String(row.id),
    language: String(row.language || language),
    lemma: String(row.lemma || ""),
    pos: String(row.pos || ""),
    definitions: Array.isArray(row.definitions) ? row.definitions.map(String) : [],
    freq_rank: row.freq_rank !== null && row.freq_rank !== undefined ? Number(row.freq_rank) : null,
    cefr: row.cefr ? String(row.cefr) : null,
    pronunciations: extractPronunciations(row.pronunciations),
  }));
  searchCache.set(key, parsed);
  return parsed;
}

export async function fetchWordSentencesFast(opts: {
  canonicalId: string;
  userId?: string | null;
  iPlusOne?: boolean;
  mediaItemId?: string | null;
  offset?: number;
  limit?: number;
}): Promise<DictionarySentence[]> {
  const offset = opts.offset ?? 0;
  const limit = opts.limit ?? 20;
  const iPlusOne = Boolean(opts.iPlusOne && opts.userId);
  const key = `${opts.canonicalId}|${opts.userId || "anon"}|${iPlusOne ? 1 : 0}|${opts.mediaItemId || ""}|${offset}|${limit}`;
  const cached = sentenceCache.get(key);
  if (cached) return cached;

  const { data, error } = await supabase.rpc("get_word_sentences_fast", {
    p_canonical_id: opts.canonicalId,
    p_user_id: opts.userId ?? null,
    p_i_plus_one: iPlusOne,
    p_media_item_id: opts.mediaItemId ?? null,
    p_offset: offset,
    p_limit: limit,
  });
  if (error) {
    console.error("[dictionary.api] get_word_sentences_fast error:", error);
    return [];
  }

  const parsed: DictionarySentence[] = (data || []).map((row: any) => ({
    id: String(row.id),
    media_item_id: String(row.media_item_id),
    media_title: String(row.media_title || ""),
    media_creator: String(row.media_creator || ""),
    sentence: String(row.sentence || ""),
    token_count: Number(row.token_count || 0),
    source_context: String(row.source_context || ""),
    canonical_ids: Array.isArray(row.canonical_ids) ? row.canonical_ids.map(String) : [],
    tokens: Array.isArray(row.tokens) ? row.tokens.map(toToken).filter((t: SentenceToken) => t.surface.length > 0) : [],
    unknown_count: row.unknown_count !== null && row.unknown_count !== undefined ? Number(row.unknown_count) : undefined,
  }));
  sentenceCache.set(key, parsed);
  return parsed;
}
