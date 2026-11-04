import React, { useEffect, useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useImageProviderKey } from "@/hooks/useImageProviderKey";
import { clearImageCache, searchWordImages } from "@/lib/imageProviders";
import type { WordImage } from "@/types/image.types";
import type { TrackedLexiconEntry } from "@/types/reader.types";
import { WordImageKeyControl } from "./WordImageKeyControl";

interface WordImageSectionProps {
  entry: TrackedLexiconEntry;
}

/** Expandable word imagery sourced from registered image providers. */
export const WordImageSection: React.FC<WordImageSectionProps> = ({ entry }) => {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<WordImage[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);
  const { configured, save } = useImageProviderKey("pixabay");

  useEffect(() => {
    requestRef.current += 1;
    setOpen(false);
    setImages(null);
    setLoading(false);
    setError(null);
  }, [entry.id]);

  useEffect(
    () => () => {
      requestRef.current += 1;
    },
    []
  );

  const load = async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const rows = await searchWordImages(entry.lemma);
      if (requestId !== requestRef.current) return;
      setImages(rows);
    } catch {
      if (requestId !== requestRef.current) return;
      setError("Could not load images right now.");
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && images === null && !loading) void load();
  };

  const applyKey = (value: string) => {
    save(value);
    clearImageCache();
    setImages(null);
    if (open) void load();
  };

  return (
    <div className="border-t border-[#E2E2DF] pt-2.5">
      <button
        type="button"
        onClick={toggle}
        className={`flex w-full items-center justify-between border border-[#111111] px-2.5 py-1.5 font-mono text-xs font-bold cursor-pointer ${
          open ? "bg-[#B8FF01] text-[#111111]" : "bg-white text-[#111111] hover:bg-[#F4F4F2]"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5" />
          {open ? "HIDE IMAGES" : "SHOW IMAGES"}
        </span>
        <span className="text-[10px] font-normal text-[#666666]">
          {images ? `${images.length} found` : "VISUAL CONTEXT"}
        </span>
      </button>

      {open && (
        <div className="mt-2">
          {loading ? (
            <div className="grid grid-cols-2 gap-1.5">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="aspect-[4/3] animate-pulse border border-[#E2E2DF] bg-[#F4F4F2]"
                />
              ))}
            </div>
          ) : error ? (
            <div className="space-y-1.5 border border-[#E2E2DF] bg-[#F8F8F6] p-2.5 font-mono text-[11px] text-[#666666]">
              <div>{error}</div>
              <button
                type="button"
                onClick={() => void load()}
                className="border border-[#111111] bg-white px-2 py-1 text-[10px] font-bold text-[#111111] cursor-pointer"
              >
                RETRY
              </button>
            </div>
          ) : images && images.length > 0 ? (
            <div className="grid grid-cols-2 gap-1.5">
              {images.map((image) => (
                <a
                  key={image.id}
                  href={image.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={image.title}
                  className="group relative block overflow-hidden border border-[#111111] bg-[#F4F4F2]"
                >
                  <img
                    src={image.thumbnailUrl}
                    alt={`${entry.lemma}: ${image.title}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-1 top-1 border border-[#111111] bg-white/90 px-1 py-0.5 font-mono text-[9px] font-bold uppercase text-[#111111]">
                    {image.provider}
                  </span>
                  {image.author && (
                    <span className="absolute bottom-0 left-0 right-0 truncate bg-[#111111]/80 px-1 py-0.5 font-mono text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {image.author}
                    </span>
                  )}
                </a>
              ))}
            </div>
          ) : (
            <div className="border border-[#E2E2DF] bg-[#F8F8F6] p-2.5 font-mono text-[11px] text-[#666666]">
              No images found for «{entry.lemma}».
            </div>
          )}

          <WordImageKeyControl
            configured={configured}
            onSave={applyKey}
            onRemove={() => applyKey("")}
          />
        </div>
      )}
    </div>
  );
};
