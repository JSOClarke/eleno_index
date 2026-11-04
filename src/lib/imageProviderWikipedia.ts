import type { ImageProvider, WordImage } from "@/types/image.types";
import { fetchJson } from "./imageProviderUtils";

export const wikipediaProvider: ImageProvider = {
  id: "wikipedia",
  label: "Wikipedia",
  isAvailable: () => true,
  async search(query, signal) {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: query,
      gsrlimit: "4",
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: "800",
      format: "json",
      origin: "*",
      redirects: "1",
    });
    const data = await fetchJson(
      `https://es.wikipedia.org/w/api.php?${params.toString()}`,
      signal
    );
    const pages = Object.values(data?.query?.pages || {}) as any[];

    return pages.flatMap((page): WordImage[] => {
      const url = page?.thumbnail?.source;
      const title = String(page?.title || "").replace(/_/g, " ");
      if (!url || !title) return [];
      return [
        {
          id: `wikipedia-${title}`,
          provider: "Wikipedia",
          thumbnailUrl: url,
          imageUrl: url,
          sourceUrl: `https://es.wikipedia.org/wiki/${encodeURIComponent(
            title.replace(/ /g, "_")
          )}`,
          title,
          width: page?.thumbnail?.width ?? null,
          height: page?.thumbnail?.height ?? null,
        },
      ];
    });
  },
};
