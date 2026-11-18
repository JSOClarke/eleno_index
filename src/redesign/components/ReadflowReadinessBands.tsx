import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import type { MediaCatalogItem } from "@/types/media.types";

interface ReadflowReadinessBandsProps {
  items: MediaCatalogItem[];
}

interface BandConfig {
  id: "effortless" | "sweetspot" | "intensive";
  title: string;
  range: string;
  bg: string;
  badgeBg: string;
}

const BANDS: BandConfig[] = [
  { id: "effortless", title: "Effortless Native Flow", range: "98%+ Coverage", bg: "bg-[#D8D6FA]", badgeBg: "bg-white/85" },
  { id: "sweetspot", title: "Sweet Spot Extensive Reading", range: "90%–97.9% Coverage", bg: "bg-[#FAFAFA]", badgeBg: "bg-[#E2F59B]" },
  { id: "intensive", title: "Intensive Study & Stretch", range: "Below 90% Coverage", bg: "bg-[#F3E1E6]", badgeBg: "bg-white/85" },
];

export const ReadflowReadinessBands: React.FC<ReadflowReadinessBandsProps> = ({ items }) => {
  const [openId, setOpenId] = useState<string>("sweetspot");

  const grouped = useMemo(() => {
    const effortless: MediaCatalogItem[] = [];
    const sweetspot: MediaCatalogItem[] = [];
    const intensive: MediaCatalogItem[] = [];
    for (const it of items) {
      const cov = it.comprehension?.text_coverage_percentage ?? it.comprehension?.comprehension_percentage ?? 0;
      if (cov >= 98) effortless.push(it);
      else if (cov >= 90) sweetspot.push(it);
      else intensive.push(it);
    }
    return { effortless, sweetspot, intensive };
  }, [items]);

  return (
    <section id="readiness-bands" className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-16">
      <div className="mb-7">
        <h2 className="font-editorial text-[42px] sm:text-[54px] text-[#040404]">
          Readiness bands for your vocabulary
        </h2>
        <p className="mt-2 text-[14px] text-[#5A595C]">
          Titles grouped automatically by your real token coverage.
        </p>
      </div>

      <div className="rounded-3xl border border-[#040404]/15 overflow-hidden divide-y divide-[#040404]/10">
        {BANDS.map((band) => {
          const list = grouped[band.id];
          const isOpen = openId === band.id;
          return (
            <div key={band.id} className={band.bg}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? "" : band.id)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-editorial text-2xl sm:text-3xl text-[#040404]">{band.title}</span>
                  <span className="text-xs font-semibold text-[#5A595C]">{band.range}</span>
                  <span className={`px-2.5 py-0.5 rounded-full ${band.badgeBg} text-[#040404] text-[12px] font-extrabold`}>
                    {list.length} Titles
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-[#040404] transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="px-6 pb-6">
                  {list.length === 0 ? (
                    <p className="text-sm text-[#5A595C]">No titles in this band yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {list.slice(0, 6).map((it) => {
                        const cov = it.comprehension?.text_coverage_percentage ?? it.comprehension?.comprehension_percentage ?? 0;
                        return (
                          <Link
                            key={it.id}
                            to={`/media/${it.id}`}
                            className="bg-white rounded-2xl border border-[#ECECEF] p-4 hover:border-[#040404] transition-colors flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-[#040404] truncate">{it.title}</p>
                              <p className="text-xs text-[#5A595C] truncate">{it.creator || "Unknown"}</p>
                            </div>
                            <span className="font-editorial text-2xl text-[#040404] shrink-0">{cov.toFixed(1)}%</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
