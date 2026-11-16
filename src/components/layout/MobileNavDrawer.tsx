import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { InputHubBrandLogo } from "@/components/brand/InputHubBrandLogo";
import type { UserProfile } from "@/types/vocabulary.types";

export interface MobileNavItem {
  to: string;
  label: string;
  count?: number;
}

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  items: MobileNavItem[];
  activeTo?: string;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

/** Slide-in primary navigation for phones; desktop keeps the inline nav. */
export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  open,
  onClose,
  items,
  activeTo,
  user,
  onOpenAuth,
  onSignOut,
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-xs"
      />
      <nav
        id="mobile-nav"
        className="absolute left-0 top-0 flex h-full w-72 max-w-[80vw] flex-col border-r border-slate-200 bg-white shadow-xl pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3.5">
          <InputHubBrandLogo size="md" />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition ${
                activeTo === item.to
                  ? "bg-slate-900 font-semibold text-white"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{item.label}</span>
              {item.count ? (
                <span className={`min-w-[20px] rounded-full px-2 py-0.5 text-center text-[11px] font-semibold ${
                  activeTo === item.to ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {item.count > 99 ? "99+" : item.count}
                </span>
              ) : null}
            </Link>
          ))}
        </div>

        <div className="border-t border-slate-200/80 p-4">
          {user ? (
            <>
              <div className="truncate text-xs text-slate-500">{user.email}</div>
              <button
                type="button"
                onClick={() => { onSignOut(); onClose(); }}
                className="mt-2.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => { onOpenAuth(); onClose(); }}
              className="w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-600 cursor-pointer transition"
            >
              Sign in to sync
            </button>
          )}
        </div>
      </nav>
    </div>,
    document.body
  );
};
