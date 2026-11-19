import React from "react";
import { ThresholdMark } from "@/components/brand/InputHubBrandLogo";

interface SiteFooterProps {
  onOpenFeedback: () => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ onOpenFeedback }) => (
  <footer className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-5 text-xs text-slate-400">
      <span className="inline-flex items-center gap-2 font-medium text-slate-600">
        <ThresholdMark className="h-3.5 w-3.5 text-slate-900" />
        Threshold
      </span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenFeedback}
          className="font-medium text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          Feedback / Request media
        </button>
        <span>·</span>
        <span>Spanish · French · Chinese</span>
      </div>
    </div>
  </footer>
);
