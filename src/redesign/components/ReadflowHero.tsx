import React from "react";
import { Search } from "lucide-react";
import type { SupportedLanguage } from "@/lib/catalogueLanguages";

interface ReadflowHeroProps {
  activeLanguage: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  knownCount: number;
  totalCorpusItems: number;
  totalCorpusTokens: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const LANG_PILLS: Array<{ code: SupportedLanguage; label: string }> = [
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
];

export const ReadflowHero: React.FC<ReadflowHeroProps> = ({
  activeLanguage,
  onChangeLanguage,
  knownCount,
  totalCorpusItems,
  totalCorpusTokens,
  searchQuery,
  onSearchChange,
}) => {
  const tokensLabel = totalCorpusTokens >= 1_000_000
    ? `${(totalCorpusTokens / 1_000_000).toFixed(1)}M`
    : `${Math.round(totalCorpusTokens / 1_000)}k`;

  return (
    <section className="relative hero-grid-bg pt-11 pb-11 sm:pt-16 sm:pb-14 border-b border-[#ECECEF] overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#ECECEF] text-[12px] font-semibold text-[#5A595C] mb-5">
          <span className="w-2 h-2 rounded-full bg-[#9A99F6]" />
          <span>
            Frequency Corpus Engine · {totalCorpusItems.toLocaleString()} Indexed Titles · {tokensLabel} Tokens
          </span>
        </div>

        <h1 className="font-editorial text-[48px] sm:text-[72px] md:text-[86px] text-[#040404] max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center justify-center align-middle -mt-2 sm:-mt-3 mr-1 sm:mr-2 select-none" aria-hidden="true">
            <svg className="w-8 h-8 sm:w-11 sm:h-11" viewBox="0 0 48 48" fill="none">
              <path d="M27 4L9 27H23L20 44L39 20H25L27 4Z" fill="#D8D6FA" stroke="#040404" strokeWidth="2.8" strokeLinejoin="round" />
            </svg>
          </span>
          Track your real
          <br className="hidden sm:inline" />
          comprehension
          <span className="inline-flex items-center justify-center align-middle mx-1 sm:mx-2 px-2 py-1 rounded-2xl bg-[#E2F59B] border-2 border-[#040404] -rotate-3 select-none" aria-hidden="true">
            <svg className="w-8 h-6 sm:w-10 sm:h-7" viewBox="0 0 48 30" fill="none">
              <ellipse cx="15" cy="15" rx="9" ry="11" fill="#FFFFFF" stroke="#040404" strokeWidth="2.6" />
              <circle cx="17.5" cy="15" r="4.2" fill="#040404" />
              <ellipse cx="33" cy="15" rx="9" ry="11" fill="#FFFFFF" stroke="#040404" strokeWidth="2.6" />
              <circle cx="35.5" cy="15" r="4.2" fill="#040404" />
            </svg>
          </span>
          across native media
        </h1>

        <p className="mt-4 sm:mt-5 text-[14px] sm:text-[16px] text-[#5A595C] max-w-2xl mx-auto leading-relaxed">
          Compare your known vocabulary against novels, manga, and scripts. See exact token coverage, hapax legomena, and how many words separate you from effortless fluency.
        </p>

        <div className="mt-7 flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-white border border-[#ECECEF] rounded-2xl">
            {LANG_PILLS.map((pill) => {
              const active = activeLanguage === pill.code;
              return (
                <button
                  key={pill.code}
                  type="button"
                  onClick={() => onChangeLanguage(pill.code)}
                  className={`px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    active ? "bg-[#040404] text-white" : "text-[#5A595C] hover:text-[#040404] hover:bg-[#FAFAFA]"
                  }`}
                >
                  <span>{pill.label}</span>
                  {active && (
                    <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-[11px] font-extrabold">
                      {knownCount.toLocaleString()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 max-w-2xl mx-auto">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-[#5A595C] pointer-events-none">
              <Search className="w-4 h-4" strokeWidth={2.2} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search indexed media by title or author..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#ECECEF] text-[13px] font-medium text-[#040404] placeholder:text-[#5A595C] focus:outline-none focus:border-[#040404] transition-colors"
            />
          </div>
        </div>

        <div className="hidden lg:block absolute -bottom-11 right-4 z-20 pointer-events-none select-none" aria-hidden="true">
          <svg width="114" height="108" viewBox="0 0 120 115" fill="none">
            <path d="M98 22L101 28L107 31L101 34L98 40L95 34L89 31L95 28L98 22Z" fill="#E2F59B" stroke="#040404" strokeWidth="2" />
            <path d="M44 76C34 74 28 63 32 50C35 39 45 33 56 34C66 35 73 43 74 53L88 45L92 52L76 64C76 74 68 82 57 83L59 98H49L48 83L38 97H29L40 79" fill="#D8D6FA" stroke="#040404" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M31 52L21 55L31 59" fill="#E2F59B" stroke="#040404" strokeWidth="2.4" strokeLinejoin="round" />
            <rect x="37" y="44" width="12" height="8" rx="2.5" fill="#040404" />
            <rect x="52" y="44" width="12" height="8" rx="2.5" fill="#040404" />
            <line x1="49" y1="47" x2="52" y2="47" stroke="#040404" strokeWidth="2.4" />
            <path d="M77 44L91 39V54L77 59V44Z" fill="#FFFFFF" stroke="#040404" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M91 39L104 44V59L91 54V39Z" fill="#FFFFFF" stroke="#040404" strokeWidth="2.2" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  );
};
