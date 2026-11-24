export interface TranslationProvider {
  id: string;
  translate(text: string, sourceLang?: string, targetLang?: string): Promise<string>;
}

const cache = new Map<string, string>();

export const googleFreeProvider: TranslationProvider = {
  id: "google-free",
  async translate(text: string, sourceLang = "auto", targetLang = "en"): Promise<string> {
    const sl = sourceLang === "zh" ? "zh-CN" : sourceLang || "auto";
    const r = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`
    );
    if (!r.ok) throw new Error(`Translate failed (${r.status})`);
    const data = await r.json();
    const txt = Array.isArray(data?.[0]) ? data[0].map((s: any) => s?.[0] || "").join("").trim() : "";
    if (!txt) throw new Error("Empty translation");
    return txt;
  },
};

let activeProvider: TranslationProvider = googleFreeProvider;

export function setTranslationProvider(provider: TranslationProvider): void {
  activeProvider = provider;
}

export function getTranslationProvider(): TranslationProvider {
  return activeProvider;
}

/** Translate text using the active pluggable TranslationProvider (cached by provider + lang + text). */
export async function translateText(text: string, sourceLang = "auto", targetLang = "en"): Promise<string> {
  const clean = text.trim();
  if (!clean) return "";
  const key = `${activeProvider.id}::${sourceLang}::${targetLang}::${clean}`;
  if (cache.has(key)) return cache.get(key)!;
  const translated = await activeProvider.translate(clean, sourceLang, targetLang);
  cache.set(key, translated);
  return translated;
}
