import React from "react";
import { ScrollFadeX } from "@/components/ui/ScrollFadeX";
import type { CommandTag } from "@/types/filter.types";

interface CommandFilterBarProps {
  tags: CommandTag[];
  searchText: string;
  onSearchChange: (val: string) => void;
  onRemoveTag: (id: string) => void;
  onAddTag: (key: string, value: string) => void;
  onClearAll: () => void;
}

export const CommandFilterBar: React.FC<CommandFilterBarProps> = ({
  tags,
  searchText,
  onSearchChange,
  onRemoveTag,
  onAddTag,
  onClearAll,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchText.trim()) {
      const raw = searchText.trim();
      const parts = raw.split(":");
      if (parts.length === 2) {
        onAddTag(parts[0].trim(), parts[1].trim());
      } else {
        onAddTag("word", raw);
      }
      onSearchChange("");
    }
  };

  return (
    <div className="border border-[#111111] bg-white px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex items-center gap-2">
        <span className="mr-1 select-none font-mono text-sm font-bold text-[#111111]">/</span>
        <input
          type="text"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="add a word, title, author or filter (press Enter to pin tag)"
          className="min-w-0 flex-1 bg-transparent py-1 font-mono text-xs text-[#111111] placeholder-[#888888] outline-none"
        />
        {(tags.length > 0 || searchText.trim() !== "") && (
          <button
            type="button"
            onClick={onClearAll}
            className="shrink-0 font-mono text-xs text-[#666666] underline hover:text-[#111111] cursor-pointer"
          >
            clear all
          </button>
        )}
      </div>

      {tags.length > 0 && (
        <ScrollFadeX className="mt-2">
          <div className="flex w-max gap-2 py-0.5">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex max-w-[240px] items-center gap-1.5 bg-[#B8FF01] px-2.5 py-1 font-mono text-xs font-medium text-[#111111]"
              >
                <span className="truncate">
                  {tag.key}: {tag.value}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag.id)}
                  aria-label={`Remove ${tag.key}: ${tag.value}`}
                  className="shrink-0 px-0.5 font-bold leading-none cursor-pointer hover:opacity-60"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </ScrollFadeX>
      )}
    </div>
  );
};
