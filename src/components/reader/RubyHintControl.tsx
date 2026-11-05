import React from "react";
import type { RubyPosFilter } from "@/types/reader.types";

const OPTIONS: RubyPosFilter[] = ["ALL", "NOUN", "VERB", "ADJ", "ADV"];

interface RubyHintControlProps {
  showRuby: boolean;
  rubyPos: RubyPosFilter;
  onChange: (pos: RubyPosFilter) => void;
}

/** POS filter for ruby glosses; hidden while ruby hints are off. */
export const RubyHintControl: React.FC<RubyHintControlProps> = ({
  showRuby,
  rubyPos,
  onChange,
}) => {
  if (!showRuby) return null;

  return (
    <select
      value={rubyPos}
      onChange={(event) => onChange(event.target.value as RubyPosFilter)}
      title="Only show ruby hints for this part of speech"
      aria-label="Ruby hint part of speech"
      className="border border-[#111111] bg-white px-1.5 py-1 font-mono text-[11px] cursor-pointer"
    >
      {OPTIONS.map((pos) => (
        <option key={pos} value={pos}>
          {pos === "ALL" ? "ALL POS" : pos}
        </option>
      ))}
    </select>
  );
};
