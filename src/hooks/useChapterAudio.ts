import { useState, useEffect, useRef, useCallback } from "react";
import { fetchChapterAudioSync } from "@/api/readerAudio.api";
import { findActiveSentence, findActiveWord, findSentenceTime, findTokenTime } from "@/lib/audioTimingMatcher";
import type { ChapterAudioSync } from "@/types/readerAudio.types";

export function useChapterAudio(mediaItemId?: string, chapterIndex?: number) {
  const [sync, setSync] = useState<ChapterAudioSync | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1.0);
  const [autoScroll, setAutoScroll] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Load sync metadata and audio url
  useEffect(() => {
    if (!mediaItemId || chapterIndex === undefined) {
      setSync(null);
      return;
    }

    let cancelled = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTimeMs(0);

    fetchChapterAudioSync(mediaItemId, chapterIndex).then((res) => {
      if (!cancelled) {
        setSync(res);
        if (res?.audio_url) {
          const audio = new Audio(res.audio_url);
          audio.playbackRate = playbackRate;
          audioRef.current = audio;
        }
      }
    });

    return () => {
      cancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mediaItemId, chapterIndex]);

  // Audio animation frame loop for smooth time updates
  const updateLoop = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      setCurrentTimeMs(Math.round(audioRef.current.currentTime * 1000));
      rafRef.current = requestAnimationFrame(updateLoop);
    }
  }, []);

  const play = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(updateLoop);
    }).catch((err) => console.debug("[useChapterAudio] Play failed:", err));
  }, [updateLoop]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const seekToMs = useCallback((ms: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, ms / 1000);
    setCurrentTimeMs(ms);
  }, []);

  const seekToToken = useCallback((bIdx: number, sIdx: number, tIdx: number) => {
    if (!sync) return;
    const timeMs = findTokenTime(sync.words, bIdx, sIdx, tIdx);
    if (timeMs !== null) { seekToMs(timeMs); play(); }
  }, [sync, seekToMs, play]);

  const seekToSentence = useCallback((bIdx: number, sIdx: number) => {
    if (!sync) return;
    const timeMs = findSentenceTime(sync.sentences, bIdx, sIdx);
    if (timeMs !== null) { seekToMs(timeMs); play(); }
  }, [sync, seekToMs, play]);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTimeMs(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [sync]);

  const activeSentence = sync ? findActiveSentence(sync.sentences, currentTimeMs) : null;
  const activeWord = sync ? findActiveWord(sync.words, currentTimeMs) : null;

  // Auto-scroll effect when activeSentence changes
  useEffect(() => {
    if (!autoScroll || !isPlaying || !activeSentence) return;
    const el = document.querySelector(`[data-block="${activeSentence.bIdx}"] [data-sidx="${activeSentence.sIdx}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeSentence?.bIdx, activeSentence?.sIdx, autoScroll, isPlaying]);

  return {
    hasAudio: Boolean(sync),
    isPlaying,
    currentTimeMs,
    durationMs: sync?.duration_ms || 0,
    playbackRate,
    autoScroll,
    activeSentence,
    activeWord,
    play,
    pause,
    togglePlay,
    seekToMs,
    seekToToken,
    seekToSentence,
    setPlaybackRate,
    toggleAutoScroll: () => setAutoScroll((prev) => !prev),
  };
}
