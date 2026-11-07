import { DEFAULT_GROQ_MODEL } from "@/lib/userAiKeys";
import type { SentenceAiExplanation } from "@/types/aiContext.types";

const GROQ_CHAT_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const explanationCache = new Map<string, SentenceAiExplanation>();

function buildCacheKey(model: string, sentence: string, targetWord: string): string {
  return `${model}::${sentence.trim()}::${targetWord.trim().toLowerCase()}`;
}

const SYSTEM_PROMPT = `You are an expert Spanish linguist assisting a language learner.
For the given Spanish sentence and target word:
1. Identify the natural linguistic "chunk" (the immediate idiom, phrasal verb, or collocation containing the target word).
2. Explain what that chunk means in this specific sentence context.
3. Translate the full sentence into natural English.

Return ONLY a valid JSON object matching this schema:
{
  "chunk": "The exact Spanish phrase or collocation from the sentence containing the word",
  "meaning": "Clear explanation of what this chunk means in this specific context",
  "translation": "Natural English translation of the entire sentence"
}`;

async function requestGroqChat(
  sentence: string,
  targetWord: string,
  apiKey: string,
  model: string
): Promise<Response> {
  return fetch(GROQ_CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Spanish Sentence: "${sentence.trim()}"\nTarget Word: "${targetWord.trim()}"`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });
}

export async function explainSentenceInContext(
  sentence: string,
  targetWord: string,
  apiKey: string,
  model = DEFAULT_GROQ_MODEL
): Promise<SentenceAiExplanation> {
  const cacheKey = buildCacheKey(model, sentence, targetWord);
  const cached = explanationCache.get(cacheKey);
  if (cached) return cached;

  let chosenModel = model || DEFAULT_GROQ_MODEL;
  let response = await requestGroqChat(sentence, targetWord, apiKey, chosenModel);

  // Automatic fallback to DEFAULT_GROQ_MODEL if chosen model returns 404
  if (response.status === 404 && chosenModel !== DEFAULT_GROQ_MODEL) {
    chosenModel = DEFAULT_GROQ_MODEL;
    response = await requestGroqChat(sentence, targetWord, apiKey, chosenModel);
  }

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
    chunk: (parsed.chunk || targetWord).trim(),
    meaning: (parsed.meaning || "").trim(),
    translation: (parsed.translation || "").trim(),
  };

  explanationCache.set(cacheKey, result);
  return result;
}
