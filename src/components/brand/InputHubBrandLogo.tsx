import React from "react";

interface ThresholdMarkProps {
  className?: string;
}

/** Standalone three-step Threshold geometric mark (no wordmark). */
export const ThresholdMark: React.FC<ThresholdMarkProps> = ({ className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path d="M2 20V14.75H8.5V9.5H15.5V4H22V20H2Z" fill="currentColor" />
  </svg>
);

interface InputHubBrandLogoProps {
  size?: "sm" | "md" | "lg";
  locale?: string;
  showWordmark?: boolean;
  scrambleOnMount?: boolean;
  inverted?: boolean;
  className?: string;
}

export const InputHubBrandLogo: React.FC<InputHubBrandLogoProps> = ({
  size = "md",
  locale,
  showWordmark = true,
  inverted = false,
  className = "",
}) => {
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };
  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      aria-label="Threshold"
    >
      <ThresholdMark className={`shrink-0 ${inverted ? "text-white" : "text-slate-900"} ${iconSizes[size]}`} />
      {showWordmark && (
        <span className={`font-serif font-medium tracking-tight ${inverted ? "text-white" : "text-slate-900"} ${textSizes[size]}`}>
          Threshold
        </span>
      )}
      {locale && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase text-slate-600">
          {locale}
        </span>
      )}
    </div>
  );
};

export const ThresholdLogo = InputHubBrandLogo;
