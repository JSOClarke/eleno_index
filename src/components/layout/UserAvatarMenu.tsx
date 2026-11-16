import React, { useEffect, useRef, useState } from "react";
import { BookOpen, Compass, Feather, Flame, LogOut, Sparkles, User } from "lucide-react";
import type { UserProfile } from "@/types/vocabulary.types";

const AVATAR_OPTIONS = [
  { id: "default", label: "Classic", Icon: User, bg: "bg-slate-900 text-white" },
  { id: "book", label: "Reader", Icon: BookOpen, bg: "bg-indigo-600 text-white" },
  { id: "feather", label: "Quill", Icon: Feather, bg: "bg-emerald-600 text-white" },
  { id: "compass", label: "Explorer", Icon: Compass, bg: "bg-amber-500 text-white" },
  { id: "sparkles", label: "Spark", Icon: Sparkles, bg: "bg-violet-600 text-white" },
  { id: "flame", label: "Streak", Icon: Flame, bg: "bg-rose-600 text-white" },
] as const;

type AvatarId = (typeof AVATAR_OPTIONS)[number]["id"];
const STORAGE_PREFIX = "threshold_avatar_";

export function readStoredAvatar(userId?: string): AvatarId {
  if (typeof window === "undefined" || !userId) return "default";
  const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
  return AVATAR_OPTIONS.some((a) => a.id === raw) ? (raw as AvatarId) : "default";
}

export const AvatarBadge: React.FC<{ avatarId: AvatarId; size?: "sm" | "md" }> = ({
  avatarId,
  size = "md",
}) => {
  const opt = AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];
  const Icon = opt.Icon;
  const dims = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full ring-1 ring-black/10 ${dims} ${opt.bg}`}>
      <Icon className={iconSize} />
    </span>
  );
};

interface UserAvatarMenuProps {
  user: UserProfile;
  onSignOut: () => void;
}

export const UserAvatarMenu: React.FC<UserAvatarMenuProps> = ({ user, onSignOut }) => {
  const [open, setOpen] = useState(false);
  const [avatarId, setAvatarId] = useState<AvatarId>(() => readStoredAvatar(user.id));
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvatarId(readStoredAvatar(user.id));
  }, [user.id]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectAvatar = (id: AvatarId) => {
    setAvatarId(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`${STORAGE_PREFIX}${user.id}`, id);
    }
  };

  return (
    <div ref={menuRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        title={user.email || "Account"}
        className="rounded-full transition-transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
      >
        <AvatarBadge avatarId={avatarId} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-lg z-40 space-y-2.5"
        >
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-1 pb-2.5">
            <AvatarBadge avatarId={avatarId} size="sm" />
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-slate-400">Signed in as</div>
              <div className="truncate text-xs font-medium text-slate-800">{user.email}</div>
            </div>
          </div>

          <div className="px-1 space-y-1.5">
            <div className="text-[11px] font-medium text-slate-400">Profile icon</div>
            <div className="flex items-center justify-between gap-1">
              {AVATAR_OPTIONS.map(({ id, label, Icon, bg }) => {
                const selected = avatarId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    title={label}
                    aria-label={`${label} profile icon`}
                    aria-pressed={selected}
                    onClick={() => selectAvatar(id)}
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition cursor-pointer ${bg} ${
                      selected ? "ring-2 ring-slate-900 ring-offset-2" : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer transition"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
