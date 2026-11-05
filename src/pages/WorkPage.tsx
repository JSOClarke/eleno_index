import React from "react";
import { Link, useParams } from "react-router-dom";
import { BookCoverPlate } from "@/components/layout/BookCoverPlate";
import { formatCompactWords } from "@/lib/formatters";
import { READABLE_LANGUAGES } from "@/lib/catalogueLanguages";
import type { MediaCatalogItem } from "@/types/media.types";

interface WorkPageProps {
  items: MediaCatalogItem[];
  loading: boolean;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

export const WorkPage: React.FC<WorkPageProps> = ({
  items,
  loading,
  isAuthenticated,
  onRequireAuth,
}) => {
  const { workId } = useParams<{ workId: string }>();
  const work = items.find((item) => item.work_id === workId);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center font-mono text-xs text-[#666666]">
        Loading work...
      </div>
    );
  }

  if (!work) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-20 text-center">
        <p className="font-mono text-xs text-[#666666]">Work not found.</p>
        <Link to="/" className="font-mono text-xs font-bold underline">
          Back to catalogue
        </Link>
      </div>
    );
  }

  const editions = work.editions?.length ? work.editions : [work];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/" className="font-mono text-xs text-[#111111] hover:underline">
        ← Back to Catalogue
      </Link>

      <div className="flex items-start gap-5 border-b border-[#111111] pb-5">
        <BookCoverPlate
          title={work.work_title || work.title}
          explicitUrl={work.cover_image_url}
          level={work.metrics?.cefr_level || "B1"}
          size="card"
        />
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
            {work.work_title || work.title}
          </h1>
          <div className="font-mono text-xs text-[#666666]">
            {work.creator} · {work.type.replace("_", " ").toUpperCase()} · {String(work.work_language || work.language).toUpperCase()}
          </div>
          <p className="max-w-2xl font-serif text-sm italic leading-relaxed text-[#333333]">
            {work.sampleSnippet}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#666666]">
          Editions ({editions.length})
        </div>
        {editions.map((edition) => {
          const level = edition.metrics?.cefr_level || "B1";
          const canRead = READABLE_LANGUAGES.has(edition.language);
          return (
            <div
              key={edition.id}
              className="flex flex-wrap items-center gap-3 border border-[#111111] bg-white px-3 py-2.5"
            >
              <span className="w-8 border border-[#111111] bg-[#F8F8F6] px-1 py-0.5 text-center font-mono text-[10px] font-bold">
                {edition.language.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[#111111]">{edition.title}</div>
                <div className="truncate font-mono text-[11px] text-[#666666]">
                  {String(edition.format).toUpperCase()} · {formatCompactWords(edition.metrics?.total_tokens || 0)} ·{" "}
                  {level} · F-H {(edition.metrics?.readability_score || 70).toFixed(1)}
                </div>
              </div>
              {canRead ? (
                isAuthenticated ? (
                  <Link
                    to={`/read/${edition.id}`}
                    className="border border-[#111111] bg-[#B8FF01] px-2.5 py-1 font-mono text-xs font-bold"
                  >
                    Read →
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={onRequireAuth}
                    className="border border-[#111111] bg-[#B8FF01] px-2.5 py-1 font-mono text-xs font-bold cursor-pointer"
                  >
                    Sign in to read
                  </button>
                )
              ) : (
                <span className="font-mono text-[10px] text-[#777777]">Reader pending</span>
              )}
              <Link
                to={`/media/${edition.id}`}
                className="border border-[#111111] bg-white px-2.5 py-1 font-mono text-xs font-bold"
              >
                Inspect →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
