import React, { useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { LanguageSelectorDropdown } from "@/components/layout/LanguageSelectorDropdown";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";
import { UserAvatarMenu } from "@/components/layout/UserAvatarMenu";
import type { SupportedLanguage } from "@/lib/catalogueLanguages";
import type { UserProfile } from "@/types/vocabulary.types";

interface ReadflowTopNavProps {
  savedCount: number;
  knownCount: number;
  activeLanguage: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const ReadflowTopNav: React.FC<ReadflowTopNavProps> = ({
  savedCount, knownCount, activeLanguage, onChangeLanguage, user, onOpenAuth, onSignOut,
}) => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: "/preview", label: "Catalogue", match: (p: string) => p.startsWith("/preview") },
    { to: "/saved", label: `Saved (${savedCount})`, match: (p: string) => p === "/saved" },
    { to: "/known-words", label: "Known Words", badge: knownCount, match: (p: string) => p === "/known-words" },
  ];

  const drawerItems = [
    { to: "/preview", label: "Catalogue" },
    { to: "/saved", label: "Saved", count: savedCount },
    { to: "/known-words", label: "Known Words" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-[#ECECEF] font-jakarta">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-5 lg:gap-7">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu"
              className="-ml-1 rounded-xl p-2 text-[#040404] hover:bg-white cursor-pointer md:hidden">
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>

            <Link to="/preview" className="inline-flex items-center gap-2 group focus:outline-none">
              <span className="w-8 h-8 rounded-xl bg-[#040404] text-white flex items-center justify-center transition-transform duration-200 group-hover:-rotate-6">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12c4.5-4 7.5-2 10 1 2.5-3 5.5-5 10-1" />
                  <path d="M6 16c2.5-2 4.5-1 6 1 1.5-2 3.5-3 6-1" />
                </svg>
              </span>
              <span className="text-2xl sm:text-[26px] font-extrabold tracking-[-0.045em] text-[#040404] flex items-baseline select-none">
                read<span className="inline-block -rotate-6 text-[#9A99F6] mx-[0.5px] transition-transform group-hover:rotate-0">f</span>low
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-[13px] font-semibold text-[#5A595C]">
              {navItems.map((tab) => {
                const active = tab.match(pathname);
                return (
                  <Link key={tab.to} to={tab.to}
                    className={`inline-flex items-center gap-1.5 transition-colors ${active ? "text-[#040404] font-bold" : "hover:text-[#040404]"}`}>
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full bg-[#D8D6FA] text-[#040404] text-[11px] font-extrabold">
                        {tab.badge.toLocaleString()}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <LanguageSelectorDropdown
              activeLanguage={activeLanguage} onChangeLanguage={onChangeLanguage}
              activeKnownCount={knownCount} userId={user?.id}
            />
            {user ? (
              <UserAvatarMenu user={user} onSignOut={onSignOut} />
            ) : (
              <button type="button" onClick={onOpenAuth} className="lexya-btn hidden sm:inline-flex">
                <span>Sign in</span>
                <span className="lexya-btn-icon"><ArrowUpRight className="w-3 h-3" strokeWidth={2.5} /></span>
              </button>
            )}
          </div>
        </div>
      </header>

      <MobileNavDrawer
        open={menuOpen} onClose={() => setMenuOpen(false)} items={drawerItems}
        activeTo="/preview" user={user} onOpenAuth={onOpenAuth} onSignOut={onSignOut}
      />
    </>
  );
};
