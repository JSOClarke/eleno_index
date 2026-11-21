export type NavSection = "catalogue" | "saved" | "history" | "known" | "inspector";
export type CatalogueViewMode = "cards" | "table" | "mosaic";
export type LengthBucket = "under25k" | "25to80k" | "80k+";
export type OriginFilter = "native" | "translated";
export type ProfileFilterId = "dialogue20" | "fh70" | "subj2";
export type FlowTier = "all" | "fluent" | "sweet_spot" | "challenge";

export type CatalogueSortOption =
  | "flow_desc"
  | "popularity_desc"
  | "difficulty_asc"
  | "difficulty_desc"
  | "tokens_asc"
  | "tokens_desc"
  | "readability_desc"
  | "dialogue_desc"
  | "title_asc"
  | "title_desc"
  | "newest";

export interface CommandTag {
  id: string;
  key: string;
  value: string;
}

export interface CatalogueFilterState {
  searchText: string;
  tags: CommandTag[];
  levels: Set<string>;
  types: Set<string>;
  origins: Set<OriginFilter>;
  lengths: Set<LengthBucket>;
  profiles: Set<ProfileFilterId>;
  genres: Set<string>;
  publishers: Set<string>;
  years: Set<string>;
  hasAudio: boolean;
  flowTier: FlowTier;
}
