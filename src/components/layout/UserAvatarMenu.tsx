import React, { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { fetchKnownCountsByLanguage } from "@/api/vocabulary.api";
import type { SupportedLanguage } from "@/lib/catalogueLanguages";
import type { UserProfile } from "@/types/vocabulary.types";
import { FlagIcon, ProfileLanguageSection } from "./ProfileLanguageSection";

interface UserAvatarMenuProps {
  user: UserProfile;
  onSignOut: () => void;
  inverted?: boolean;
  activeLanguage?: SupportedLanguage;
  onChangeLanguage?: (lang: SupportedLanguage) => void;
  activeKnownCount?: number;
}

export const UserAvatarMenu: React.FC<UserAvatarMenuProps> = ({
  user,
  onSignOut,
  inverted = false,
  activeLanguage = "es",
  onChangeLanguage,
  activeKnownCount = 0,
}) => {
  const [open, setOpen] = useState(false);
  const [knownCounts, setKnownCounts] = useState<Record<SupportedLanguage, number>>({ es: 0, fr: 0, zh: 0, ru: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchKnownCountsByLanguage(user.id)
      .then((res) => { if (!cancelled) setKnownCounts(res); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user.id, activeKnownCount]);

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

  return (
    <div ref={menuRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        title={user.email || "Account"}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 ${
          inverted ? "focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0A0A0C]" : "focus:ring-slate-900 focus:ring-offset-2"
        }`}
      >
        <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full ${inverted ? "ring-1 ring-white/25" : "ring-1 ring-black/10"}`}>
          <FlagIcon code={activeLanguage} className="h-full w-full" />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-lg z-40 space-y-2.5"
        >
          <div className="flex items-center gap-2.5 px-1 pb-1">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-black/10">
              <FlagIcon code={activeLanguage} className="h-full w-full" />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-slate-400">Signed in as</div>
              <div className="truncate text-xs font-medium text-slate-800">{user.email}</div>
            </div>
          </div>

          {onChangeLanguage && (
            <ProfileLanguageSection
              activeLanguage={activeLanguage}
              onChangeLanguage={onChangeLanguage}
              activeKnownCount={activeKnownCount}
              knownCounts={knownCounts}
              userId={user.id}
              onSelect={() => setOpen(false)}
            />
          )}

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
