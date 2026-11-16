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
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="grid grid-cols-12 gap-3 px-4 py-3 items-center animate-pulse"
        >
          <div className={variant === "known" ? "col-span-3" : "col-span-2"}>
            <div className="h-3.5 w-24 rounded bg-slate-200" />
          </div>
          <div className="col-span-2">
            <div className="h-3 w-20 rounded bg-slate-100" />
          </div>
          <div className="col-span-1">
            <div className="h-3 w-10 rounded bg-slate-100" />
          </div>
          <div className="col-span-1">
            <div className="h-5 w-8 rounded-full bg-slate-100" />
          </div>
          {variant === "primer" ? (
            <>
              <div className="col-span-1">
                <div className="h-3 w-8 rounded bg-slate-100" />
              </div>
              <div className="col-span-1">
                <div className="h-3 w-12 rounded bg-slate-200" />
              </div>
              <div className="col-span-2">
                <div className="h-3 w-28 rounded bg-slate-100" />
              </div>
            </>
          ) : (
            <>
              <div className="col-span-2">
                <div className="h-3 w-14 rounded bg-slate-200" />
              </div>
              <div className="col-span-1">
                <div className="h-3 w-14 rounded bg-slate-100" />
              </div>
            </>
          )}
          <div className="col-span-2 flex items-center justify-end gap-1.5">
            <div className="h-6 w-6 rounded-lg bg-slate-100" />
            <div className="h-6 w-20 rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
};
