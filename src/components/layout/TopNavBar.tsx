import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { InputHubBrandLogo } from "@/components/brand/InputHubBrandLogo";
import { LanguageSelectorDropdown } from "./LanguageSelectorDropdown";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { UserAvatarMenu } from "./UserAvatarMenu";
import type { SupportedLanguage } from "@/lib/catalogueLanguages";
import type { UserProfile } from "@/types/vocabulary.types";

interface TopNavBarProps {
  savedCount: number;
  knownCount: number;
  learningCount?: number;
  activeLanguage?: SupportedLanguage;
  onChangeLanguage?: (lang: SupportedLanguage) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  savedCount, knownCount, activeLanguage = "es",
  onChangeLanguage, user, onOpenAuth, onSignOut,
}) => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Catalogue", match: (p: string) => p === "/" || p.startsWith("/media/") || p.startsWith("/work/") },
    { to: "/saved", label: `Saved (${savedCount})`, match: (p: string) => p === "/saved" },
    { to: "/known-words", label: "Known Words", match: (p: string) => p === "/known-words" },
  ];
  const drawerItems = [
    { to: "/", label: "Catalogue" },
    { to: "/saved", label: "Saved", count: savedCount },
    { to: "/known-words", label: "Known Words" },
  ];
  const activeTo = navItems.find((item) => item.match(pathname))?.to;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5 md:gap-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="-ml-1 rounded-lg p-2 text-slate-700 hover:bg-slate-100 cursor-pointer md:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>

            <Link to="/" className="flex items-center">
              <InputHubBrandLogo size="md" />
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm">
              {navItems.map((tab) => {
                const isActive = tab.match(pathname);
                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={`rounded-full px-3.5 py-1.5 transition-colors ${
                      isActive
                        ? "bg-slate-100 font-semibold text-slate-900"
                        : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-500">
            <LanguageSelectorDropdown
              activeLanguage={activeLanguage}
              onChangeLanguage={onChangeLanguage}
              activeKnownCount={knownCount}
              userId={user?.id}
            />
            {user ? (
              <UserAvatarMenu user={user} onSignOut={onSignOut} />
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="hidden sm:inline-flex rounded-full bg-slate-900 px-4 py-1.5 font-semibold text-white hover:bg-indigo-600 cursor-pointer transition-colors shadow-xs"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      <MobileNavDrawer
        open={menuOpen} onClose={() => setMenuOpen(false)} items={drawerItems}
        activeTo={activeTo} user={user} onOpenAuth={onOpenAuth} onSignOut={onSignOut}
      />
    </>
  );
};
