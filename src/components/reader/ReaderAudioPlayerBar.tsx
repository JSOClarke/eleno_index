import React from "react";
import { Play, Pause, RotateCcw, ArrowDownCircle } from "lucide-react";

interface ReaderAudioPlayerBarProps {
  hasAudio: boolean;
  isPlaying: boolean;
  currentTimeMs: number;
  durationMs: number;
  playbackRate: number;
  autoScroll: boolean;
  onTogglePlay: () => void;
  onSeekMs: (ms: number) => void;
  onChangeRate: (rate: number) => void;
  onToggleAutoScroll: () => void;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export const ReaderAudioPlayerBar: React.FC<ReaderAudioPlayerBarProps> = ({
  hasAudio,
  isPlaying,
  currentTimeMs,
  durationMs,
  playbackRate,
  autoScroll,
  onTogglePlay,
  onSeekMs,
  onChangeRate,
  onToggleAutoScroll,
}) => {
  if (!hasAudio || durationMs <= 0) return null;

  const cycleRate = () => {
    if (playbackRate === 1.0) onChangeRate(1.25);
    else if (playbackRate === 1.25) onChangeRate(0.75);
    else onChangeRate(1.0);
  };

  const progressPct = Math.min(100, Math.max(0, (currentTimeMs / durationMs) * 100));

  return (
    <div className="fixed bottom-14 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl bg-white border border-[#111111] shadow-[3px_3px_0px_0px_#111111] px-4 py-2.5 transition-all">
      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          type="button"
          onClick={onTogglePlay}
          className="w-8 h-8 flex items-center justify-center bg-[#111111] text-white hover:bg-[#B8FF01] hover:text-[#111111] transition-colors shrink-0 cursor-pointer"
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
        </button>

        {/* Time display */}
        <span className="font-mono text-[11px] tabular-nums text-[#444444] shrink-0 select-none">
          {formatTime(currentTimeMs)} / {formatTime(durationMs)}
        </span>

        {/* Scrubber */}
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={durationMs}
            value={currentTimeMs}
            onChange={(e) => onSeekMs(Number(e.target.value))}
            className="w-full h-1.5 bg-[#E8E8E4] accent-[#111111] cursor-pointer"
          />
        </div>

        {/* Replay 5s */}
        <button
          type="button"
          onClick={() => onSeekMs(Math.max(0, currentTimeMs - 5000))}
          className="p-1 text-[#666666] hover:text-[#111111] cursor-pointer"
          title="Back 5s"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Speed button */}
        <button
          type="button"
          onClick={cycleRate}
          className="font-mono text-[10px] font-bold px-1.5 py-0.5 border border-[#CCCCCC] hover:border-[#111111] text-[#333333] cursor-pointer select-none"
          title="Playback speed"
        >
          {playbackRate}x
        </button>

        {/* Auto-scroll toggle */}
        <button
          type="button"
          onClick={onToggleAutoScroll}
          className={`flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 border cursor-pointer select-none ${
            autoScroll
              ? "bg-[#B8FF01] text-[#111111] border-[#9FE000]"
              : "bg-white text-[#888888] border-[#CCCCCC]"
          }`}
          title={autoScroll ? "Auto-scroll ON" : "Auto-scroll OFF"}
        >
          <ArrowDownCircle className="w-3 h-3" />
          <span className="hidden sm:inline">SYNC</span>
        </button>
      </div>
    </div>
  );
};
