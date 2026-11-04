import type { ImageProvider, WordImage } from "@/types/image.types";
import { fetchJson } from "./imageProviderUtils";
import { getImageProviderKey } from "./userImageKeys";

export const pixabayProvider: ImageProvider = {
  id: "pixabay",
  label: "Pixabay",
  isAvailable: () => getImageProviderKey("pixabay").length > 0,
  async search(query, signal) {
    const key = getImageProviderKey("pixabay");
    if (!key) return [];

    const params = new URLSearchParams({
      key,
      q: query,
      image_type: "photo",
      per_page: "8",
      safesearch: "true",
      lang: "es",
      orientation: "horizontal",
    });
    const data = await fetchJson(
      `https://pixabay.com/api/?${params.toString()}`,
      signal
    );

    return (data?.hits || []).flatMap((hit: any, index: number): WordImage[] => {
      const thumbnailUrl = hit?.webformatURL || hit?.previewURL;
      if (!thumbnailUrl) return [];
      return [
        {
          id: `pixabay-${hit?.id ?? index}`,
          provider: "Pixabay",
          thumbnailUrl,
          imageUrl: hit?.largeImageURL || thumbnailUrl,
          sourceUrl: hit?.pageURL || "https://pixabay.com/",
          title: String(hit?.tags || query),
          author: hit?.user ? String(hit.user) : null,
          width: Number(hit?.webformatWidth) || null,
          height: Number(hit?.webformatHeight) || null,
        },
      ];
    });
  },
};
