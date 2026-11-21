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

export const PrimerRowActions: React.FC<PrimerRowActionsProps> = ({
  isOpen,
  isLearning,
  isKnown,
  onToggleOpen,
  onLearn,
  onKnown,
  className = "",
}) => (
  <div className={`flex items-center justify-center gap-1.5 ${className}`}>
    <button
      type="button"
      onClick={onToggleOpen}
      title="Show dictionary definitions & authentic sentences"
      className={`rounded-lg border p-1.5 transition-colors cursor-pointer ${
        isOpen
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Quote className="w-3.5 h-3.5" />
    </button>
    <button
      type="button"
      onClick={onLearn}
      title={isLearning ? "Reset to Unknown" : "Mark as Learning"}
      aria-pressed={isLearning}
      className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
        isLearning
          ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      Learn
    </button>
    <button
      type="button"
      onClick={onKnown}
      title={isKnown ? "Reset to Unknown" : "Mark as Known"}
      aria-pressed={isKnown}
      className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
        isKnown
          ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      Known
    </button>
  </div>
);
