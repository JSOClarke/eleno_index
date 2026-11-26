const BASE_URL = import.meta.env.VITE_ADMIN_API_URL || "http://127.0.0.1:8000";

export interface ParsedTokenCanonical {
  id: string;
  lemma: string;
  pos: string;
  cefr: string | null;
  level?: string | null;
  level_bucket?: string | null;
  rank?: number | null;
  rank_source?: string | null;
  global_frequency?: number | null;
  rankings?: Array<{ source: string; label: string; rank: number | null; count?: number | null; level?: string | null }>;
  tubelex_rank: number | null;
  elelex_rank: number | null;
  definitions: string[];
  ipa: string | null;
  reading?: string | null;
}

export interface ParsedToken {
  surface: string;
  start: number;
  end: number;
  pos: string;
  lemma: string | null;
  morph: string | null;
  is_punct: boolean;
  is_proper_noun: boolean;
  canonical: ParsedTokenCanonical | null;
  phrase_ids: string[];
  user_status: "known" | "learning" | "unknown" | null;
}

export interface ParseResponse {
  text: string;
  language: string;
  stats: Record<string, number>;
  tokens: ParsedToken[];
  phrases: Array<{
    phrase: string;
    canonical_phrase: string;
    type: string;
    gloss: string | null;
    char_start: number;
    char_end: number;
  }>;
}

export async function parseTextSnippet(params: {
  text: string;
  language?: string;
  userId?: string | null;
}): Promise<ParseResponse> {
  const res = await fetch(`${BASE_URL}/api/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: params.text,
      language: params.language || "es",
      include_definitions: true,
      include_rankings: true,
      include_phrases: true,
      preserve_offsets: true,
      user_id: params.userId || null,
    }),
  });
  if (!res.ok) {
    throw new Error(`Parse API failed (${res.status})`);
  }
  return res.json();
}
