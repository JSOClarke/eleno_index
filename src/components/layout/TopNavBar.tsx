import React from "react";
import { Link, useLocation } from "react-router-dom";
import type { UserProfile } from "@/types/vocabulary.types";

interface TopNavBarProps {
  savedCount: number;
  knownCount: number;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  savedCount,
  knownCount,
  user,
  onOpenAuth,
  onSignOut,
}) => {
  const { pathname } = useLocation();

  const navItems = [
    { to: "/", label: "Catalogue", match: (p: string) => p === "/" || p.startsWith("/media/") },
    { to: "/saved", label: `Saved (${savedCount})`, match: (p: string) => p === "/saved" },
    { to: "/history", label: "History", match: (p: string) => p === "/history" },
    {
      to: "/known-words",
      label: `Known words (${knownCount})`,
      match: (p: string) => p === "/known-words",
    },
  ];

  return (
    <header className="border-b border-[#E2E2DF] bg-white sticky top-0 z-30">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-1.5 font-mono text-base font-bold tracking-tight"
          >
            <span>index</span>
            <span className="bg-[#B8FF01] text-[#111111] px-1.5 py-0.5 text-sm font-bold">
              /es
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navItems.map((tab) => {
              const isActive = tab.match(pathname);
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`py-4 border-b-2 transition-colors ${
                    isActive
                      ? "border-[#111111] font-semibold text-[#111111]"
                      : "border-transparent text-[#666666] hover:text-[#111111]"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs text-[#555555] shrink-0">
          <span className="hidden lg:inline">
            Spanish · target level <strong className="text-[#111111]">B1</strong>
          </span>
          <span className="hidden lg:inline">·</span>
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline text-[#111111] font-medium truncate max-w-[160px]">
                {user.email}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="px-2.5 py-1 border border-[#111111] bg-white text-[#111111] hover:bg-[#F4F4F2] cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3 py-1 bg-[#111111] text-[#B8FF01] font-semibold border border-[#111111] hover:bg-[#222222] cursor-pointer"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
