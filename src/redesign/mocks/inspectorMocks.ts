import type { QuarantineItem, VocabularyWord } from "@/types/vocabulary.types";

export interface MockPeriphrasisItem {
  id: string;
  pattern: string;
  category: string;
  meaning: string;
  count: number;
  exampleSurface: string;
  exampleSentence: string;
}

const makeWord = (
  id: string,
  lemma: string,
  ipa: string,
  pos: string,
  cefr: string,
  freq: number,
  rank: number | null,
  debutCh: number,
  def: string,
  snippet: string
): VocabularyWord => ({
  canonical_id: id,
  lemma,
  ipa,
  pos,
  cefr,
  frequency: freq,
  global_rank: rank,
  first_occurrence_index: debutCh,
  first_timestamp_ms: null,
  first_context_snippet: snippet,
  definitions: [def],
  rankings: rank
    ? [
        { source: "tubelex_v2025", rank, cefr, count: 1200 },
        { source: "elelex_v2020", rank: rank + 180, cefr, count: 900 },
      ]
    : [],
});

export const MOCK_INSPECTOR_WORDS: Record<string, VocabularyWord[]> = {
  default: [
    makeWord("w1", "rascar", "/rasˈkaɾ/", "VERB", "B1", 14, 4820, 2, "to scratch, scrape; also used in periphrasis conseguir + inf", "No conseguía rascar la superficie del metal rojo bajo la luz del túnel."),
    makeWord("w2", "cicatriz", "/θikaˈtɾiθ/", "NOUN", "B1", 27, 3910, 2, "scar; lasting mark on skin or memory", "Llevaba una cicatriz pálida cruzando la mejilla derecha."),
    makeWord("w3", "desafío", "/desaˈfio/", "NOUN", "B1", 19, 2450, 3, "challenge, dare, defiance", "Aceptar el desafío significaba arriesgarlo todo frente a los Dorados."),
    makeWord("w4", "susurrar", "/susuˈraɾ/", "VERB", "B1", 42, 3120, 1, "to whisper, murmur softly", "Se inclinó hacia mí para susurrar el plan antes de que llegaran los guardias."),
    makeWord("w5", "escondite", "/eskonˈdite/", "NOUN", "B2", 9, 6180, 4, "hiding place, hideout", "Nadie había encontrado todavía nuestro escondite detrás de la galería."),
    makeWord("w6", "cosecha", "/koˈsetʃa/", "NOUN", "B1", 34, 4210, 1, "harvest, reaping", "Hoy es el día de la cosecha en el Distrito 12."),
    makeWord("w7", "castigo", "/kasˈtiɣo/", "NOUN", "B1", 21, 2190, 3, "punishment, penalty", "Cualquier intento de fuga recibía un castigo inmediato."),
    makeWord("w8", "alambre", "/aˈlambɾe/", "NOUN", "B2", 11, 5640, 2, "wire, barbed fence", "Crucé por debajo de la valla de alambre antes del amanecer."),
  ],
  "mock-elite-s01": [
    makeWord("e1", "beca", "/ˈbeka/", "NOUN", "B1", 22, 3400, 1, "scholarship, educational grant", "1x01 · Nos han dado una beca para estudiar en Las Encinas este curso."),
    makeWord("e2", "pasta", "/ˈpasta/", "NOUN", "B2", 18, 2890, 1, "money, cash (Spanish colloquial slang)", "1x01 · Aquí todo el mundo tiene mucha pasta y se nota nada más entrar."),
    makeWord("e3", "liar", "/liˈaɾ/", "VERB", "B2", 31, 4120, 2, "to mess up, complicate, or hook up with someone", "1x02 · Por favor, no me líes más con tus historias."),
    makeWord("e4", "juerga", "/ˈxweɾɣa/", "NOUN", "B2", 12, 7450, 3, "wild party, night out", "1x03 · Montaron una juerga en la piscina hasta las cuatro de la mañana."),
  ],
};

export const MOCK_QUARANTINE_ITEMS: QuarantineItem[] = [
  { id: "q1", media_item_id: "default", token: "Darrow", category: "proper_noun", frequency: 842 },
  { id: "q2", media_item_id: "default", token: "Lykos", category: "proper_noun", frequency: 194 },
  { id: "q3", media_item_id: "default", token: "Eo", category: "proper_noun", frequency: 165 },
  { id: "q4", media_item_id: "default", token: "Katniss", category: "proper_noun", frequency: 910 },
  { id: "q5", media_item_id: "default", token: "Peeta", category: "proper_noun", frequency: 412 },
  { id: "q6", media_item_id: "default", token: "Panem", category: "proper_noun", frequency: 98 },
  { id: "q7", media_item_id: "default", token: "Gale", category: "proper_noun", frequency: 230 },
  { id: "q8", media_item_id: "default", token: "Haymitch", category: "proper_noun", frequency: 185 },
  { id: "q9", media_item_id: "default", token: "¡bah!", category: "interjection", frequency: 14 },
  { id: "q10", media_item_id: "default", token: "mmm", category: "onomatopoeia", frequency: 9 },
  { id: "q11", media_item_id: "default", token: "pff", category: "interjection", frequency: 7 },
  { id: "q12", media_item_id: "default", token: "clac", category: "onomatopoeia", frequency: 5 },
];

export const MOCK_PERIPHRASES: MockPeriphrasisItem[] = [
  {
    id: "es:conseguir_inf",
    pattern: "conseguir + infinitivo",
    category: "Achievement",
    meaning: "to manage to, succeed in [action]",
    count: 18,
    exampleSurface: "conseguía rascar",
    exampleSentence: "No conseguía rascar la superficie del metal rojo.",
  },
  {
    id: "es:tener_que_inf",
    pattern: "tener que + infinitivo",
    category: "Obligation",
    meaning: "to have to, must [action]",
    count: 94,
    exampleSurface: "tienes que mover",
    exampleSentence: "Para ser un sondeainfiernos tienes que mover rápido las manos.",
  },
  {
    id: "es:volver_a_inf",
    pattern: "volver a + infinitivo",
    category: "Repetition",
    meaning: "to [action] again",
    count: 41,
    exampleSurface: "volvió a mirar",
    exampleSentence: "Volvió a mirar hacia el túnel antes de apagar la lámpara.",
  },
  {
    id: "es:acabar_de_inf",
    pattern: "acabar de + infinitivo",
    category: "Recency",
    meaning: "to have just [action]-ed",
    count: 23,
    exampleSurface: "acababa de llegar",
    exampleSentence: "El convoy acababa de llegar con los nuevos suministros.",
  },
];
