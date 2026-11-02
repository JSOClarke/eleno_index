/**
 * Translates spaCy Universal Dependencies (UD) morphology strings into human-readable English.
 * e.g. "Mood=Ind|Number=Sing|Person=1|Tense=Pres|VerbForm=Fin" -> "Present Indicative · 1st Person Singular"
 * e.g. "Gender=Fem|Number=Sing" -> "Feminine Singular"
 */
export function formatMorphology(morph?: string): string | null {
  if (!morph || typeof morph !== "string") return null;

  const parts: Record<string, string> = {};
  for (const pair of morph.split("|")) {
    const [k, v] = pair.split("=");
    if (k && v) parts[k] = v;
  }

  const chunks: string[] = [];

  const tenseMap: Record<string, string> = {
    Pres: "Present",
    Past: "Preterite",
    Imp: "Imperfect",
    Fut: "Future",
    Pqp: "Pluperfect",
  };
  const moodMap: Record<string, string> = {
    Ind: "Indicative",
    Sub: "Subjunctive",
    Cnd: "Conditional",
    Imp: "Imperative",
  };
  const personMap: Record<string, string> = {
    "1": "1st Person",
    "2": "2nd Person",
    "3": "3rd Person",
  };
  const numMap: Record<string, string> = {
    Sing: "Singular",
    Plur: "Plural",
  };
  const genMap: Record<string, string> = {
    Masc: "Masculine",
    Fem: "Feminine",
  };

  // 1. Non-finite verb forms
  if (parts.VerbForm === "Part") {
    chunks.push(parts.Tense === "Past" ? "Past Participle" : "Participle");
  } else if (parts.VerbForm === "Ger") {
    chunks.push("Gerund");
  } else if (parts.VerbForm === "Inf") {
    chunks.push("Infinitive");
  } else if (parts.VerbForm === "Fin" || parts.Mood || parts.Tense) {
    // 2. Finite verb: Tense + Mood
    const t = parts.Tense ? tenseMap[parts.Tense] || parts.Tense : "";
    const m = parts.Mood ? moodMap[parts.Mood] || parts.Mood : "";
    if (t && m) chunks.push(`${t} ${m}`);
    else if (t || m) chunks.push(t || m);

    // Person + Number
    const p = parts.Person ? personMap[parts.Person] : "";
    const n = parts.Number ? numMap[parts.Number] : "";
    if (p && n) chunks.push(`${p} ${n}`);
    else if (p || n) chunks.push(p || n);
  }

  // 3. Noun / Adjective / Pronoun: Gender + Number
  if (!chunks.length) {
    const g = parts.Gender ? genMap[parts.Gender] : "";
    const n = parts.Number ? numMap[parts.Number] : "";
    if (g && n) chunks.push(`${g} ${n}`);
    else if (g || n) chunks.push(g || n);
  }

  return chunks.length > 0 ? chunks.join(" · ") : null;
}
