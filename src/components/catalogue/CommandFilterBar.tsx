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
    <div className="pt-4 pb-6 border-b border-[#ECECEF] text-center space-y-5">
      <h1 className="font-editorial text-[44px] sm:text-[66px] md:text-[78px] text-[#040404] max-w-4xl mx-auto">
        Track your real
        <br className="hidden sm:inline" />
        {" "}comprehension across native media
      </h1>

      <p className="text-[14px] sm:text-[15px] text-[#5A595C] max-w-2xl mx-auto leading-relaxed">
        Compare your known vocabulary against novels, manga, and scripts before you read or watch.
      </p>

      <div className="max-w-2xl mx-auto relative flex items-center">
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#5A595C]" strokeWidth={2.2} />
        <input
          type="text"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search titles, authors, or words (Enter to pin)"
          className="w-full h-11 rounded-xl border border-[#ECECEF] bg-white pl-10 pr-16 text-[13px] font-medium text-[#040404] placeholder:text-[#5A595C] outline-none transition focus:border-[#040404]"
        />
        {(tags.length > 0 || searchText.trim() !== "") && (
          <button
            type="button"
            onClick={onClearAll}
            className="absolute right-3 rounded-full px-2.5 py-0.5 text-xs font-semibold text-[#5A595C] hover:bg-[#FAFAFA] hover:text-[#040404] cursor-pointer transition"
          >
            Clear
          </button>
        )}
      </div>

      {tags.length > 0 && (
        <div className="max-w-2xl mx-auto text-left">
          <ScrollFadeX>
            <div className="flex w-max items-center gap-2 py-0.5">
              {tags.map((tag) => (
                <span key={tag.id} className="inline-flex max-w-[240px] items-center gap-1.5 rounded-full bg-[#D8D6FA]/60 px-3 py-1 text-xs font-semibold text-[#040404]">
                  <span className="truncate"><span className="opacity-65">{tag.key}:</span> {tag.value}</span>
                  <button type="button" onClick={() => onRemoveTag(tag.id)} aria-label={`Remove ${tag.key}: ${tag.value}`}
                    className="shrink-0 rounded-full p-0.5 hover:bg-white/60 cursor-pointer transition">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </ScrollFadeX>
        </div>
      )}
    </div>
  );
};
