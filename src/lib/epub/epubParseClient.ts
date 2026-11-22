import type { ParsedBlockResult } from "@/types/epubReader.types";

const PARSER_API_BASE = "https://api.152.67.157.124.sslip.io";
const translationCache = new Map<string, string>();
const imageCache = new Map<string, WordImagePair>();

export interface WikiImageHit {
  url: string;
  source: string;
  title: string;
  page_url: string;
}

export interface WordImagePair {
  es: WikiImageHit | null;
  en: WikiImageHit | null;
}

const BLOCKED_IMG_RE =
  /(?:\.svg(?:$|\?)|disambig|question_book|ambox|commons-logo|wiki_letter|wiktionary|padlock|edit-clear|stub|symbol_)/i;

export async function parseParagraphSlice(
  texts: string[],
  language = "es",
  userId?: string | null,
  signal?: AbortSignal
): Promise<ParsedBlockResult[]> {
  const resp = await fetch(`${PARSER_API_BASE}/api/parse/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      texts,
      language: language || "es",
      include_definitions: true,
      include_monolingual: true,
      include_rankings: true,
      include_phrases: true,
      user_id: userId || null,
    }),
    signal,
  });
  if (!resp.ok) throw new Error(`Parser API error (${resp.status})`);
  const data = await resp.json();
  return Array.isArray(data?.blocks) ? data.blocks : [];
}

export async function translateSentence(sentence: string, lang = "es"): Promise<string> {
  const clean = sentence.trim();
  if (!clean) return "";
  const key = `${lang}::${clean}`;
  if (translationCache.has(key)) return translationCache.get(key)!;

  const sl = lang === "zh" ? "zh-CN" : lang;
  try {
    const r = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=en&dt=t&q=${encodeURIComponent(clean)}`
    );
    if (r.ok) {
      const data = await r.json();
      const txt = Array.isArray(data?.[0]) ? data[0].map((s: any) => s?.[0] || "").join("").trim() : "";
      if (txt) {
        translationCache.set(key, txt);
        return txt;
      }
    }
  } catch {
    // Fallback below
  }

  const mmRes = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean.slice(0, 480))}&langpair=${lang}|en`
  );
  if (mmRes.ok) {
    const mm = await mmRes.json();
    const txt = (mm?.responseData?.translatedText || "").trim();
    if (txt) {
      translationCache.set(key, txt);
      return txt;
    }
  }
  throw new Error("Could not translate sentence.");
}

async function fetchWikiSide(query: string, lang: string): Promise<WikiImageHit | null> {
  if (!query) return null;
  const host = `https://${lang}.wikipedia.org`;
  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: query,
      gsrlimit: "3",
      prop: "pageimages|info",
      inprop: "url",
      piprop: "thumbnail",
      pithumbsize: "480",
      format: "json",
      origin: "*",
      redirects: "1",
    });
    const r = await fetch(`${host}/w/api.php?${params.toString()}`);
    if (!r.ok) return null;
    const data = await r.json();
    const pages = Object.values(data?.query?.pages || {}).sort((a: any, b: any) => (a.index || 999) - (b.index || 999)) as any[];
    for (const p of pages) {
      const url = p?.thumbnail?.source;
      if (url && !BLOCKED_IMG_RE.test(url)) {
        return { url, source: `${lang}.wikipedia`, title: p.title || query, page_url: p.fullurl || host };
      }
    }
  } catch {
    // Ignore network failures
  }
  return null;
}

export async function fetchWordImages(word: string, primaryDef = "", lang = "es"): Promise<WordImagePair> {
  const enQuery = primaryDef.replace(/\([^)]*\)/g, " ").split(/[;/,]/)[0].replace(/^(?:to be|to|a|an|the)\s+/i, "").trim().slice(0, 80);
  const key = `${lang}::${word.toLowerCase()}::${enQuery.toLowerCase()}`;
  if (imageCache.has(key)) return imageCache.get(key)!;
  const [es, en] = await Promise.all([
    fetchWikiSide(word, lang === "zh" ? "zh" : lang),
    enQuery ? fetchWikiSide(enQuery, "en") : Promise.resolve(null),
  ]);
  const pair = { es, en };
  imageCache.set(key, pair);
  return pair;
}

export function speakSpanish(text: string, lang = "es", rate = 1.0): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === "fr" ? "fr-FR" : lang === "zh" ? "zh-CN" : "es-ES";
  utter.rate = rate;
  window.speechSynthesis.speak(utter);
}
