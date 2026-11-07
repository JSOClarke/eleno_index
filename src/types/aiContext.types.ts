export interface SentenceAiExplanation {
  pattern: string;
  chunk: string;
  meaning: string;
  translation: string;
}

export interface GroqSentenceContextRequest {
  sentence: string;
  targetWord: string;
  apiKey: string;
}
