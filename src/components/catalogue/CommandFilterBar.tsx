import React from "react";
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
    <div className="border border-[#111111] px-4 py-3 flex flex-wrap items-center gap-2 bg-white">
      <span className="font-mono text-sm font-bold text-[#111111] mr-1 select-none">
        /
      </span>

      {tags.map((tag) => (
        <span
          key={tag.id}
          className="bg-[#B8FF01] text-[#111111] font-mono text-xs font-medium px-2.5 py-1 inline-flex items-center gap-2"
        >
          <span>
            {tag.key}: {tag.value}
          </span>
          <button
            type="button"
            onClick={() => onRemoveTag(tag.id)}
            className="hover:opacity-60 font-bold leading-none cursor-pointer"
          >
            ×
          </button>
        </span>
      ))}

      <input
        type="text"
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="add a word, title, author or filter (press Enter to pin tag)"
        className="flex-1 min-w-[240px] font-mono text-xs text-[#111111] placeholder-[#888888] outline-none bg-transparent py-1"
      />

      {(tags.length > 0 || searchText.trim() !== "") && (
        <button
          type="button"
          onClick={onClearAll}
          className="font-mono text-xs text-[#666666] hover:text-[#111111] underline cursor-pointer"
        >
          clear all
        </button>
      )}
    </div>
  );
};
