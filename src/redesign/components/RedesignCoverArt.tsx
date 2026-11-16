import React, { useState } from "react";
import { resolveCoverArt } from "@/lib/coverArt";

interface RedesignCoverArtProps {
  title: string;
  creator: string;
  explicitUrl: string | null;
  badgeLabel: string;
}

export const RedesignCoverArt: React.FC<RedesignCoverArtProps> = ({
  title,
  creator,
  explicitUrl,
  badgeLabel,
}) => {
  const [imgError, setImgError] = useState(false);
  const coverMeta = resolveCoverArt(title, explicitUrl);
  const showFallback = !coverMeta.coverUrl || imgError;

  return (
    <div
      className="relative h-56 w-full sm:h-auto sm:w-44 shrink-0 overflow-hidden flex flex-col justify-between p-4 select-none"
      style={{ backgroundColor: showFallback ? coverMeta.coverBg : "#F1F5F9" }}
    >
      {showFallback ? (
        <>
          <span className="self-start rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
            {badgeLabel}
          </span>
          <div>
            <div className="font-serif text-lg font-semibold leading-tight text-white line-clamp-3">
              {title}
            </div>
            <div className="mt-1 text-xs text-white/75">{creator}</div>
          </div>
        </>
      ) : (
        <>
          <img
            src={coverMeta.coverUrl!}
            alt={title}
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <span className="relative z-10 self-start rounded-full bg-slate-900/65 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-xs">
            {badgeLabel}
          </span>
        </>
      )}
    </div>
  );
};
