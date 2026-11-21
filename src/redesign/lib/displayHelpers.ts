import type { MediaCatalogItem } from "@/types/media.types";

const CEFR_BADGES: Record<string, string> = {
  A1: "bg-slate-50/95 text-slate-600 ring-1 ring-slate-200",
  A2: "bg-slate-100/95 text-slate-700 ring-1 ring-slate-300/80",
  B1: "bg-amber-50/95 text-amber-800 ring-1 ring-amber-200/90",
  B2: "bg-amber-100/95 text-amber-900 ring-1 ring-amber-300/90",
  C1: "bg-slate-800/95 text-slate-50 ring-1 ring-slate-800",
  C2: "bg-slate-950/95 text-amber-300 ring-1 ring-slate-900",
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
