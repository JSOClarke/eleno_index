import React from "react";
import { ExternalLink } from "lucide-react";
import type { MediaPlatformLink } from "@/types/media.types";

interface PlatformLinkPillsProps {
  label: string;
  links: MediaPlatformLink[];
  extraSlot?: React.ReactNode;
}

export const PlatformLinkPills: React.FC<PlatformLinkPillsProps> = ({
  label,
  links,
  extraSlot,
}) => (
  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
    <span className="text-slate-400">{label}</span>
    {links.map((link) => (
      <a
        key={link.label}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700 transition hover:bg-slate-200/80 hover:text-slate-900"
      >
        <span>{link.label}</span>
        <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
      </a>
    ))}
    {extraSlot}
  </div>
);
