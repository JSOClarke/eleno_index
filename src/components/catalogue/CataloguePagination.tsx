import React from "react";

interface CataloguePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) pages.push("...");
  for (let p = left; p <= right; p++) {
    pages.push(p);
  }
  if (right < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export const CataloguePagination: React.FC<CataloguePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);
  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#111111] bg-white px-4 py-3 font-mono text-xs">
      <div className="text-[#555555]">
        Showing <span className="font-bold text-[#111111]">{startItem}–{endItem}</span> of{" "}
        <span className="font-bold text-[#111111]">{totalItems}</span> works
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="border border-[#111111] bg-white px-2.5 py-1 font-bold text-[#111111] hover:bg-[#F4F4F2] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          ← Prev
        </button>

        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-1.5 text-[#777777]">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`border px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                p === currentPage
                  ? "border-[#111111] bg-[#B8FF01] text-[#111111] shadow-[2px_2px_0px_#111111]"
                  : "border-[#CCCCCC] bg-white text-[#111111] hover:border-[#111111]"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="border border-[#111111] bg-white px-2.5 py-1 font-bold text-[#111111] hover:bg-[#F4F4F2] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          Next →
        </button>
      </div>
    </div>
  );
};
