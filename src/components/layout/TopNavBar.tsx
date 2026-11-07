import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { InputHubBrandLogo } from "@/components/brand/InputHubBrandLogo";
import { MobileNavDrawer } from "./MobileNavDrawer";
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
  const [menuOpen, setMenuOpen] = useState(false);

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
  const drawerItems = [
    { to: "/", label: "Catalogue" },
    { to: "/saved", label: "Saved", count: savedCount },
    { to: "/history", label: "History" },
    { to: "/known-words", label: "Known words", count: knownCount },
  ];
  const activeTo = navItems.find((item) => item.match(pathname))?.to;

  return (
    <>
      <header className="border-b border-[#E2E2DF] bg-white sticky top-0 z-30">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4 md:gap-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="-ml-1 p-2 text-[#111111] cursor-pointer md:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>

            <Link to="/" className="flex items-center">
              <InputHubBrandLogo size="md" scrambleOnMount={true} />
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

          <div className="hidden items-center gap-2 font-mono text-xs text-[#555555] sm:flex sm:gap-4">
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

      <MobileNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={drawerItems}
        activeTo={activeTo}
        user={user}
        onOpenAuth={onOpenAuth}
        onSignOut={onSignOut}
      />
    </>
  );
};
