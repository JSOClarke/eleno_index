export interface AudioSentenceSpan {
  bIdx: number;
  sIdx: number;
  text: string;
  start_ms: number;
  end_ms: number;
}

export interface AudioWordSpan {
  bIdx: number;
  sIdx: number;
  tIdx: number;
  surface: string;
  start_ms: number;
  end_ms: number;
}

export interface ChapterAudioSync {
  media_item_id: string;
  chapter_index: number;
  chapter_title: string;
  voice: string;
  duration_ms: number;
  audio_path: string;
  audio_url?: string;
  sentences: AudioSentenceSpan[];
  words: AudioWordSpan[];
}

export interface AudioPlaybackState {
  hasAudio: boolean;
  isPlaying: boolean;
  currentTimeMs: number;
  durationMs: number;
  playbackRate: number;
  autoScroll: boolean;
  activeSentence: { bIdx: number; sIdx: number } | null;
  activeWord: { bIdx: number; sIdx: number; tIdx: number } | null;
}
