export interface ParsedCandidate {
  id: string;
  lemma: string;
  pos: string;
  cefr: string | null;
  tubelex_rank: number | null;
  elelex_rank: number | null;
  definitions: string[];
  ipa: string | null;
}

export type DemoHighlightMode = "status" | "cefr" | "rank" | "none";
export type DemoWordStatus = "known" | "learning" | "unknown";

export interface ParsedDemoToken {
  surface: string;
  pos: string;
  lemma: string;
  demoStatus?: DemoWordStatus;
  is_punct?: boolean;
  canonical: ParsedCandidate | null;
  alternatives: ParsedCandidate[];
}

export const HP_CH1_SENTENCE = "Ninguno vio la gran lechuza parda que pasaba volando por la ventana.";
export const HP_CH1_TRANSLATION = "No one saw the large tawny owl flying past the window.";

export const POS_META: Record<string, { label: string; esLabel: string; desc: string }> = {
  NOUN: { label: "Noun", esLabel: "Sustantivo", desc: "Names a person, place, thing, or concept. Inflects for gender and number." },
  VERB: { label: "Verb", esLabel: "Verbo", desc: "Expresses an action, occurrence, or state. Conjugates across mood, tense, and person." },
  ADJ: { label: "Adjective", esLabel: "Adjetivo", desc: "Modifies a noun to describe a quality or state, agreeing in gender and number." },
  PRON: { label: "Pronoun", esLabel: "Pronombre", desc: "Substitutes for a noun phrase (subject, object, reflexive, or relative)." },
  DET: { label: "Determiner", esLabel: "Determinante", desc: "Introduces a noun (articles el/la/un, demonstratives, or possessives)." },
  ADP: { label: "Preposition", esLabel: "Preposición", desc: "Links a noun or pronoun to another element in the clause." },
  CONJ: { label: "Conjunction", esLabel: "Conjunción", desc: "Connects words, phrases, or independent clauses." },
  INTJ: { label: "Interjection", esLabel: "Interjección", desc: "Expresses a sudden emotion, exclamation, or reaction." },
};

export function speakSpanishDemo(text: string, rate = 1.0): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-ES";
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

export function getFrequencyBandLabel(rank: number | null): string {
  if (!rank) return "Rare";
  if (rank <= 1000) return "Top 1k";
  if (rank <= 3000) return "Top 3k";
  if (rank <= 5000) return "Top 5k";
  if (rank <= 10000) return "Top 10k";
  return "Rare";
}

export const HP_CH1_TOKENS: ParsedDemoToken[] = [
  {
    surface: "Ninguno", pos: "PRON", lemma: "ninguno", demoStatus: "known",
    canonical: { id: "0cc52709", lemma: "ninguno", pos: "PRON", cefr: "A1", tubelex_rank: null, elelex_rank: 1234, definitions: ["nobody; no one", "none; neither, any"], ipa: "/ninˈɡuno/" },
    alternatives: [{ id: "76781ced", lemma: "ninguno", pos: "DET", cefr: "A1", tubelex_rank: 174, elelex_rank: 351, definitions: ["no; none; (no/not…) at all, in the slightest"], ipa: "/ninˈɡuno/" }],
  },
  {
    surface: "vio", pos: "VERB", lemma: "ver", demoStatus: "known",
    canonical: { id: "39ddf694", lemma: "ver", pos: "VERB", cefr: "A1", tubelex_rank: 29, elelex_rank: 32, definitions: ["to see, to spot", "to see, to look at, to view (perceive)", "to watch", "to look, to seem"], ipa: "[ˈbeɾ]" },
    alternatives: [],
  },
  {
    surface: "la", pos: "DET", lemma: "el", demoStatus: "known",
    canonical: { id: "dbe7b51c", lemma: "el", pos: "DET", cefr: "A1", tubelex_rank: null, elelex_rank: 1, definitions: ["masculine singular definite article; the", "feminine singular definite article before stressed /a/"], ipa: null },
    alternatives: [
      { id: "6e4a1256", lemma: "la", pos: "DET", cefr: "A1", tubelex_rank: null, elelex_rank: 4227, definitions: ["feminine singular definite article; the"], ipa: null },
      { id: "d58b2cc9", lemma: "la", pos: "NOUN", cefr: "A1", tubelex_rank: null, elelex_rank: 5847, definitions: ["la (sixth note of the scale)", "A (the musical note or key)"], ipa: "[la]" },
    ],
  },
  {
    surface: "gran", pos: "ADJ", lemma: "grande", demoStatus: "known",
    canonical: { id: "390045d2", lemma: "grande", pos: "ADJ", cefr: "A1", tubelex_rank: 138, elelex_rank: 140, definitions: ["big, large", "great, grand", "aged, old"], ipa: "/ˈɡɾande/" },
    alternatives: [{ id: "83cbfc6f", lemma: "grande", pos: "NOUN", cefr: null, tubelex_rank: null, elelex_rank: null, definitions: ["grandee", "adult, grown-up"], ipa: "/ˈɡɾande/" }],
  },
  {
    surface: "lechuza", pos: "NOUN", lemma: "lechuza", demoStatus: "unknown",
    canonical: { id: "00701e0d", lemma: "lechuza", pos: "NOUN", cefr: "A1", tubelex_rank: 16364, elelex_rank: 12372, definitions: ["owl", "barn owl (any species of owl from the family Tytonidae)"], ipa: "/leˈt͡ʃuθa/" },
    alternatives: [],
  },
  {
    surface: "parda", pos: "ADJ", lemma: "pardo", demoStatus: "learning",
    canonical: { id: "c82f31f5", lemma: "pardo", pos: "ADJ", cefr: "A2", tubelex_rank: 6736, elelex_rank: 5632, definitions: ["dun, brown", "dull, overcast", "gruff, hoarse"], ipa: "/ˈpaɾdo/" },
    alternatives: [{ id: "ab866e2e", lemma: "pardo", pos: "NOUN", cefr: null, tubelex_rank: null, elelex_rank: null, definitions: ["leopard"], ipa: "/ˈpaɾdo/" }],
  },
  {
    surface: "que", pos: "PRON", lemma: "que", demoStatus: "known",
    canonical: { id: "1da7df66", lemma: "que", pos: "PRON", cefr: "A1", tubelex_rank: 2, elelex_rank: 8, definitions: ["who; that", "that; whom; which"], ipa: "[ke]" },
    alternatives: [{ id: "84aaabfe", lemma: "que", pos: "CONJ", cefr: "A1", tubelex_rank: null, elelex_rank: 11, definitions: ["that", "than", "indicates reason; because, for"], ipa: "[ke]" }],
  },
  {
    surface: "pasaba", pos: "VERB", lemma: "pasar", demoStatus: "known",
    canonical: { id: "c84eb8fd", lemma: "pasar", pos: "VERB", cefr: "A1", tubelex_rank: 51, elelex_rank: 46, definitions: ["to pass, to hand, to slip", "to happen", "to go past, go by"], ipa: "[paˈsaɾ]" },
    alternatives: [],
  },
  {
    surface: "volando", pos: "VERB", lemma: "volar", demoStatus: "learning",
    canonical: { id: "a481fce7", lemma: "volar", pos: "VERB", cefr: "A1", tubelex_rank: 1299, elelex_rank: 898, definitions: ["to fly, to fly away", "to fly (on an airplane)", "to blow up"], ipa: "[boˈlaɾ]" },
    alternatives: [{ id: "ffb4aeb6", lemma: "volando", pos: "ADJ", cefr: null, tubelex_rank: null, elelex_rank: null, definitions: ["in flight"], ipa: "/boˈlando/" }],
  },
  {
    surface: "por", pos: "ADP", lemma: "por", demoStatus: "known",
    canonical: { id: "05469ef6", lemma: "por", pos: "ADP", cefr: "A1", tubelex_rank: 16, elelex_rank: 16, definitions: ["by", "for (exchange)", "through, out, via (movement)", "across"], ipa: "[poɾ]" },
    alternatives: [{ id: "257ba711", lemma: "por", pos: "INTJ", cefr: null, tubelex_rank: null, elelex_rank: null, definitions: ["why?", "why do you ask?"], ipa: "[poɾ]" }],
  },
  {
    surface: "la", pos: "DET", lemma: "el", demoStatus: "known",
    canonical: { id: "dbe7b51c-2", lemma: "el", pos: "DET", cefr: "A1", tubelex_rank: null, elelex_rank: 1, definitions: ["masculine singular definite article; the", "feminine singular definite article before stressed /a/"], ipa: null },
    alternatives: [{ id: "6e4a1256-2", lemma: "la", pos: "DET", cefr: "A1", tubelex_rank: null, elelex_rank: 4227, definitions: ["feminine singular definite article; the"], ipa: null }],
  },
  {
    surface: "ventana", pos: "NOUN", lemma: "ventana", demoStatus: "known",
    canonical: { id: "374ab192", lemma: "ventana", pos: "NOUN", cefr: "A1", tubelex_rank: 1033, elelex_rank: 640, definitions: ["window (opening for light and air)", "window frame", "window (computer screen)"], ipa: "/benˈtana/" },
    alternatives: [],
  },
];
