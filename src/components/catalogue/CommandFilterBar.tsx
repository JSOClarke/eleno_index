import React from "react";
import { Search, X } from "lucide-react";
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
  tags, searchText, onSearchChange, onRemoveTag, onAddTag, onClearAll,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchText.trim()) {
      const raw = searchText.trim();
      const parts = raw.split(":");
      if (parts.length === 2) onAddTag(parts[0].trim(), parts[1].trim());
      else onAddTag("word", raw);
      onSearchChange("");
    }
  };

  return (
    <div className="relative flex items-center">
      <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[#5A595C]" strokeWidth={2.2} />
      <input
        type="text"
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search titles, authors, or words (Enter to pin)"
        className="w-full h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-14 text-xs font-medium text-[#040404] placeholder:text-[#5A595C] outline-none shadow-xs transition focus:border-slate-900"
      />
      {(tags.length > 0 || searchText.trim() !== "") && (
        <button
          type="button"
          onClick={onClearAll}
          className="absolute right-2.5 rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#5A595C] hover:bg-slate-100 hover:text-[#040404] cursor-pointer transition"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export const PinnedFilterTags: React.FC<{
  tags: CommandTag[];
  onRemoveTag: (id: string) => void;
}> = ({ tags, onRemoveTag }) => {
  if (tags.length === 0) return null;
  return (
    <ScrollFadeX>
      <div className="flex w-max items-center gap-2 py-0.5">
        {tags.map((tag) => (
          <span key={tag.id} className="inline-flex max-w-[240px] items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            <span className="truncate"><span className="opacity-70">{tag.key}:</span> {tag.value}</span>
            <button type="button" onClick={() => onRemoveTag(tag.id)} aria-label={`Remove ${tag.key}: ${tag.value}`}
              className="shrink-0 rounded-full p-0.5 hover:bg-white/20 cursor-pointer transition">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </ScrollFadeX>
  );
};
