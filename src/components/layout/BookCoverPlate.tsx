import React, { useState } from "react";
import { resolveCoverArt } from "@/lib/coverArt";

interface BookCoverPlateProps {
  title: string;
  creator?: string;
  explicitUrl: string | null;
  level: string;
  size?: "mini" | "drawer" | "card" | "hero" | "showcase";
  badgeText?: string;
}

export const BookCoverPlate: React.FC<BookCoverPlateProps> = ({
  title,
  creator,
  explicitUrl,
  level,
  size = "card",
  badgeText,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const meta = resolveCoverArt(title, explicitUrl);
  const showFallback = !meta.coverUrl || imgFailed;

  const dims =
    size === "mini"
      ? "w-9 h-12 rounded-md ring-1 ring-slate-200/80 shadow-xs p-1"
      : size === "drawer"
      ? "w-16 h-24 rounded-xl ring-1 ring-slate-200/80 shadow-sm p-1.5"
      : size === "hero"
      ? "w-28 h-40 rounded-xl ring-1 ring-slate-200/80 shadow-md p-2.5"
      : size === "showcase"
      ? "h-56 w-full sm:h-auto sm:w-44 shrink-0 p-4"
      : "w-20 h-28 rounded-xl ring-1 ring-slate-200/80 shadow-sm p-2";

  return (
    <div
      className={`relative ${dims} shrink-0 overflow-hidden select-none flex flex-col justify-between`}
      style={{
        background: showFallback ? meta.coverGradient : "#F1F5F9",
        color: showFallback ? meta.coverAccent : "transparent",
      }}
    >
      {showFallback ? (
        size === "mini" ? (
          <div className="m-auto text-[10px] font-semibold text-white/90">{level}</div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-1">
              {badgeText ? (
                <span className="self-start rounded-full bg-black/30 px-2.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-xs">
                  {badgeText}
                </span>
              ) : (
                <span className="text-[10px] font-medium text-white/75">{level}</span>
              )}
            </div>
            <div>
              <div className={`font-serif leading-tight font-medium text-white line-clamp-3 ${size === "showcase" ? "text-lg" : "text-xs"}`}>
                {title}
              </div>
              {(creator || size === "hero") && (
                <div className="mt-1 text-xs leading-snug text-white/75 line-clamp-2">
                  {creator || level}
                </div>
              )}
            </div>
          </>
        )
      ) : (
        <>
          <img
            src={meta.coverUrl!}
            alt={title}
            loading={size === "hero" || size === "showcase" ? "eager" : "lazy"}
            decoding="async"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {badgeText && (
            <span className="relative z-10 self-start rounded-full bg-slate-900/65 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
              {badgeText}
            </span>
          )}
        </>
      )}
    </div>
  );
};
