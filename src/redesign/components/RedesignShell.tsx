import React from "react";
import { Link, useLocation } from "react-router-dom";

interface RedesignShellProps {
  activeLang: "es" | "fr" | "zh";
  onChangeLang: (lang: "es" | "fr" | "zh") => void;
  savedCount: number;
  children: React.ReactNode;
}

export const RedesignShell: React.FC<RedesignShellProps> = ({
  activeLang,
  onChangeLang,
  savedCount,
  children,
}) => {
  const { pathname } = useLocation();
  const navItems = [
    { to: "/preview", label: "Catalogue", active: pathname === "/preview" || pathname.startsWith("/preview/media") },
    { to: "/preview/saved", label: `Saved (${savedCount})`, active: pathname === "/preview/saved" },
    { to: "/preview/words", label: "My Words (2,410)", active: pathname === "/preview/words" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans antialiased">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/preview" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-xs">
                e
              </div>
              <span className="text-lg font-semibold tracking-tight text-slate-900">eleno</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((tab) => (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    tab.active
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
              {(["es", "fr", "zh"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onChangeLang(lang)}
                  className={`rounded-full px-2.5 py-1 uppercase cursor-pointer transition ${
                    activeLang === lang
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <Link
              to="/"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              Classic UI ↗
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};
