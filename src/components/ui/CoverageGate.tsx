import React from "react";

interface CoverageGateProps {
  onSignIn: () => void;
  label: string;
  /** 1 = compact (cards/rows), 2 = tall (inspector panels). */
  rows?: 1 | 2;
}

/**
 * Locked placeholder shown in place of comprehension metrics for signed-out
 * users: a blurred ghost of the chart plus a readable sign-in call to action.
 */
export const CoverageGate: React.FC<CoverageGateProps> = ({
  onSignIn,
  label,
  rows = 1,
}) => (
  <div
    className={`relative w-full overflow-hidden border border-[#111111]/20 bg-[#F8F8F6] ${
      rows === 2 ? "min-h-[76px]" : "min-h-[44px]"
    }`}
  >
    <div
      aria-hidden
      className="pointer-events-none select-none space-y-1.5 p-2 opacity-30 blur-[2px]"
    >
      {rows === 2 && <div className="h-6 w-14 bg-[#111111]/50" />}
      <div className="h-2 w-full border border-[#111111] bg-white">
        <div className="h-full w-2/3 bg-[#111111]/50" />
      </div>
      {rows === 2 && <div className="h-2 w-16 bg-[#111111]/40" />}
    </div>

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSignIn();
      }}
      className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-0.5 bg-white/60 px-1.5 text-center backdrop-blur-[1px]"
    >
      <span className="font-mono text-[10px] font-bold uppercase leading-tight text-[#111111]">
        {label}
      </span>
      <span className="font-mono text-[10px] font-bold text-[#111111] underline">
        Sign in →
      </span>
    </button>
  </div>
);
