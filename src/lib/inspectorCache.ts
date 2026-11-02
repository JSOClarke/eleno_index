import type { MediaChapterMetrics } from "@/types/media.types";
import type { QuarantineItem, VocabularyWord } from "@/types/vocabulary.types";

export interface InspectorCacheEntry {
  vocabulary: VocabularyWord[];
  chapterMetrics: MediaChapterMetrics[];
  quarantineItems: QuarantineItem[];
  quarantineLoaded: boolean;
  isComplete: boolean;
}

export const inspectorCache = new Map<string, InspectorCacheEntry>();
