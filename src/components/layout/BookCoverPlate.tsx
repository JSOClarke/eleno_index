import React, { useState, useEffect } from "react";
import { resolveCoverArt } from "@/lib/coverArt";

interface BookCoverPlateProps {
  title: string;
  explicitUrl: string | null;
  level: string;
  size?: "mini" | "drawer" | "card" | "hero";
}

// Keep decoded HTMLImageElement instances pinned in memory so route transitions never re-decode
const pinnedImages = new Map<string, HTMLImageElement>();

function pinImageInMemory(url: string) {
  if (!url || pinnedImages.has(url)) return;
  const img = new Image();
  img.decoding = "sync";
  img.src = url;
  pinnedImages.set(url, img);
}

export const BookCoverPlate: React.FC<BookCoverPlateProps> = ({
  title,
  explicitUrl,
  level,
  size = "card",
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const meta = resolveCoverArt(title, explicitUrl);
  const showFallback = !meta.coverUrl || imgFailed;

  useEffect(() => {
    if (meta.coverUrl) {
      pinImageInMemory(meta.coverUrl);
    }
  }, [meta.coverUrl]);

  const dims =
    size === "mini"
      ? "w-8 h-11 shadow-[1px_1px_0px_#111111]"
      : size === "drawer"
      ? "w-16 h-24 shadow-[2px_2px_0px_#111111]"
      : size === "hero"
      ? "w-24 h-36 shadow-[3px_3px_0px_#111111]"
      : "w-20 h-28 shadow-[2px_2px_0px_#111111]";

  return (
    <div
      className={`relative ${dims} shrink-0 border border-[#111111] overflow-hidden select-none flex flex-col justify-between p-1.5`}
      style={{
        backgroundColor: showFallback ? meta.coverBg : "#F4F4F2",
        color: showFallback ? meta.coverAccent : "transparent",
      }}
    >
      {showFallback ? (
        <>
          <div className="font-mono text-[8px] leading-none tracking-tighter opacity-90 flex justify-between">
            <span>{meta.coverCode}</span>
            <span>{level}</span>
          </div>
          <div className="font-serif text-[9px] leading-tight font-bold text-white line-clamp-3">
            {size === "mini" ? "" : title}
          </div>
          <div className="font-mono text-[7px] leading-none uppercase tracking-wider text-white/75 truncate">
            {size === "mini" ? level : "SALAMANCA"}
          </div>
        </>
      ) : (
        <img
          src={meta.coverUrl!}
          alt={title}
          decoding="sync"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
      )}
    </div>
  );
};
