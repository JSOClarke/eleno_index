import React from "react";

interface SentenceBankModeToggleProps {
  mode: "all" | "iplus1";
  userId?: string | null;
  onChange: (mode: "all" | "iplus1") => void;
}

export const SentenceBankModeToggle: React.FC<SentenceBankModeToggleProps> = ({
  mode,
  userId,
  onChange,
}) => (
  <div className="inline-flex rounded-full border border-slate-200 bg-slate-100/80 p-0.5 text-[11px]">
    <button
      type="button"
      onClick={() => onChange("all")}
      className={`rounded-full px-3 py-1 font-medium transition cursor-pointer ${
        mode === "all" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      All examples
    </button>
    <button
      type="button"
      disabled={!userId}
      title={userId ? "Show sentences where this is the only unknown word" : "Sign in to calculate i+1"}
      onClick={() => onChange("iplus1")}
      className={`rounded-full px-3 py-1 font-medium transition ${
        !userId
          ? "text-slate-400 cursor-not-allowed"
          : mode === "iplus1"
            ? "bg-emerald-600 text-white shadow-xs font-semibold cursor-pointer"
            : "text-slate-600 hover:text-slate-900 cursor-pointer"
      }`}
    >
      i+1 comprehensible only
    </button>
  </div>
);
