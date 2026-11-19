export interface WikiImageHit {
  url: string;
  source: string;
  title: string;
  page_url: string;
  query: string;
}

export interface WikiImagePair {
  word: string;
  en_query: string;
  es: WikiImageHit | null;
  en: WikiImageHit | null;
}

const BLOCKED_IMG_RE =
  /(?:\.svg(?:$|\?)|disambig|question_book|ambox|commons-logo|wiki_letter|wiktionary|padlock|edit-clear|stub|symbol_)/i;
const SKIP_EN = new Set([
  "", "of", "the", "a", "an", "to", "in", "at", "on", "and", "or", "but", "not",
  "no", "yes", "is", "are", "was", "were", "be", "have", "has", "do", "does",
]);
const imageCache = new Map<string, WikiImagePair>();

export function cleanEnglishQuery(rawEn = ""): string {
  const cleaned = rawEn
    .trim()
    .replace(/\([^)]*\)/g, " ")
    .split(/[;/,]/)[0]
    .replace(/^(?:to be|to|a|an|the)\s+/i, "")
    .replace(/\s+/g, " ")
    .replace(/^[\s.,:-]+|[\s.,:-]+$/g, "");
  if (cleaned.length < 2 || SKIP_EN.has(cleaned.toLowerCase())) return "";
  return cleaned.slice(0, 80);
}

async function fetchWikipediaSide(query: string, lang: string): Promise<WikiImageHit | null> {
  if (!query) return null;
  const host = `https://${lang}.wikipedia.org`;
  try {
    const params = new URLSearchParams({
      action: "query", generator: "search", gsrsearch: query, gsrlimit: "3",
      prop: "pageimages|info", inprop: "url", piprop: "thumbnail", pithumbsize: "480",
      format: "json", origin: "*", redirects: "1",
    });
    const res = await fetch(`${host}/w/api.php?${params.toString()}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {}).sort((a: any, b: any) => (a.index || 999) - (b.index || 999)) as any[];
    for (const p of pages) {
      const url = p?.thumbnail?.source;
      if (url && !BLOCKED_IMG_RE.test(url)) {
        return { url, source: `${lang}.wikipedia`, title: p.title || query, page_url: p.fullurl || `${host}/wiki/${encodeURIComponent(p.title || query)}`, query };
      }
    }
  } catch { /* ignore */ }
  return null;
}

export async function fetchWordImagesPair(word: string, primaryDef = "", lang = "es"): Promise<WikiImagePair | null> {
  const cleanWord = word.trim();
  if (!cleanWord) return null;
  const enQuery = cleanEnglishQuery(primaryDef);
  const key = `${lang}::${cleanWord.toLowerCase()}::${enQuery.toLowerCase()}`;
  if (imageCache.has(key)) return imageCache.get(key)!;
  const [es, en] = await Promise.all([
    fetchWikipediaSide(cleanWord, lang === "zh" ? "zh" : "es"),
    enQuery ? fetchWikipediaSide(enQuery, "en") : Promise.resolve(null),
  ]);
  const payload = { word: cleanWord, en_query: enQuery, es, en };
  imageCache.set(key, payload);
  return payload;
}
