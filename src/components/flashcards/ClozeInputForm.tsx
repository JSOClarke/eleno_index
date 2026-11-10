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
    if ((e.ctrlKey && e.key === "Enter") || (e.altKey && e.key.toLowerCase() === "r")) {
      e.preventDefault();
      onReveal();
      return;
    }
    if ((e.altKey && e.key.toLowerCase() === "h") || (e.ctrlKey && e.key.toLowerCase() === "h") || e.key === "F1") {
      e.preventDefault();
      onHint();
      return;
    }
    if (e.key === "Enter" && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      if (input.trim()) onSubmit();
    }
  };

  return (
    <div className="space-y-3 pt-2">
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
            className="w-full px-4 py-3 bg-white border border-[#111111] font-mono text-base text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:ring-1 focus:ring-[#111111] disabled:bg-[#F2F2F0] transition-colors"
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
          className="px-6 py-3 bg-[#111111] text-white hover:bg-[#B8FF01] hover:text-[#111111] font-mono text-xs font-bold border border-[#111111] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center gap-2"
        >
          <span>CHECK</span>
          <kbd className="bg-[#222222] text-[#B8FF01] border-[#444444] px-1 py-0.5 text-[9px] font-mono">ENTER</kbd>
        </button>
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-[#888888] pt-1">
        <div>
          {!hintRevealed ? (
            <button
              type="button"
              disabled={disabled}
              onClick={onHint}
              title="Shortcut: Alt+H or F1"
              className="inline-flex items-center gap-1.5 hover:text-[#111111] cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hint</span>
              <kbd className="px-1.5 py-0.5 bg-[#F4F4F2] border border-[#D4D4D0] text-[10px]">Alt+H</kbd>
            </button>
          ) : (
            <span className="text-[#111111] font-semibold">Hint revealed</span>
          )}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={onReveal}
          title="Shortcut: Ctrl+Enter"
          className="inline-flex items-center gap-1.5 hover:text-[#111111] cursor-pointer"
        >
          <Key className="w-3.5 h-3.5" />
          <span>Reveal</span>
          <kbd className="px-1.5 py-0.5 bg-[#F4F4F2] border border-[#D4D4D0] text-[10px]">Ctrl+Enter</kbd>
        </button>
      </div>
    </div>
  );
};
