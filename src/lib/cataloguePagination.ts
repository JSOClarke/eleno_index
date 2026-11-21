import type { CatalogueFilterState } from "@/types/filter.types";

export function parsePageParam(raw: string | null): number {
  if (!raw) return 1;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

export function buildPageSearchParams(prev: URLSearchParams, nextPage: number): URLSearchParams {
  const next = new URLSearchParams(prev);
  const safe = Number.isFinite(nextPage) && nextPage > 1 ? Math.floor(nextPage) : 1;
  if (safe === 1) next.delete("page");
  else next.set("page", String(safe));
  return next;
}

export function buildFilterSignature(
  mode: string,
  sortOption: string,
  f: CatalogueFilterState
): string {
  return `${mode}|${sortOption}|${f.searchText}|${f.tags.map((x) => `${x.key}:${x.value}`).join(",")}|${[...f.levels].join(",")}|${[...f.types].join(",")}|${[...f.origins].join(",")}|${[...f.lengths].join(",")}|${[...f.profiles].join(",")}|${[...f.genres].join(",")}|${[...f.publishers].join(",")}|${[...f.years].join(",")}|${f.hasAudio}|${f.flowTier}`;
}
