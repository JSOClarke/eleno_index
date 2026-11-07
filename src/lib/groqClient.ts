import type { SentenceAiExplanation } from "@/types/aiContext.types";

const GROQ_CHAT_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const explanationCache = new Map<string, SentenceAiExplanation>();

function buildCacheKey(sentence: string, targetWord: string): string {
  return `${sentence.trim()}::${targetWord.trim().toLowerCase()}`;
}

const SYSTEM_PROMPT = `You are an expert Spanish linguist and pedagogue assisting a Spanish learner.
Explain the provided Spanish sentence in natural, fluent English, with specific attention to how the target word is used in this exact context.
Return ONLY a valid JSON object with the following structure:
{
  "natural_translation": "Natural, idiomatic English translation of the entire sentence",
  "word_nuance": "Precise explanation of the target word's nuance, idiom, or syntactic role in this context",
  "grammar_notes": ["Array of 1-3 short, insightful notes on grammar, conjugation, mood, or syntax"],
  "tone_register": "Tone or register, e.g. Literary, Colloquial, Formal, Conversational, etc."
}`;

export async function explainSentenceInContext(
  sentence: string,
  targetWord: string,
  apiKey: string
): Promise<SentenceAiExplanation> {
  const cacheKey = buildCacheKey(sentence, targetWord);
  const cached = explanationCache.get(cacheKey);
  if (cached) return cached;

  const response = await fetch(GROQ_CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Spanish Sentence: "${sentence.trim()}"\nTarget Word/Phrase: "${targetWord.trim()}"`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid Groq API key. Check or update your key.");
    }
    if (response.status === 429) {
      throw new Error("Groq API rate limit exceeded. Please wait a moment.");
    }
    const errorBody = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorBody || response.statusText}`);
  }

  const json = await response.json();
  const rawContent = json?.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error("No response received from Groq.");
  }

  const parsed = JSON.parse(rawContent) as Partial<SentenceAiExplanation>;
  const result: SentenceAiExplanation = {
    natural_translation: parsed.natural_translation || "",
    word_nuance: parsed.word_nuance || "",
    grammar_notes: Array.isArray(parsed.grammar_notes) ? parsed.grammar_notes : [],
    tone_register: parsed.tone_register || undefined,
  };

  explanationCache.set(cacheKey, result);
  return result;
}
