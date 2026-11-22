export interface PosMeta {
  label: string;
  esLabel: string;
  desc: string;
}

const POS_META: Record<string, PosMeta> = {
  NOUN: { label: "Noun", esLabel: "Sustantivo", desc: "Names a person, place, thing, or concept. Inflects for masculine/feminine gender and singular/plural number." },
  VERB: { label: "Verb", esLabel: "Verbo", desc: "Expresses an action, occurrence, or state. Conjugates across mood, tense, person, and number." },
  AUX: { label: "Auxiliary", esLabel: "Verbo Auxiliar", desc: "Helper verb (such as haber, ser, estar) forming compound tenses, passives, or progressive constructions." },
  ADJ: { label: "Adjective", esLabel: "Adjetivo", desc: "Modifies a noun to describe a quality or state, agreeing in gender and number." },
  ADV: { label: "Adverb", esLabel: "Adverbio", desc: "Modifies a verb, adjective, or clause (manner, time, place, or degree). Invariable in form." },
  PRON: { label: "Pronoun", esLabel: "Pronombre", desc: "Substitutes for a noun phrase (subject, object, reflexive, relative, or interrogative)." },
  DET: { label: "Determiner", esLabel: "Determinante", desc: "Introduces a noun (articles el/la/un, demonstratives, or possessives)." },
  ADP: { label: "Preposition", esLabel: "Preposición", desc: "Links a noun or pronoun to another element in the clause (e.g., de, en, con, por, para)." },
  CCONJ: { label: "Conjunction", esLabel: "Conjunción", desc: "Connects words, phrases, or independent clauses (e.g., y, o, pero)." },
  SCONJ: { label: "Subordinator", esLabel: "Conjunción Subordinante", desc: "Introduces a dependent clause (e.g., que, porque, aunque, si)." },
  PROPN: { label: "Proper Noun", esLabel: "Nombre Propio", desc: "Specific name of a person, place, or organization." },
};

const BASE_MORPH = {
  vform: { Inf: "Infinitive", Ger: "Gerund", Part: "Participle" } as Record<string, string>,
  mood: { Ind: "Indicative", Sub: "Subjunctive", Imp: "Imperative", Cnd: "Conditional" } as Record<string, string>,
  tense: { Pres: "Present", Past: "Past", Imp: "Imperfect", Fut: "Future", Cond: "Conditional" } as Record<string, string>,
  person: { "1": "1st Person", "2": "2nd Person", "3": "3rd Person" } as Record<string, string>,
  number: { Sing: "Singular", Plur: "Plural" } as Record<string, string>,
  gender: { Masc: "Masculine", Fem: "Feminine", Neut: "Neuter" } as Record<string, string>,
};

export function getPosMeta(pos?: string | null): PosMeta | null {
  return pos ? POS_META[pos.toUpperCase()] || null : null;
}

export function parseMorphChips(morph?: string | Record<string, string> | null, language = "es"): string[] {
  if (!morph) return [];
  const map: Record<string, string> = {};
  if (typeof morph === "string") {
    for (const part of morph.split("|")) {
      const [k, v] = part.split("=");
      if (k && v) map[k] = v;
    }
  } else {
    Object.assign(map, morph);
  }
  const lang = (language || "es").toLowerCase().slice(0, 2);
  const tenseMap = lang === "es" ? { ...BASE_MORPH.tense, Past: "Preterite" } : lang === "fr" ? { ...BASE_MORPH.tense, Past: "Passé Simple" } : BASE_MORPH.tense;

  const chips: string[] = [];
  if (map.VerbForm && BASE_MORPH.vform[map.VerbForm]) chips.push(BASE_MORPH.vform[map.VerbForm]);
  if (map.Tense && tenseMap[map.Tense]) chips.push(tenseMap[map.Tense]);
  if (map.Mood && BASE_MORPH.mood[map.Mood]) chips.push(BASE_MORPH.mood[map.Mood]);
  if (map.Person && BASE_MORPH.person[map.Person]) chips.push(BASE_MORPH.person[map.Person]);
  if (map.Gender && BASE_MORPH.gender[map.Gender]) chips.push(BASE_MORPH.gender[map.Gender]);
  if (map.Number && BASE_MORPH.number[map.Number]) chips.push(BASE_MORPH.number[map.Number]);
  return chips;
}
