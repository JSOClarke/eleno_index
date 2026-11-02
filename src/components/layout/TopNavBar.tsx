import React from "react";
import type { NavSection } from "@/types/filter.types";
import type { UserProfile } from "@/types/vocabulary.types";

interface TopNavBarProps {
  activeNav: NavSection;
  onSelectNav: (nav: NavSection) => void;
  savedCount: number;
  knownCount: number;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeNav,
  onSelectNav,
  savedCount,
  knownCount,
  user,
  onOpenAuth,
  onSignOut,
}) => {
  const navItems: Array<{ id: NavSection; label: string }> = [
    { id: "catalogue", label: "Catalogue" },
    { id: "saved", label: `Saved (${savedCount})` },
    { id: "history", label: "History" },
    { id: "known", label: `Known words (${knownCount})` },
  ];

  return (
    <header className="border-b border-[#E2E2DF] bg-white sticky top-0 z-30">
      <div className="max-w-[1380px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Brand Logo */}
          <button
            onClick={() => onSelectNav("catalogue")}
            className="flex items-center gap-1.5 font-mono text-base font-bold tracking-tight cursor-pointer"
          >
            <span>index</span>
            <span className="bg-[#B8FF01] text-[#111111] px-1.5 py-0.5 text-sm font-bold">
              /es
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 text-sm">
            {navItems.map((tab) => {
              const isActive =
                activeNav === tab.id ||
                (activeNav === "inspector" && tab.id === "catalogue");
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectNav(tab.id)}
                  className={`py-4 border-b-2 transition-colors cursor-pointer ${
                    isActive
                      ? "border-[#111111] font-semibold text-[#111111]"
                      : "border-transparent text-[#666666] hover:text-[#111111]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Target Profile & Auth */}
        <div className="flex items-center gap-4 font-mono text-xs text-[#555555]">
          <span className="hidden md:inline">
            Spanish · target level <strong className="text-[#111111]">B1</strong>
          </span>
          <span>·</span>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-[#111111] font-medium truncate max-w-[160px]">
                {user.email}
              </span>
              <button
                onClick={onSignOut}
                className="px-2.5 py-1 border border-[#111111] bg-white text-[#111111] hover:bg-[#F4F4F2] cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1 bg-[#111111] text-[#B8FF01] font-semibold border border-[#111111] hover:bg-[#222222] cursor-pointer"
            >
              Sign in to sync
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
