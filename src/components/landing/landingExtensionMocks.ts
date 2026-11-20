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

export interface DemoPhrase {
  canonical_phrase: string;
  type: "idiom" | "periphrasis" | "collocation";
  gloss: string;
  tokenStart: number;
  tokenEnd: number;
}

export interface ParsedDemoToken {
  surface: string;
  pos: string;
  lemma: string;
  demoStatus?: DemoWordStatus;
  canonical: ParsedCandidate | null;
  alternatives: ParsedCandidate[];
}

export const HP_CH1_SENTENCE = "De repente se dio cuenta de que la lechuza parda volvía a pasar por la ventana.";
export const HP_CH1_TRANSLATION = "Suddenly they realized that the tawny owl was flying past the window again.";

export const HP_CH1_PHRASES: DemoPhrase[] = [
  { canonical_phrase: "de repente", type: "collocation", gloss: "suddenly, abruptly; in a heartbeat", tokenStart: 0, tokenEnd: 1 },
  { canonical_phrase: "darse cuenta", type: "idiom", gloss: "to notice, to realize, to figure out", tokenStart: 2, tokenEnd: 4 },
  { canonical_phrase: "volver a + infinitivo", type: "periphrasis", gloss: "to [action] again", tokenStart: 10, tokenEnd: 12 },
];

export const POS_META: Record<string, { label: string; esLabel: string; desc: string }> = {
  NOUN: { label: "Noun", esLabel: "Sustantivo", desc: "Names a person, place, thing, or concept. Inflects for gender and number." },
  VERB: { label: "Verb", esLabel: "Verbo", desc: "Expresses an action, occurrence, or state. Conjugates across mood, tense, and person." },
  ADJ: { label: "Adjective", esLabel: "Adjetivo", desc: "Modifies a noun to describe a quality or state, agreeing in gender and number." },
  PRON: { label: "Pronoun", esLabel: "Pronombre", desc: "Substitutes for a noun phrase (subject, object, reflexive, or relative)." },
  DET: { label: "Determiner", esLabel: "Determinante", desc: "Introduces a noun (articles el/la/un, demonstratives, or possessives)." },
  ADP: { label: "Preposition", esLabel: "Preposición", desc: "Links a noun or pronoun to another element in the clause." },
  SCONJ: { label: "Conjunction", esLabel: "Conjunción", desc: "Connects clauses and introduces subordinate clauses." },
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
  { surface: "De", pos: "ADP", lemma: "de", demoStatus: "known", canonical: { id: "8f2b62ea", lemma: "de", pos: "ADP", cefr: "A1", tubelex_rank: 1, elelex_rank: 2, definitions: ["of; 's", "from (source or origin)", "about (concerning)"], ipa: "/de/" }, alternatives: [{ id: "9e536f27", lemma: "de", pos: "NOUN", cefr: "A1", tubelex_rank: null, elelex_rank: 4943, definitions: ["The name of the Latin script letter D/d."], ipa: "/de/" }] },
  { surface: "repente", pos: "NOUN", lemma: "repente", demoStatus: "learning", canonical: { id: "c35b03df", lemma: "repente", pos: "NOUN", cefr: null, tubelex_rank: 872, elelex_rank: null, definitions: ["attack, upsurge", "fit, sudden movement"], ipa: "/reˈpente/" }, alternatives: [] },
  { surface: "se", pos: "PRON", lemma: "él", demoStatus: "known", canonical: { id: "10a8de88", lemma: "él", pos: "PRON", cefr: "A1", tubelex_rank: 3, elelex_rank: 49, definitions: ["he, him", "it (masculine)"], ipa: "[ˈel]" }, alternatives: [{ id: "5ffeff80", lemma: "se", pos: "PRON", cefr: "A1", tubelex_rank: null, elelex_rank: 10, definitions: ["reflexive/reciprocal pronoun: oneself, himself, herself"], ipa: "[se]" }] },
  { surface: "dio", pos: "VERB", lemma: "dar", demoStatus: "known", canonical: { id: "4540c65a", lemma: "dar", pos: "VERB", cefr: "A1", tubelex_rank: 39, elelex_rank: 42, definitions: ["to give, to give out", "to hand over", "to hit, to strike"], ipa: "/ˈdaɾ/" }, alternatives: [] },
  { surface: "cuenta", pos: "NOUN", lemma: "cuenta", demoStatus: "known", canonical: { id: "5f86263f", lemma: "cuenta", pos: "NOUN", cefr: "A1", tubelex_rank: 135, elelex_rank: 858, definitions: ["count, tally", "bill, tab", "account, report"], ipa: "/ˈkwenta/" }, alternatives: [{ id: "22f3033a", lemma: "contar", pos: "VERB", cefr: "A1", tubelex_rank: 148, elelex_rank: 137, definitions: ["to count; to tally", "to tell (a story)"], ipa: "/konˈtaɾ/" }] },
  { surface: "de", pos: "ADP", lemma: "de", demoStatus: "known", canonical: { id: "8f2b62ea-2", lemma: "de", pos: "ADP", cefr: "A1", tubelex_rank: 1, elelex_rank: 2, definitions: ["of; 's", "from (source or origin)"], ipa: "/de/" }, alternatives: [] },
  { surface: "que", pos: "SCONJ", lemma: "que", demoStatus: "known", canonical: { id: "84aaabfe", lemma: "que", pos: "CONJ", cefr: "A1", tubelex_rank: null, elelex_rank: 11, definitions: ["that", "than", "because, for"], ipa: "[ke]" }, alternatives: [{ id: "1da7df66", lemma: "que", pos: "PRON", cefr: "A1", tubelex_rank: 2, elelex_rank: 8, definitions: ["who; that; which"], ipa: "[ke]" }] },
  { surface: "la", pos: "DET", lemma: "el", demoStatus: "known", canonical: { id: "dbe7b51c", lemma: "el", pos: "DET", cefr: "A1", tubelex_rank: null, elelex_rank: 1, definitions: ["masculine singular definite article; the"], ipa: null }, alternatives: [{ id: "6e4a1256", lemma: "la", pos: "DET", cefr: "A1", tubelex_rank: null, elelex_rank: 4227, definitions: ["feminine singular definite article; the"], ipa: null }] },
  { surface: "lechuza", pos: "NOUN", lemma: "lechuza", demoStatus: "unknown", canonical: { id: "00701e0d", lemma: "lechuza", pos: "NOUN", cefr: "A1", tubelex_rank: 16364, elelex_rank: 12372, definitions: ["owl", "barn owl (family Tytonidae)"], ipa: "/leˈt͡ʃuθa/" }, alternatives: [] },
  { surface: "parda", pos: "ADJ", lemma: "pardo", demoStatus: "learning", canonical: { id: "c82f31f5", lemma: "pardo", pos: "ADJ", cefr: "A2", tubelex_rank: 6736, elelex_rank: 5632, definitions: ["dun, brown", "dull, overcast", "gruff, hoarse"], ipa: "/ˈpaɾdo/" }, alternatives: [{ id: "ab866e2e", lemma: "pardo", pos: "NOUN", cefr: null, tubelex_rank: null, elelex_rank: null, definitions: ["leopard"], ipa: "/ˈpaɾdo/" }] },
  { surface: "volvía", pos: "VERB", lemma: "volver", demoStatus: "known", canonical: { id: "dac395e9", lemma: "volver", pos: "VERB", cefr: "A1", tubelex_rank: 117, elelex_rank: 109, definitions: ["to return, to go back", "to do again", "to turn, to become"], ipa: "/bolˈbeɾ/" }, alternatives: [] },
  { surface: "a", pos: "ADP", lemma: "a", demoStatus: "known", canonical: { id: "d52ffda2", lemma: "a", pos: "ADP", cefr: "A1", tubelex_rank: 4, elelex_rank: 6, definitions: ["to", "by, at", "personal a"], ipa: "[a]" }, alternatives: [] },
  { surface: "pasar", pos: "VERB", lemma: "pasar", demoStatus: "known", canonical: { id: "c84eb8fd", lemma: "pasar", pos: "VERB", cefr: "A1", tubelex_rank: 51, elelex_rank: 46, definitions: ["to pass, to go past", "to happen", "to spend (time)"], ipa: "[paˈsaɾ]" }, alternatives: [] },
  { surface: "por", pos: "ADP", lemma: "por", demoStatus: "known", canonical: { id: "05469ef6", lemma: "por", pos: "ADP", cefr: "A1", tubelex_rank: 16, elelex_rank: 16, definitions: ["by", "for (exchange)", "through, via"], ipa: "[poɾ]" }, alternatives: [{ id: "257ba711", lemma: "por", pos: "INTJ", cefr: null, tubelex_rank: null, elelex_rank: null, definitions: ["why?"], ipa: "[poɾ]" }] },
  { surface: "la", pos: "DET", lemma: "el", demoStatus: "known", canonical: { id: "dbe7b51c-2", lemma: "el", pos: "DET", cefr: "A1", tubelex_rank: null, elelex_rank: 1, definitions: ["masculine singular definite article; the"], ipa: null }, alternatives: [{ id: "6e4a1256-2", lemma: "la", pos: "DET", cefr: "A1", tubelex_rank: null, elelex_rank: 4227, definitions: ["feminine singular definite article; the"], ipa: null }] },
  { surface: "ventana", pos: "NOUN", lemma: "ventana", demoStatus: "known", canonical: { id: "374ab192", lemma: "ventana", pos: "NOUN", cefr: "A1", tubelex_rank: 1033, elelex_rank: 640, definitions: ["window (opening)", "window frame", "window (computer screen)"], ipa: "/benˈtana/" }, alternatives: [] },
];
