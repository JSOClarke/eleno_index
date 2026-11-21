import type { MediaCatalogItem } from "@/types/media.types";
export { CEFR_BADGES, getCefrBadgeClass } from "@/lib/catalogueDisplay";

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
