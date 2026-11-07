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
        className="absolute inset-0 bg-[#111111]/40"
      />
      <nav
        id="mobile-nav"
        className="absolute left-0 top-0 flex h-full w-72 max-w-[80vw] flex-col border-r-2 border-[#111111] bg-white pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-between border-b border-[#E2E2DF] px-4 py-3">
          <InputHubBrandLogo size="md" />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="px-2 py-1 font-mono text-sm font-bold text-[#666666] hover:text-[#111111] cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center justify-between border-b border-[#F0F0EE] px-4 py-3 font-mono text-sm ${
                activeTo === item.to
                  ? "bg-[#B8FF01] font-bold text-[#111111]"
                  : "text-[#111111]"
              }`}
            >
              <span>{item.label}</span>
              {item.count ? (
                <span className="min-w-[20px] rounded-sm border border-[#111111] bg-white px-1 text-center font-mono text-[10px] font-bold">
                  {item.count > 99 ? "99+" : item.count}
                </span>
              ) : null}
            </Link>
          ))}
        </div>

        <div className="border-t border-[#E2E2DF] p-4">
          {user ? (
            <>
              <div className="truncate font-mono text-xs text-[#666666]">{user.email}</div>
              <button
                type="button"
                onClick={() => { onSignOut(); onClose(); }}
                className="mt-2 w-full border border-[#111111] bg-white px-3 py-2 font-mono text-xs font-bold text-[#111111] cursor-pointer"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => { onOpenAuth(); onClose(); }}
              className="w-full border border-[#111111] bg-[#111111] px-3 py-2 font-mono text-xs font-bold text-[#B8FF01] cursor-pointer"
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
