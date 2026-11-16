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
    <div className="space-y-3 pt-1">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-slate-900">
            Find Your Next Match
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Compare vocabulary comfort, linguistic stats, and synopses before you read or watch.
          </p>
        </div>

        <div className="relative flex w-full items-center md:w-[420px]">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search titles, authors, or words (Enter to pin)"
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-16 text-sm text-slate-900 placeholder-slate-400 shadow-xs outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />
          {(tags.length > 0 || searchText.trim() !== "") && (
            <button
              type="button"
              onClick={onClearAll}
              className="absolute right-3 rounded-full px-2 py-0.5 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <ScrollFadeX>
          <div className="flex w-max items-center gap-2 py-0.5">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex max-w-[240px] items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200/80"
              >
                <span className="truncate">
                  <span className="opacity-65">{tag.key}:</span> {tag.value}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag.id)}
                  aria-label={`Remove ${tag.key}: ${tag.value}`}
                  className="shrink-0 rounded-full p-0.5 hover:bg-indigo-100 cursor-pointer transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </ScrollFadeX>
      )}
    </div>
  );
};
