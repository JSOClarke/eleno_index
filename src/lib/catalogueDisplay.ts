import type { MediaCatalogItem, MediaPlatformLink } from "@/types/media.types";

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

const isSafeHttpUrl = (url: unknown): url is string =>
  typeof url === "string" && /^https?:\/\//i.test(url.trim());

function buildSearchTerm(item: MediaCatalogItem): string {
  const title = (item.title || item.work_title || "").trim();
  const creator = (item.creator || "").trim();
  const skipCreator = !creator || /^unknown/i.test(creator);
  return encodeURIComponent(skipCreator ? title : `${title} ${creator}`);
}

function searchUrlForProvider(provider: string, item: MediaCatalogItem): string {
  const q = buildSearchTerm(item);
  const titleQ = encodeURIComponent((item.title || item.work_title || "").trim());
  const isbn = item.external_ids?.isbn ? encodeURIComponent(String(item.external_ids.isbn)) : null;
  const key = provider.toLowerCase();

  if (key.includes("kindle") || key.includes("amazon")) {
    return `https://www.amazon.com/s?k=${isbn || q}&i=digital-text`;
  }
  if (key.includes("apple books")) return `https://books.apple.com/us/search?term=${q}`;
  if (key.includes("audible")) return `https://www.audible.com/search?keywords=${q}`;
  if (key.includes("netflix")) return `https://www.netflix.com/search?q=${titleQ}`;
  if (key.includes("justwatch") || key.includes("stream")) {
    return `https://www.justwatch.com/us/search?q=${titleQ}`;
  }
  if (key.includes("spotify")) return `https://open.spotify.com/search/${titleQ}`;
  if (key.includes("apple podcasts")) return `https://podcasts.apple.com/search?term=${titleQ}`;
  return `https://www.google.com/search?q=${q}`;
}

/**
 * Resolve outbound store/streaming links in 3 tiers:
 * 1) verified `metadata.links` objects (from backend enrichment or admin edits),
 * 2) deterministic `external_ids` deep links (TMDB, ISBN/OpenLibrary, Audible, Spotify, source URL),
 * 3) title/creator search links by media type so every badge is actionable.
 */
export function getPlatformLinks(item: MediaCatalogItem): {
  label: string;
  links: MediaPlatformLink[];
} {
  const isScreen = item.type === "movie" || item.type === "tv_show" || item.type === "tv_episode";
  const isAudioOnly = item.type === "podcast";
  const label = isScreen ? "Watch on:" : isAudioOnly ? "Listen on:" : "Get on:";

  const verified = item.metadata?.links;
  if (Array.isArray(verified)) {
    const valid = verified
      .filter((l: any) => l && typeof l.label === "string" && isSafeHttpUrl(l.url))
      .slice(0, 3) as MediaPlatformLink[];
    if (valid.length > 0) return { label, links: valid };
  }

  const customNames = item.metadata?.platforms;
  if (Array.isArray(customNames) && customNames.length > 0) {
    return {
      label,
      links: customNames.slice(0, 3).map((name: string) => ({
        label: String(name),
        url: searchUrlForProvider(String(name), item),
      })),
    };
  }

  const ext = item.external_ids || {};
  if (isSafeHttpUrl(ext.source_url)) {
    return { label: "Source:", links: [{ label: "Original Source", url: ext.source_url, kind: "read" }] };
  }

  if (isScreen) {
    const tmdbType = item.type === "movie" ? "movie" : "tv";
    const watchUrl = ext.tmdb_id
      ? `https://www.themoviedb.org/${tmdbType}/${ext.tmdb_id}/watch`
      : searchUrlForProvider("justwatch", item);
    return {
      label,
      links: [
        { provider: "justwatch", label: ext.tmdb_id ? "Where to Watch" : "JustWatch", url: watchUrl, kind: "stream" },
        { provider: "netflix", label: "Netflix", url: searchUrlForProvider("netflix", item), kind: "stream" },
      ],
    };
  }

  if (isAudioOnly) {
    return {
      label,
      links: [
        { provider: "apple_podcasts", label: "Apple Podcasts", url: searchUrlForProvider("apple podcasts", item), kind: "listen" },
        { provider: "spotify", label: "Spotify", url: searchUrlForProvider("spotify", item), kind: "listen" },
      ],
    };
  }

  const links: MediaPlatformLink[] = [
    { provider: "kindle", label: "Kindle", url: searchUrlForProvider("kindle", item), kind: "buy" },
  ];
  if (item.has_audio) {
    links.push({ provider: "audible", label: "Audible", url: searchUrlForProvider("audible", item), kind: "listen" });
  } else {
    links.push({ provider: "apple_books", label: "Apple Books", url: searchUrlForProvider("apple books", item), kind: "buy" });
  }
  if (ext.isbn) {
    links.push({ provider: "openlibrary", label: "Open Library", url: `https://openlibrary.org/isbn/${encodeURIComponent(String(ext.isbn))}`, kind: "info" });
  } else if (ext.open_library_work_id) {
    links.push({ provider: "openlibrary", label: "Open Library", url: `https://openlibrary.org/works/${encodeURIComponent(String(ext.open_library_work_id))}`, kind: "info" });
  }
  return { label, links };
}
