import type { MediaChapterMetrics } from "@/types/media.types";

function makeChapter(
  mediaId: string,
  idx: number,
  title: string,
  tokens: number,
  unique: number,
  cefr: string,
  readability: number,
  dialoguePct: number,
  flowPct: number,
  learnPct: number,
  newWords: number,
  knownNew: number
): MediaChapterMetrics {
  const knownTokens = Math.round((tokens * flowPct) / 100);
  const learnTokens = Math.round((tokens * learnPct) / 100);
  const knownWords = Math.round((unique * Math.max(60, flowPct - 12)) / 100);
  const learnWords = Math.round((unique * learnPct) / 100);

  return {
    id: `${mediaId}-ch-${idx}`,
    media_item_id: mediaId,
    chapter_index: idx,
    chapter_title: title,
    total_tokens: tokens,
    content_tokens: Math.round(tokens * 0.58),
    trackable_tokens: Math.round(tokens * 0.85),
    unique_words_count: unique,
    cefr_level: cefr,
    readability_score: readability,
    dialogue_ratio: dialoguePct / 100,
    user_comprehension: {
      chapter_index: idx,
      chapter_title: title,
      total_words: unique,
      known_words: knownWords,
      learning_words: learnWords,
      chapter_comprehension_percentage: Math.round(flowPct - 12),
      learning_percentage: learnPct,
      total_tokens: tokens,
      known_tokens: knownTokens,
      learning_tokens: learnTokens,
      text_coverage_percentage: flowPct,
      learning_text_coverage_percentage: learnPct,
      new_words_count: newWords,
      known_new_words: knownNew,
    },
  };
}

const RED_RISING_ID = "942f8b2c-8888-40e4-ac07-340209a23d67";
const HUNGER_ID = "7e6850f0-c7f3-4e4d-b885-d5e9ccbc7e95";
const ELITE_ID = "mock-elite-s01";

export const MOCK_CHAPTER_METRICS: Record<string, MediaChapterMetrics[]> = {
  [RED_RISING_ID]: [
    makeChapter(RED_RISING_ID, 1, "Prólogo", 374, 145, "A2", 80.0, 10.3, 96.2, 1.8, 145, 136),
    makeChapter(RED_RISING_ID, 2, "Sondeainfiernos", 2840, 742, "B1", 75.4, 24.5, 94.8, 2.2, 610, 562),
    makeChapter(RED_RISING_ID, 3, "El Laurel", 3410, 815, "B1", 73.1, 36.2, 93.4, 2.5, 420, 381),
    makeChapter(RED_RISING_ID, 4, "La Canción Prohibida", 2190, 612, "B1", 76.8, 31.0, 95.1, 1.6, 285, 265),
    makeChapter(RED_RISING_ID, 5, "Las Minas de Lykos", 4120, 980, "B2", 68.5, 22.4, 91.2, 3.1, 390, 338),
    makeChapter(RED_RISING_ID, 6, "La Ascensión", 3150, 760, "B1", 74.2, 29.8, 94.0, 2.0, 248, 224),
  ],
  [HUNGER_ID]: [
    makeChapter(HUNGER_ID, 1, "Capítulo 1 · La Cosecha", 4620, 920, "B1", 79.5, 28.0, 96.4, 1.4, 920, 875),
    makeChapter(HUNGER_ID, 2, "Capítulo 2 · Voluntaria", 3890, 810, "B1", 81.2, 34.5, 97.1, 1.2, 412, 394),
    makeChapter(HUNGER_ID, 3, "Capítulo 3 · El Tren", 4150, 865, "B1", 77.8, 38.0, 95.5, 1.8, 365, 340),
    makeChapter(HUNGER_ID, 4, "Capítulo 4 · El Capitolio", 3980, 890, "B1", 76.0, 31.2, 94.9, 2.1, 340, 312),
  ],
  [ELITE_ID]: [
    makeChapter(ELITE_ID, 1, "1x01 · Bienvenidos", 5840, 1020, "B2", 73.0, 91.5, 90.2, 3.0, 1020, 890),
    makeChapter(ELITE_ID, 2, "1x02 · Deseo", 6120, 1085, "B2", 71.5, 93.0, 88.6, 3.4, 540, 462),
    makeChapter(ELITE_ID, 3, "1x03 · Sábado noche", 6490, 1140, "B2", 70.2, 94.2, 87.9, 3.6, 480, 405),
    makeChapter(ELITE_ID, 4, "1x04 · El amor es una droga", 5710, 995, "B2", 74.1, 90.8, 90.5, 2.8, 395, 348),
  ],
};
