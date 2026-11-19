import type { DictionarySentence, DictionaryWord } from "@/types/dictionary.types";
import type { MediaCatalogItem } from "@/types/media.types";

export const MOCK_WORD: DictionaryWord = {
  id: "mock-marmol",
  language: "es",
  lemma: "mármol",
  pos: "NOUN",
  definitions: ["marble (crystalline metamorphic rock)", "marble sculpture or slab"],
  freq_rank: 4947,
  cefr: "B2",
  pronunciations: ["/ˈmaɾ.mol/"],
};

export const MOCK_SENTENCES: DictionarySentence[] = [
  {
    id: "mock-s1",
    media_item_id: "4626ba54-0c9b-4265-acf3-8024b13ae224",
    media_title: "Cien años de soledad",
    media_creator: "Gabriel García Márquez",
    sentence: "Las columnas de mármol blanco brillaban bajo el sol.",
    token_count: 9,
    source_context: "Chapter 3",
    canonical_ids: ["mock-marmol"],
    tokens: [
      { surface: "Las", start_char: 0, end_char: 3, canonical_id: "t1", lemma: "el", pos: "DET" },
      { surface: "columnas", start_char: 4, end_char: 12, canonical_id: "t2", lemma: "columna", pos: "NOUN" },
      { surface: "de", start_char: 13, end_char: 15, canonical_id: "t3", lemma: "de", pos: "ADP" },
      { surface: "mármol", start_char: 16, end_char: 22, canonical_id: "mock-marmol", lemma: "mármol", pos: "NOUN" },
      { surface: "blanco", start_char: 23, end_char: 29, canonical_id: "t4", lemma: "blanco", pos: "ADJ" },
      { surface: "brillaban", start_char: 30, end_char: 39, canonical_id: "t5", lemma: "brillar", pos: "VERB" },
      { surface: "bajo", start_char: 40, end_char: 44, canonical_id: "t6", lemma: "bajo", pos: "ADP" },
      { surface: "el", start_char: 45, end_char: 47, canonical_id: "t7", lemma: "el", pos: "DET" },
      { surface: "sol", start_char: 48, end_char: 51, canonical_id: "t8", lemma: "sol", pos: "NOUN" },
    ],
    unknown_count: 0,
  },
];

export const MOCK_BOOK: MediaCatalogItem = {
  id: "95af4721-dbd1-4fe2-bbc3-1301ea0734b3",
  work_id: "95af4721-dbd1-4fe2-bbc3-1301ea0734b3",
  work_title: "Harry Potter and the Philosopher's Stone",
  work_language: "en",
  work_synopsis:
    "Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive.",
  title: "Harry Potter y la piedra filosofal",
  creator: "J.K. Rowling",
  language: "es",
  type: "book",
  format: "epub",
  release_year: 1997,
  sampleSnippet: "",
  sampleSourceLabel: "",
  cover_image_url:
    "https://152.67.157.124.sslip.io/storage/v1/object/public/media-covers/covers/738ede12b77ea3544dbb9507.jpg",
  external_ids: {},
  metrics: {
    media_item_id: "mock-book",
    total_tokens: 78500,
    content_tokens: 41200,
    unique_words_count: 5420,
    cefr_level: "B1",
    cefr_distribution: { A1: 42, A2: 26, B1: 19, B2: 9, C1: 3, C2: 1 },
    lexical_density: 0.46,
    readability_score: 74.2,
    dialogue_ratio: 0.34,
    words_per_minute: null,
  },
  comprehension: {
    media_item_id: "mock-book",
    total_words: 5420,
    known_words: 4553,
    learning_words: 210,
    comprehension_percentage: 84,
    learning_percentage: 3.9,
    total_tokens: 78500,
    known_tokens: 72220,
    learning_tokens: 3140,
    text_coverage_percentage: 92,
    learning_text_coverage_percentage: 4,
  },
  previewWords: [
    { canonical_id: "w1", lemma: "varita", pos: "NOUN", frequency: 42, cefr: "B2", rank: 6820, sentence: null },
    { canonical_id: "w2", lemma: "hechizo", pos: "NOUN", frequency: 38, cefr: "B1", rank: 4120, sentence: null },
    { canonical_id: "w3", lemma: "piedra", pos: "NOUN", frequency: 64, cefr: "A2", rank: 980, sentence: null },
  ],
};
