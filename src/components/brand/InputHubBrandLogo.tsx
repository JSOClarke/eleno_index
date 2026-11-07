import React, { useEffect, useState } from "react";

const TARGET_NAME = "inputhub";
const GLYPHS = "!/<>-_\\#[]{}—=+*^?#";

interface InputHubBrandLogoProps {
  size?: "sm" | "md" | "lg";
  locale?: string;
  scrambleOnMount?: boolean;
  className?: string;
}

export const InputHubBrandLogo: React.FC<InputHubBrandLogoProps> = ({
  size = "md",
  locale = "es",
  scrambleOnMount = false,
  className = "",
}) => {
  const [displayText, setDisplayText] = useState<string>(TARGET_NAME);
  const [recoiling, setRecoiling] = useState<boolean>(false);

  const triggerScramble = () => {
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setDisplayText(
        TARGET_NAME.split("")
          .map((char, index) => {
            if (index < frame / 2) return char;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );
      if (frame >= TARGET_NAME.length * 2) {
        clearInterval(interval);
        setDisplayText(TARGET_NAME);
      }
    }, 30);
  };

  useEffect(() => {
    if (scrambleOnMount) {
      triggerScramble();
    }
  }, [scrambleOnMount]);

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecoiling(true);
    setTimeout(() => setRecoiling(false), 380);
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl font-black",
  };

  const badgeSizes = {
    sm: "px-1 py-0.2 text-[10px]",
    md: "px-1.5 py-0.5 text-xs",
    lg: "px-2 py-0.5 text-sm",
  };

  return (
    <div
      onMouseEnter={() => {
        setRecoiling(true);
        setTimeout(() => setRecoiling(false), 380);
      }}
      className={`inline-flex items-center gap-1.5 font-mono font-bold tracking-tight select-none ${textSizes[size]} ${className}`}
    >
      <span className="tracking-tighter transition-colors text-[#111111]">
        {displayText}
      </span>

      <span
        onClick={handleBadgeClick}
        title="inputhub /es — Neo-Swiss language acquisition"
        className={`inline-flex items-center border border-[#111111] bg-[#B8FF01] font-bold text-[#111111] shadow-[2px_2px_0px_#111111] transition-transform cursor-pointer ${
          badgeSizes[size]
        } ${recoiling ? "animate-recoil-impact" : "hover:-translate-x-0.5 hover:-translate-y-0.5"}`}
      >
        <span>/</span>
        <span>{locale}</span>
      </span>
    </div>
  );
};
