import React, { useState } from "react";
import { Info } from "lucide-react";

interface MetricInfoTooltipProps {
  label: string;
  text: string;
}

/** Accessible hover/tap tooltip trigger for linguistic profile metric cards. */
export const MetricInfoTooltip: React.FC<MetricInfoTooltipProps> = ({ label, text }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative inline-flex shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={`About ${label}`}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onBlur={() => setOpen(false)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer"
      >
        <Info className="h-3 w-3" />
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 z-30 mb-1.5 w-52 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-2 text-[11px] font-normal normal-case tracking-normal leading-snug text-slate-100 shadow-lg pointer-events-none"
        >
          {text}
        </div>
      )}
    </div>
  );
};
