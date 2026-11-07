export interface SentenceAiExplanation {
  natural_translation: string;
  word_nuance: string;
  grammar_notes: string[];
  tone_register?: string;
}

export interface GroqSentenceContextRequest {
  sentence: string;
  targetWord: string;
  apiKey: string;
}
