import { getLengthBucket, getMediaCategoryLabel, toPercentNumber } from "@/lib/formatters";
import { normalizeLevelBucket } from "@/lib/proficiencyScale";
import type { CatalogueFilterState, FlowTier, OriginFilter } from "@/types/filter.types";
import type { MediaCatalogItem } from "@/types/media.types";

export function isNativeWork(item: MediaCatalogItem): boolean {
  return Boolean(item.work_language && item.work_language.toLowerCase() === item.language.toLowerCase());
}

export function matchesFlowTier(coverage: number, tier: FlowTier): boolean {
  if (tier === "fluent") return coverage >= 95;
  if (tier === "sweet_spot") return coverage >= 85 && coverage < 95;
  if (tier === "challenge") return coverage < 85;
  return true;
}

export function getDecade(year: number | null | undefined): string {
  if (year == null || year < 1800 || year > 2100) return "Unknown";
  return `${Math.floor(year / 10) * 10}s`;
}

export function matchesCatalogueFilters(
  item: MediaCatalogItem,
  filters: CatalogueFilterState,
  savedIds: Set<string>,
  historyIds: Set<string>,
  activeNav: string
): boolean {
  if (activeNav === "saved" && !savedIds.has(item.id)) return false;
  if (activeNav === "history" && !historyIds.has(item.id)) return false;

  const m = item.metrics;
  const cefr = normalizeLevelBucket(m?.cefr_level);
  if (filters.levels.size > 0 && !filters.levels.has(cefr)) return false;

  const cat = getMediaCategoryLabel(item);
  if (filters.types.size > 0 && !filters.types.has(cat)) return false;

  if (filters.origins.size > 0) {
    const origin: OriginFilter = isNativeWork(item) ? "native" : "translated";
    if (!filters.origins.has(origin)) return false;
  }

  const bucket = getLengthBucket(m?.total_tokens || 0);
  if (filters.lengths.size > 0 && !filters.lengths.has(bucket)) return false;

  if (filters.profiles.has("dialogue20") && toPercentNumber(m?.dialogue_ratio) < 20) {
    return false;
  }
  if (filters.profiles.has("fh70") && (m?.readability_score || 0) < 70) {
    return false;
  }
  if (
    filters.profiles.has("subj2") &&
    toPercentNumber(m?.verb_profile?.subjunctive_load) < 5
  ) {
    return false;
  }

  if (filters.genres.size > 0) {
    const itemGenres = new Set((item.genres || []).map((g) => g.toLowerCase()));
    const hasGenre = Array.from(filters.genres).some((g) => itemGenres.has(g.toLowerCase()));
    if (!hasGenre) return false;
  }

  if (filters.publishers.size > 0) {
    const pub = (item.metadata?.publisher as string | undefined) || "";
    if (!pub || !filters.publishers.has(pub)) return false;
  }

  if (filters.years.size > 0 && !filters.years.has(getDecade(item.release_year))) {
    return false;
  }

  if (filters.hasAudio && !item.has_audio) {
    return false;
  }

  if (filters.flowTier && filters.flowTier !== "all") {
    const coverage = item.comprehension?.text_coverage_percentage ?? 0;
    if (!matchesFlowTier(coverage, filters.flowTier)) return false;
  }

  if (filters.searchText.trim()) {
    const q = filters.searchText.toLowerCase();
    const matchTitle =
      item.title.toLowerCase().includes(q) ||
      (item.work_title || "").toLowerCase().includes(q) ||
      (item.editions || []).some((ed) => ed.title.toLowerCase().includes(q));
    const matchCreator = item.creator.toLowerCase().includes(q);
    const sName = item.series?.name || item.series_name || "";
    const matchSeries = sName.toLowerCase().includes(q);
    const matchWord = item.previewWords.some((w) => w.lemma.toLowerCase().includes(q));
    if (!matchTitle && !matchCreator && !matchSeries && !matchWord) return false;
  }

  return true;
}

function cloneFilters(f: CatalogueFilterState): CatalogueFilterState {
  return {
    searchText: f.searchText,
    tags: f.tags,
    levels: new Set(f.levels),
    types: new Set(f.types),
    origins: new Set(f.origins),
    lengths: new Set(f.lengths),
    profiles: new Set(f.profiles),
    genres: new Set(f.genres),
    publishers: new Set(f.publishers),
    years: new Set(f.years),
    hasAudio: f.hasAudio,
    flowTier: f.flowTier,
  };
}

function scopedItems(
  items: MediaCatalogItem[],
  filters: CatalogueFilterState,
  savedIds: Set<string>,
  historyIds: Set<string>,
  activeNav: string,
  clearSelf: (f: CatalogueFilterState) => void
): MediaCatalogItem[] {
  const scoped = cloneFilters(filters);
  clearSelf(scoped);
  return items.filter((item) =>
    matchesCatalogueFilters(item, scoped, savedIds, historyIds, activeNav)
  );
}

export function calculateFacetCounts(
  items: MediaCatalogItem[],
  filters: CatalogueFilterState,
  savedIds: Set<string>,
  historyIds: Set<string>,
  activeNav: string
) {
  const levels: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  const types: Record<string, number> = { "Book / Reader": 0, "Film / Subtitles": 0 };
  const origins: Record<OriginFilter, number> = { native: 0, translated: 0 };
  const lengths: Record<string, number> = { under25k: 0, "25to80k": 0, "80k+": 0 };
  const profiles: Record<string, number> = { dialogue20: 0, fh70: 0, subj2: 0 };
  const genres: Record<string, number> = {};
  const publishers: Record<string, number> = {};
  const years: Record<string, number> = {};
  let audio = 0;
  const flow: Record<FlowTier, number> = { all: 0, fluent: 0, sweet_spot: 0, challenge: 0 };

  // Seed the full taxonomy universe so zero-count options stay visible (greyed).
  for (const item of items) {
    for (const g of item.genres || []) {
      if (g && genres[g] === undefined) genres[g] = 0;
    }
    const pub = (item.metadata?.publisher as string | undefined) || "";
    if (pub && publishers[pub] === undefined) publishers[pub] = 0;
    const decade = getDecade(item.release_year);
    if (years[decade] === undefined) years[decade] = 0;
  }

  const scope = (clearSelf: (f: CatalogueFilterState) => void) =>
    scopedItems(items, filters, savedIds, historyIds, activeNav, clearSelf);

  for (const item of scope((f) => { f.levels = new Set(); })) {
    const cefr = normalizeLevelBucket(item.metrics?.cefr_level);
    if (levels[cefr] !== undefined) levels[cefr] += 1;
  }

  for (const item of scope((f) => { f.types = new Set(); })) {
    const cat = getMediaCategoryLabel(item);
    if (types[cat] !== undefined) types[cat] += 1;
  }

  for (const item of scope((f) => { f.origins = new Set(); })) {
    const origin: OriginFilter = isNativeWork(item) ? "native" : "translated";
    origins[origin] += 1;
  }

  for (const item of scope((f) => { f.lengths = new Set(); })) {
    const bucket = getLengthBucket(item.metrics?.total_tokens || 0);
    lengths[bucket] = (lengths[bucket] || 0) + 1;
  }

  for (const item of scope((f) => { f.profiles = new Set(); })) {
    const m = item.metrics;
    if (toPercentNumber(m?.dialogue_ratio) >= 20) profiles.dialogue20 += 1;
    if ((m?.readability_score || 0) >= 70) profiles.fh70 += 1;
    if (toPercentNumber(m?.verb_profile?.subjunctive_load) >= 5) profiles.subj2 += 1;
  }

  for (const item of scope((f) => { f.genres = new Set(); })) {
    for (const g of item.genres || []) {
      if (g) genres[g] = (genres[g] || 0) + 1;
    }
  }

  for (const item of scope((f) => { f.publishers = new Set(); })) {
    const pub = (item.metadata?.publisher as string | undefined) || "";
    if (pub) publishers[pub] = (publishers[pub] || 0) + 1;
  }

  for (const item of scope((f) => { f.years = new Set(); })) {
    const decade = getDecade(item.release_year);
    years[decade] = (years[decade] || 0) + 1;
  }

  for (const item of scope((f) => { f.hasAudio = false; })) {
    if (item.has_audio) audio += 1;
  }

  const flowScoped = scope((f) => { f.flowTier = "all"; });
  flow.all = flowScoped.length;
  for (const item of flowScoped) {
    const coverage = item.comprehension?.text_coverage_percentage ?? 0;
    if (coverage >= 95) flow.fluent += 1;
    else if (coverage >= 85) flow.sweet_spot += 1;
    else flow.challenge += 1;
  }

  return { levels, types, origins, lengths, profiles, genres, publishers, years, audio, flow };
}
