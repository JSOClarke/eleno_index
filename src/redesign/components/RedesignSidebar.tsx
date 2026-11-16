import React from "react";
import type { CatalogueFilterState, LengthBucket, ProfileFilterId } from "@/types/filter.types";

interface RedesignSidebarProps {
  filters: CatalogueFilterState;
  counts: {
    lengths: Record<string, number>;
    profiles: Record<string, number>;
  };
  onToggleLength: (bucket: LengthBucket) => void;
  onToggleProfile: (profile: ProfileFilterId) => void;
}

export const RedesignSidebar: React.FC<RedesignSidebarProps> = ({
  filters,
  counts,
  onToggleLength,
  onToggleProfile,
}) => {
  const lengthOpts: { id: LengthBucket; label: string }[] = [
    { id: "under25k", label: "Short (< 25k)" },
    { id: "25to80k", label: "Medium (25k–80k)" },
    { id: "80k+", label: "Long (80k+)" },
  ];

  const profileOpts: { id: ProfileFilterId; label: string }[] = [
    { id: "dialogue20", label: "Dialogue Heavy (20%+)" },
    { id: "fh70", label: "Accessible Prose (70+)" },
    { id: "subj2", label: "Subjunctive Rich" },
  ];

  return (
    <aside className="hidden w-52 shrink-0 space-y-7 lg:block select-none">
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Length / Scope
        </h3>
        <div className="space-y-2.5">
          {lengthOpts.map((opt) => {
            const checked = filters.lengths.has(opt.id);
            return (
              <label
                key={opt.id}
                onClick={() => onToggleLength(opt.id)}
                className="flex cursor-pointer items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-md border text-[10px] transition ${
                      checked
                        ? "border-indigo-600 bg-indigo-600 text-white font-semibold"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className={checked ? "font-semibold text-slate-900" : "text-slate-600"}>
                    {opt.label}
                  </span>
                </span>
                <span className="text-slate-400 tabular-nums">{counts.lengths[opt.id] || 0}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Linguistic Traits
        </h3>
        <div className="space-y-2.5">
          {profileOpts.map((opt) => {
            const checked = filters.profiles.has(opt.id);
            return (
              <label
                key={opt.id}
                onClick={() => onToggleProfile(opt.id)}
                className="flex cursor-pointer items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-md border text-[10px] transition ${
                      checked
                        ? "border-indigo-600 bg-indigo-600 text-white font-semibold"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className={checked ? "font-semibold text-slate-900" : "text-slate-600"}>
                    {opt.label}
                  </span>
                </span>
                <span className="text-slate-400 tabular-nums">{counts.profiles[opt.id] || 0}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-100/80 p-4">
        <div className="text-xs font-semibold text-slate-800">Stats & Vocab First</div>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Pick titles around <strong>90–96% match</strong>, preview key words and periphrases in{" "}
          <strong>Inspect Vocab</strong>, then watch or read on your favourite platform.
        </p>
      </div>
    </aside>
  );
};
