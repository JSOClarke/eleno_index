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
  <div className="inline-flex border border-[#111111] font-mono text-[10px]">
    <button
      type="button"
      onClick={() => onChange("all")}
      className={`px-2.5 py-1 cursor-pointer ${
        mode === "all" ? "bg-[#111111] text-[#B8FF01] font-semibold" : "bg-white text-[#555555]"
      }`}
    >
      ALL EXAMPLES
    </button>
    <button
      type="button"
      disabled={!userId}
      title={userId ? "Show sentences where this is the only unknown word" : "Sign in to calculate i+1"}
      onClick={() => onChange("iplus1")}
      className={`px-2.5 py-1 border-l border-[#111111] ${
        !userId
          ? "bg-[#F4F4F2] text-[#999999] cursor-not-allowed"
          : mode === "iplus1"
            ? "bg-[#B8FF01] text-[#111111] font-semibold cursor-pointer"
            : "bg-white text-[#555555] cursor-pointer"
      }`}
    >
      i+1 COMPREHENSIBLE ONLY
    </button>
  </div>
);
