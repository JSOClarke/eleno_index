export type NavSection = "catalogue" | "saved" | "history" | "known" | "inspector";
export type CatalogueViewMode = "cards" | "table";
export type LengthBucket = "under25k" | "25to80k" | "80k+";
export type ProfileFilterId = "dialogue20" | "fh70" | "subj2";

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
  lengths: Set<LengthBucket>;
  profiles: Set<ProfileFilterId>;
}
