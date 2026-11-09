import React, { useEffect, useRef } from "react";
import { HelpCircle, Key, ArrowRight } from "lucide-react";

interface ClozeInputFormProps {
  input: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onReveal: () => void;
  onHint: () => void;
  hintRevealed: boolean;
  firstLetter: string;
  wordLength: number;
  disabled: boolean;
}

export const ClozeInputForm: React.FC<ClozeInputFormProps> = ({
  input,
  onChange,
  onSubmit,
  onReveal,
  onHint,
  hintRevealed,
  firstLetter,
  wordLength,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim()) onSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={input}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type the missing Spanish word..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full px-4 py-3 bg-white border-2 border-[#111111] font-mono text-base sm:text-lg font-medium text-[#111111] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#B8FF01] disabled:bg-[#F2F2F0] disabled:text-[#777777] transition-all"
          />
          {hintRevealed && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[#666666] bg-[#F2F2F0] px-2 py-1 border border-[#CCCCCC]">
              Starts with <span className="text-[#111111]">{firstLetter.toUpperCase()}</span> ({wordLength} letters)
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={disabled || !input.trim()}
          onClick={onSubmit}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#111111] text-[#B8FF01] font-mono text-sm font-bold border-2 border-[#111111] hover:bg-[#222222] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <span>CHECK</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-[#666666] pt-1">
        <div className="flex items-center gap-2">
          {!hintRevealed ? (
            <button
              type="button"
              disabled={disabled}
              onClick={onHint}
              className="inline-flex items-center gap-1 text-[#666666] hover:text-[#111111] cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Letter hint</span>
            </button>
          ) : (
            <span className="text-[#111111] font-semibold">Hint shown</span>
          )}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={onReveal}
          className="inline-flex items-center gap-1 text-[#888888] hover:text-[#111111] cursor-pointer"
        >
          <Key className="w-3.5 h-3.5" />
          <span>Reveal answer</span>
        </button>
      </div>
    </div>
  );
};
