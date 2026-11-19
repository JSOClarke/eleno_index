import type { BankSentence } from "./sentence.types";

export interface DictionaryWord {
  id: string;
  language: string;
  lemma: string;
  pos: string;
  definitions: string[];
  freq_rank: number | null;
  cefr: string | null;
  pronunciations: string[];
}

export interface DictionarySentence extends BankSentence {
  media_title: string;
  media_creator: string;
}
