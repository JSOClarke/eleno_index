import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import type { MediaCatalogItem } from "@/types/media.types";

const LOADED_POSTER_URLS = new Set<string>();

interface ReadflowMediaCardProps {
  item: MediaCatalogItem;
  isSaved: boolean;
  onToggleSaved: (id: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  book: "Novel", manga: "Manga", comic: "Comic", movie: "Movie",
  tv_show: "TV Show", tv_episode: "Episode", podcast: "Audio", article: "Article",
};

export const ReadflowMediaCard: React.FC<ReadflowMediaCardProps> = ({ item, isSaved, onToggleSaved }) => {
  const cov = item.comprehension?.text_coverage_percentage ?? item.comprehension?.comprehension_percentage ?? 0;
  const uniqCov = item.comprehension?.comprehension_percentage ?? 0;
  const isReady = cov >= 95;
  const badgeBg = isReady ? "bg-[#E2F59B]" : "bg-[#D8D6FA]";
  const totalWords = item.comprehension?.total_words ?? item.metrics?.unique_words_count ?? 0;
  const knownWords = item.comprehension?.known_words ?? 0;
  const unknowns = item.comprehension ? Math.max(0, totalWords - knownWords) : totalWords;
  const totalTokens = item.metrics?.total_tokens ?? 0;
  const uniqueLemmas = item.metrics?.unique_words_count ?? 0;
  const hapax = item.metrics?.hapax_percentage;
  const avgSent = item.metrics?.mean_sentence_length;
  const cefr = item.metrics?.cefr_level ?? "—";
  const langCode = (item.language || "es").toUpperCase();
  const englishTitle = item.work_title || item.title;
  const targetTitle = item.work_title && item.title !== item.work_title ? item.title : null;
  const [imgLoaded, setImgLoaded] = useState(() => Boolean(item.cover_image_url && LOADED_POSTER_URLS.has(item.cover_image_url)));
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const u = item.cover_image_url;
    if (u && LOADED_POSTER_URLS.has(u)) { setImgLoaded(true); return; }
    const el = imgRef.current;
    const ready = Boolean(el && el.complete && el.naturalWidth > 0);
    if (ready && u) LOADED_POSTER_URLS.add(u);
    setImgLoaded(ready);
  }, [item.cover_image_url]);

  return (
    <article className="group bg-white rounded-3xl border border-[#ECECEF] overflow-hidden flex flex-col sm:flex-row transition-transform duration-200 hover:-translate-y-0.5">
      <div className="poster-frame w-full sm:w-[38%] aspect-[3/2] sm:aspect-auto sm:min-h-[268px] shrink-0 border-b sm:border-b-0 sm:border-r border-[#ECECEF] relative">
        <Link to={`/preview/media/${item.id}`} className="block w-full h-full">
          {item.cover_image_url ? (
            <>
              {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-[#18181B]" />}
              <img ref={imgRef} src={item.cover_image_url} alt={item.title} loading="lazy" decoding="async"
                onLoad={() => { if (item.cover_image_url) LOADED_POSTER_URLS.add(item.cover_image_url); setImgLoaded(true); }}
                className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.03] ${imgLoaded ? "opacity-100" : "opacity-0"}`} />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-[#18181B] to-[#09090B]">
              <span className="font-editorial text-4xl text-white/80 text-center leading-tight line-clamp-3">{item.title}</span>
            </div>
          )}
        </Link>

        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#040404]/85 text-white backdrop-blur-md text-[11px] font-bold tracking-wide border border-white/15">
            {langCode} · {TYPE_LABELS[item.type] || item.type}
          </span>
        </div>

        <button type="button" onClick={() => onToggleSaved(item.id)} aria-label={isSaved ? "Remove bookmark" : "Save title"}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-[#040404]/70 text-white backdrop-blur-md border border-white/15 hover:bg-[#040404] cursor-pointer">
          <Bookmark className="w-3.5 h-3.5" fill={isSaved ? "currentColor" : "none"} />
        </button>

        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg ${badgeBg} text-[#040404] text-[11px] font-extrabold`}>
            {cefr !== "—" ? `${cefr} Level` : isReady ? "Ready" : "Stretch"}
          </span>
        </div>
      </div>

      <div className="w-full sm:w-[62%] p-5 sm:p-6 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-[#5A595C] font-semibold truncate">
                {targetTitle ? `${targetTitle} · ${item.creator || "Unknown author"}` : item.creator || "Unknown author"}
              </p>
              <Link to={`/preview/media/${item.id}`} className="block">
                <h3 className="font-editorial text-3xl sm:text-[34px] text-[#040404] mt-0.5 leading-[0.98] line-clamp-2 group-hover:underline">
                  {englishTitle}
                </h3>
              </Link>
            </div>

            <div className="text-right shrink-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A595C]">Coverage</span>
              <span className="font-editorial text-3xl sm:text-[36px] leading-none text-[#040404] mt-0.5 block">
                {item.comprehension ? `${cov.toFixed(1)}%` : "—"}
              </span>
              <div className="w-20 h-1.5 bg-[#FAFAFA] rounded-full overflow-hidden mt-1 ml-auto">
                <div className={`h-full ${isReady ? "bg-[#040404]" : "bg-[#9A99F6]"} rounded-full`} style={{ width: `${Math.min(100, Math.max(0, cov))}%` }} />
              </div>
              <div className="mt-1.5 flex items-center justify-end gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#5A595C]">Unique</span>
                <span className="text-[11px] font-extrabold text-[#040404]">{item.comprehension ? `${uniqCov.toFixed(1)}%` : "—"}</span>
              </div>
              <div className="w-20 h-1 bg-[#FAFAFA] rounded-full overflow-hidden mt-0.5 ml-auto">
                <div className="h-full bg-[#D8D6FA] rounded-full" style={{ width: `${Math.min(100, Math.max(0, uniqCov))}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-[#ECECEF] grid grid-cols-4 divide-x divide-[#E5E5E5] text-center sm:text-left">
            <div className="pr-2"><span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A595C]">Tokens</span>
              <span className="text-[12px] sm:text-[13px] font-extrabold text-[#040404] mt-0.5 block">{totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : totalTokens}</span></div>
            <div className="px-2.5"><span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A595C]">Lemmas</span>
              <span className="text-[12px] sm:text-[13px] font-extrabold text-[#040404] mt-0.5 block">{uniqueLemmas.toLocaleString()}</span></div>
            <div className="px-2.5"><span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A595C]">Hapax</span>
              <span className="text-[12px] sm:text-[13px] font-extrabold text-[#040404] mt-0.5 block">{hapax != null ? `${hapax.toFixed(1)}%` : "—"}</span></div>
            <div className="pl-2.5"><span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A595C]">Avg Sent.</span>
              <span className="text-[12px] sm:text-[13px] font-extrabold text-[#040404] mt-0.5 block">{avgSent != null ? `${avgSent.toFixed(0)}w` : "—"}</span></div>
          </div>
        </div>

        <div className="pt-3.5 border-t border-[#ECECEF] flex flex-wrap items-center justify-between gap-2.5">
          <span className={`inline-block px-2.5 py-1 rounded-lg ${badgeBg} text-[#040404] text-[11px] font-extrabold`}>
            {cov >= 98 ? "98% Effortless Flow" : `${unknowns.toLocaleString()} unknown lemmas`}
          </span>

          <Link to={`/preview/media/${item.id}`} className="lexya-btn">
            <span>Inspect Corpus</span>
            <span className="lexya-btn-icon"><ArrowUpRight className="w-3 h-3" strokeWidth={2.5} /></span>
          </Link>
        </div>
      </div>
    </article>
  );
};
