import type { ImageProvider, WordImage } from "@/types/image.types";
import { normalizeQuery } from "./imageProviderUtils";
import { pixabayProvider } from "./imageProviderPixabay";
import { wikipediaProvider } from "./imageProviderWikipedia";

const cache = new Map<string, WordImage[]>();
const providers: ImageProvider[] = [wikipediaProvider, pixabayProvider];

/** Register an additional image source without touching the drawer UI. */
export function registerImageProvider(provider: ImageProvider) {
  if (!providers.some((existing) => existing.id === provider.id)) {
    providers.push(provider);
  }
}

export function getImageProviders(): ImageProvider[] {
  return providers.filter((provider) => provider.isAvailable());
}

export function clearImageCache(): void {
  cache.clear();
}

export async function searchWordImages(
  query: string,
  signal?: AbortSignal
): Promise<WordImage[]> {
  const cleaned = normalizeQuery(query);
  if (!cleaned) return [];

  const enabled = getImageProviders();
  if (enabled.length === 0) return [];

  const cacheKey = `${cleaned}|${enabled.map((provider) => provider.id).join(",")}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const settled = await Promise.allSettled(
    enabled.map((provider) => provider.search(cleaned, signal))
  );
  if (signal?.aborted) return [];

  const seen = new Set<string>();
  const images: WordImage[] = [];
  let anySucceeded = false;

  for (const result of settled) {
    if (result.status !== "fulfilled") {
      console.warn("[images] Provider failed:", result.reason);
      continue;
    }
    anySucceeded = true;
    for (const image of result.value) {
      if (seen.has(image.imageUrl)) continue;
      seen.add(image.imageUrl);
      images.push(image);
    }
  }

  if (!anySucceeded) throw new Error("No image provider responded");
  const limited = images.slice(0, 12);
  if (limited.length > 0) cache.set(cacheKey, limited);
  return limited;
}
