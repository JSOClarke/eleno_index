import React from "react";

interface CoverageGateProps {
  onSignIn: () => void;
  label: string;
  rows?: 1 | 2;
}

export const CoverageGate: React.FC<CoverageGateProps> = ({
  onSignIn,
  label,
  rows = 1,
}) => (
  <div
    className={`relative w-full overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 ${
      rows === 2 ? "min-h-[76px]" : "min-h-[44px]"
    }`}
  >
    <div
      aria-hidden
      className="pointer-events-none select-none space-y-1.5 p-2 opacity-35 blur-[2px]"
    >
      {rows === 2 && <div className="h-5 w-14 rounded bg-slate-300" />}
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div className="h-full w-2/3 rounded-full bg-emerald-400/70" />
      </div>
      {rows === 2 && <div className="h-2 w-16 rounded bg-slate-200" />}
    </div>

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSignIn();
      }}
      className="absolute inset-0 flex items-center justify-center px-2 cursor-pointer group"
    >
      <span className="rounded-full border border-slate-200 bg-white/95 px-3 py-1 text-[11px] font-medium text-slate-700 shadow-xs transition group-hover:border-indigo-300 group-hover:text-indigo-700">
        {label}
      </span>
    </button>
  </div>
);
