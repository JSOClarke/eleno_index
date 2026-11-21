import React from "react";
import { StepOnePreview, StepThreePreview, StepTwoPreview } from "./StepPreviews";

const STEPS = [
  {
    num: "01",
    title: "Build Your Word Bank",
    desc: "Seed what you already know with frequency starter packs in Known Words, or look up any conjugated form in the Dictionary across 6.58M corpus sentences.",
    Preview: StepOnePreview,
  },
  {
    num: "02",
    title: "Pick Books at Your Threshold",
    desc: "Sort 990+ works by Reading Flow (% of words you already know), filter by CEFR or length, spot Native Spanish/French titles, and inspect chapter pacing.",
    Preview: StepTwoPreview,
  },
  {
    num: "03",
    title: "Read Anywhere with the Extension",
    desc: "Parse any web article or ttu-ebook-reader page, click words for definitions and candidate dots (● ○ ○), or right-press & drag the radial wheel to mark words in one motion.",
    Preview: StepThreePreview,
  },
];

export const WorkflowSteps: React.FC<{ onRequireAuth: () => void }> = ({ onRequireAuth }) => (
  <div className="space-y-8">
    <div className="relative space-y-5 pl-6 sm:pl-8 before:absolute before:left-2.5 sm:before:left-3 before:top-3 before:bottom-3 before:w-px before:bg-slate-200">
      {STEPS.map(({ num, title, desc, Preview }, idx) => {
        const flipped = idx % 2 === 1;
        return (
          <div key={num} className="relative rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <span className="absolute -left-6 sm:-left-8 top-6 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-900 font-mono text-[10px] font-semibold text-white ring-4 ring-white">
              {num}
            </span>
            <div className={`lg:col-span-6 space-y-1.5 ${flipped ? "lg:order-2" : ""}`}>
              <h3 className="font-serif text-xl font-medium text-slate-900">{title}</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600">{desc}</p>
            </div>
            <div className={`lg:col-span-6 ${flipped ? "lg:order-1" : ""}`}>
              <Preview onRequireAuth={onRequireAuth} />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
