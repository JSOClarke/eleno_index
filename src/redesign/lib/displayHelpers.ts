import type { MediaCatalogItem } from "@/types/media.types";

const CEFR_BADGES: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80",
  A2: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80",
  B1: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/80",
  B2: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",
  C1: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/80",
  C2: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/80",
};

export function getCefrBadgeClass(level: string): string {
  return CEFR_BADGES[level.toUpperCase()] || CEFR_BADGES.B1;
}

export function getPlatformLinks(item: MediaCatalogItem): {
  label: string;
  platforms: string[];
} {
  const custom = item.metadata?.platforms;
  if (Array.isArray(custom) && custom.length > 0) {
    const isScreen =
      item.type === "movie" || item.type === "tv_show" || item.type === "tv_episode";
    return {
      label: isScreen ? "Watch on:" : "Get on:",
      platforms: custom.slice(0, 3),
    };
  }
  if (item.type === "movie" || item.type === "tv_show" || item.type === "tv_episode") {
    return { label: "Watch on:", platforms: ["Netflix", "Streaming"] };
  }
  if (item.has_audio) {
    return { label: "Get on:", platforms: ["Kindle", "Audible"] };
  }
  return { label: "Get on:", platforms: ["Kindle", "Apple Books"] };
}
