import React from "react";
import { Quote } from "lucide-react";

interface PrimerRowActionsProps {
  isOpen: boolean;
  isLearning: boolean;
  isKnown: boolean;
  onToggleOpen: () => void;
  onLearn: () => void;
  onKnown: () => void;
  className?: string;
}

/** Shared status/context actions for the desktop row and the mobile card. */
export const PrimerRowActions: React.FC<PrimerRowActionsProps> = ({
  isOpen,
  isLearning,
  isKnown,
  onToggleOpen,
  onLearn,
  onKnown,
  className = "",
}) => (
  <div className={`flex items-center gap-1 ${className}`}>
    <button
      type="button"
      onClick={onToggleOpen}
      title="Show dictionary definitions & authentic sentences"
      className={`p-1.5 border border-[#111111] transition-colors cursor-pointer ${
        isOpen ? "bg-[#B8FF01] text-[#111111]" : "bg-white text-[#111111] hover:bg-[#F4F4F2]"
      }`}
    >
      <Quote className="w-3.5 h-3.5" />
    </button>
    <button
      type="button"
      onClick={onLearn}
      title={isLearning ? "Reset to Unknown" : "Mark as Learning"}
      className={`px-2 py-1 font-mono text-[11px] border transition-colors cursor-pointer ${
        isLearning
          ? "border-[#111111] bg-[#B8FF01] text-[#111111] font-semibold"
          : "border-[#CCCCCC] bg-white text-[#555555] hover:border-[#111111] hover:text-[#111111]"
      }`}
    >
      {isLearning ? "● Learning" : "Learn"}
    </button>
    <button
      type="button"
      onClick={onKnown}
      title={isKnown ? "Reset to Unknown" : "Mark as Known"}
      className={`px-2.5 py-1 font-mono text-[11px] border transition-colors cursor-pointer ${
        isKnown
          ? "border-[#111111] bg-[#111111] text-[#B8FF01] font-semibold"
          : "border-[#111111] bg-white text-[#111111] hover:bg-[#B8FF01]"
      }`}
    >
      {isKnown ? "✓ Known" : "Known"}
    </button>
  </div>
);
