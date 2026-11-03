import React from "react";
import { NavLink } from "react-router-dom";
import { BookMarked, BookOpen, Bookmark, Clock, type LucideIcon } from "lucide-react";

interface BottomTabBarProps {
  savedCount: number;
  knownCount: number;
}

interface Tab {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  count?: number;
}

/** Mobile-only primary navigation; the desktop nav stays in TopNavBar. */
export const BottomTabBar: React.FC<BottomTabBarProps> = ({ savedCount, knownCount }) => {
  const tabs: Tab[] = [
    { to: "/", label: "Catalogue", icon: BookOpen, end: true },
    { to: "/saved", label: "Saved", icon: Bookmark, count: savedCount },
    { to: "/history", label: "History", icon: Clock },
    { to: "/known-words", label: "Known", icon: BookMarked, count: knownCount },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-[#111111] bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  isActive ? "bg-[#B8FF01] text-[#111111]" : "text-[#666666]"
                }`
              }
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              <span>{tab.label}</span>
              {tab.count ? (
                <span className="absolute right-2 top-1 min-w-[16px] rounded-sm bg-[#111111] px-1 text-center text-[9px] font-bold leading-4 text-[#B8FF01]">
                  {tab.count > 99 ? "99+" : tab.count}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
