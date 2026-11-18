import React, { useMemo, useState } from "react";
import type { MediaCatalogItem } from "@/types/media.types";
import { ReadflowMediaCard } from "./ReadflowMediaCard";

interface ReadflowCatalogSectionProps {
  items: MediaCatalogItem[];
  loading: boolean;
  searchQuery: string;
  savedIds: Set<string>;
  onToggleSaved: (id: string) => void;
}

type FormatGroup = "all" | "book" | "visual" | "video" | "audio";
type SortMode = "comprehension" | "unknowns" | "tokens" | "title";

const FORMAT_PILLS: Array<{ id: FormatGroup; label: string }> = [
  { id: "all", label: "All Formats" },
  { id: "book", label: "Novels & Books" },
  { id: "visual", label: "Manga & Comics" },
  { id: "video", label: "Video & Subtitles" },
  { id: "audio", label: "Audio & Podcasts" },
];

const PAGE_SIZE = 12;

const matchesFormat = (type: string, fmt: FormatGroup): boolean => {
  if (fmt === "book") return type === "book" || type === "article";
  if (fmt === "visual") return type === "manga" || type === "comic";
  if (fmt === "video") return type === "movie" || type === "tv_show" || type === "tv_episode";
  if (fmt === "audio") return type === "podcast";
  return true;
};

export const ReadflowCatalogSection: React.FC<ReadflowCatalogSectionProps> = ({
  items, loading, searchQuery, savedIds, onToggleSaved,
}) => {
  const [format, setFormat] = useState<FormatGroup>("all");
  const [sortBy, setSortBy] = useState<SortMode>("comprehension");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const arr = items.filter((it) => matchesFormat(it.type, format) && (!q || `${it.title} ${it.creator}`.toLowerCase().includes(q)));
    arr.sort((a, b) => {
      const covA = a.comprehension?.text_coverage_percentage ?? a.comprehension?.comprehension_percentage ?? -1;
      const covB = b.comprehension?.text_coverage_percentage ?? b.comprehension?.comprehension_percentage ?? -1;
      if (sortBy === "comprehension") return covB - covA;
      if (sortBy === "unknowns") {
        const unkA = a.comprehension ? a.comprehension.total_words - a.comprehension.known_words : 1e9;
        const unkB = b.comprehension ? b.comprehension.total_words - b.comprehension.known_words : 1e9;
        return unkA - unkB;
      }
      if (sortBy === "tokens") return (b.metrics?.total_tokens ?? 0) - (a.metrics?.total_tokens ?? 0);
      return a.title.localeCompare(b.title);
    });
    return arr;
  }, [items, format, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <section id="media-catalog" className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#ECECEF]">
        <div className="flex flex-wrap items-center gap-1.5">
          {FORMAT_PILLS.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => { setFormat(pill.id); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-colors cursor-pointer ${
                format === pill.id ? "bg-[#040404] text-white" : "bg-white border border-[#ECECEF] text-[#5A595C] hover:text-[#040404]"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#5A595C]">{sorted.length} titles</span>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as SortMode); setPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#ECECEF] text-[12px] font-bold text-[#040404] focus:outline-none focus:border-[#040404]"
          >
            <option value="comprehension">Highest Comprehension %</option>
            <option value="unknowns">Fewest Unknowns</option>
            <option value="tokens">Total Token Volume</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-48 rounded-3xl bg-white border border-[#ECECEF] animate-pulse" />
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-white border border-[#ECECEF] p-10 text-center text-sm text-[#5A595C]">
          No titles match your current filter.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {paged.map((item) => (
            <ReadflowMediaCard key={item.id} item={item} isSaved={savedIds.has(item.id)} onToggleSaved={onToggleSaved} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#ECECEF] text-[12px] font-bold text-[#040404] disabled:opacity-40 cursor-pointer">
            Previous
          </button>
          <span className="text-[12px] font-semibold text-[#5A595C] px-2">Page {safePage} of {totalPages}</span>
          <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#ECECEF] text-[12px] font-bold text-[#040404] disabled:opacity-40 cursor-pointer">
            Next
          </button>
        </div>
      )}
    </section>
  );
};
