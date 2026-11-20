import React from "react";
import { BookOpen, Compass, Feather, Flame, Sparkles, User } from "lucide-react";

export const AVATAR_OPTIONS = [
  { id: "default", label: "Classic", Icon: User, bg: "bg-slate-900 text-white" },
  { id: "book", label: "Reader", Icon: BookOpen, bg: "bg-indigo-600 text-white" },
  { id: "feather", label: "Quill", Icon: Feather, bg: "bg-emerald-600 text-white" },
  { id: "compass", label: "Explorer", Icon: Compass, bg: "bg-amber-500 text-white" },
  { id: "sparkles", label: "Spark", Icon: Sparkles, bg: "bg-violet-600 text-white" },
  { id: "flame", label: "Streak", Icon: Flame, bg: "bg-rose-600 text-white" },
] as const;

export type AvatarId = (typeof AVATAR_OPTIONS)[number]["id"];
export const AVATAR_STORAGE_PREFIX = "threshold_avatar_";

export function readStoredAvatar(userId?: string): AvatarId {
  if (typeof window === "undefined" || !userId) return "default";
  const raw = window.localStorage.getItem(`${AVATAR_STORAGE_PREFIX}${userId}`);
  return AVATAR_OPTIONS.some((a) => a.id === raw) ? (raw as AvatarId) : "default";
}

export const AvatarBadge: React.FC<{ avatarId: AvatarId; size?: "sm" | "md"; inverted?: boolean }> = ({
  avatarId,
  size = "md",
  inverted = false,
}) => {
  const opt = AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];
  const Icon = opt.Icon;
  const dims = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const bg = inverted && opt.id === "default" ? "bg-white text-slate-950" : opt.bg;
  const ring = inverted ? "ring-1 ring-white/25" : "ring-1 ring-black/10";
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full ${ring} ${dims} ${bg}`}>
      <Icon className={iconSize} />
    </span>
  );
};
