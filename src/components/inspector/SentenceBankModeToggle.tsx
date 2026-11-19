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
  <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 text-[11px]">
    <button
      type="button"
      onClick={() => onChange("all")}
      className={`rounded-lg px-2.5 py-1 font-medium transition cursor-pointer ${
        mode === "all" ? "bg-slate-900 text-white shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      All examples
    </button>
    <button
      type="button"
      disabled={!userId}
      title={userId ? "Show sentences where this is the only unknown word" : "Sign in to calculate i+1"}
      onClick={() => onChange("iplus1")}
      className={`rounded-lg px-2.5 py-1 font-medium transition ${
        !userId
          ? "text-slate-400 cursor-not-allowed"
          : mode === "iplus1"
            ? "bg-slate-900 text-white shadow-xs font-semibold cursor-pointer"
            : "text-slate-600 hover:text-slate-900 cursor-pointer"
      }`}
    >
      i+1 Only
    </button>
  </div>
);
