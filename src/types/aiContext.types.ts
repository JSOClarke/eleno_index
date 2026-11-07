export interface SentenceAiExplanation {
  chunk: string;
  meaning: string;
  translation: string;
}

export interface GroqSentenceContextRequest {
  sentence: string;
  targetWord: string;
  apiKey: string;
}
