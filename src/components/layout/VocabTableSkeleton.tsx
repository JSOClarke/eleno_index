import React from "react";

interface VocabTableSkeletonProps {
  rows?: number;
  variant?: "primer" | "known";
}

export const VocabTableSkeleton: React.FC<VocabTableSkeletonProps> = ({
  rows = 8,
  variant = "primer",
}) => {
  return (
    <div className="divide-y divide-[#E2E2DF]">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="grid grid-cols-12 gap-3 px-4 py-3 items-center animate-pulse"
        >
          {/* Lemma */}
          <div className={variant === "known" ? "col-span-3" : "col-span-2"}>
            <div className="h-3.5 w-24 bg-[#DFDFDC]" />
          </div>
          {/* IPA */}
          <div className="col-span-2">
            <div className="h-3 w-20 bg-[#EAEAE6]" />
          </div>
          {/* POS */}
          <div className="col-span-1">
            <div className="h-3 w-10 bg-[#EAEAE6]" />
          </div>
          {/* CEFR */}
          <div className="col-span-1">
            <div className="h-5 w-7 border border-[#CCCCCC] bg-[#F4F4F2]" />
          </div>
          {variant === "primer" ? (
            <>
              {/* Book Freq */}
              <div className="col-span-1">
                <div className="h-3 w-8 bg-[#EAEAE6]" />
              </div>
              {/* TubeLex Rank */}
              <div className="col-span-1">
                <div className="h-3 w-12 bg-[#DFDFDC]" />
              </div>
              {/* Debut Chapter */}
              <div className="col-span-2">
                <div className="h-3 w-28 bg-[#EAEAE6]" />
              </div>
            </>
          ) : (
            <>
              {/* TubeLex Rank */}
              <div className="col-span-2">
                <div className="h-3 w-14 bg-[#DFDFDC]" />
              </div>
              {/* Added Date */}
              <div className="col-span-1">
                <div className="h-3 w-14 bg-[#EAEAE6]" />
              </div>
            </>
          )}
          {/* Actions (Quote + Mark Known) */}
          <div className="col-span-2 flex items-center justify-end gap-1.5">
            <div className="h-6 w-6 border border-[#CCCCCC] bg-[#F4F4F2]" />
            <div className="h-6 w-20 border border-[#CCCCCC] bg-[#EAEAE6]" />
          </div>
        </div>
      ))}
    </div>
  );
};
