import { fetchCanonicalSentences, fetchIPlusOneSentences } from "@/api/sentence.api";
import type { UserFlashcard } from "@/types/flashcard.types";

export async function enrichFlashcardSentence(
  card: UserFlashcard,
  userId: string
): Promise<UserFlashcard> {
  // If already enriched with an authentic sentence from sentence_bank, keep it
  if (card.is_i_plus_one || (card.sentence && !card.sentence.startsWith("Esta palabra está"))) {
    return card;
  }

  try {
    // 1. Try to find a comprehensible i+1 sentence (where all other words are known)
    const i1List = await fetchIPlusOneSentences(card.canonical_id, userId, undefined, 1);
    if (i1List.length > 0) {
      const match = i1List[0];
      const surface =
        match.tokens.find((t) => t.canonical_id === card.canonical_id)?.surface ||
        card.target_lemma;

      return {
        ...card,
        sentence: match.sentence,
        target_surface: surface,
        source_context: match.source_context || card.source_context,
        is_i_plus_one: true,
      };
    }

    // 2. Fallback to any authentic sentence in the sentence bank
    const canonList = await fetchCanonicalSentences(card.canonical_id, undefined, 1);
    if (canonList.length > 0) {
      const match = canonList[0];
      const surface =
        match.tokens.find((t) => t.canonical_id === card.canonical_id)?.surface ||
        card.target_lemma;

      return {
        ...card,
        sentence: match.sentence,
        target_surface: surface,
        source_context: match.source_context || card.source_context,
        is_i_plus_one: false,
      };
    }
  } catch (err) {
    console.error("[enrichFlashcardSentence] Failed to enrich card:", err);
  }

  return card;
}
