import { supabase } from "@/lib/supabase";
import type { CanonicalDefinition } from "@/types/canonicalDefinition.types";

const SPANISH_SOURCE = "wty_es_es";

function toDefinition(row: any): CanonicalDefinition {
  return {
    canonical_id: String(row.canonical_id),
    source: String(row.source),
    language: String(row.language || "es"),
    definitions: Array.isArray(row.definitions)
      ? row.definitions.map(String)
      : [],
    examples: Array.isArray(row.examples) ? row.examples.map(String) : [],
    etymology: row.etymology ? String(row.etymology) : null,
    version: row.version ? String(row.version) : null,
  };
}

export async function fetchSpanishDefinition(
  canonicalId: string
): Promise<CanonicalDefinition | null> {
  const { data, error } = await supabase
    .from("canonical_definition")
    .select("canonical_id, source, language, definitions, examples, etymology, version")
    .eq("canonical_id", canonicalId)
    .eq("source", SPANISH_SOURCE)
    .maybeSingle();

  if (error || !data) return null;
  return toDefinition(data);
}
