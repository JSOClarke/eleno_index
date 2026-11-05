export interface CanonicalDefinition {
  canonical_id: string;
  source: string;
  language: string;
  definitions: string[];
  examples: string[];
  etymology?: string | null;
  version?: string | null;
}
