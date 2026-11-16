import React from "react";

export interface FacetOption {
  id: string;
  label: string;
  count: number;
}

interface FacetGroupProps {
  title: string;
  options: FacetOption[];
  selectedSet: Set<string>;
  onToggle: (id: string) => void;
}

export const FacetGroup: React.FC<FacetGroupProps> = ({
  title,
  options,
  selectedSet,
  onToggle,
}) => {
  return (
    <div>
      <div className="mb-2.5 text-xs font-semibold text-slate-500">
        {title}
      </div>
      <div className="space-y-2">
        {options.map((opt) => {
          const checked = selectedSet.has(opt.id);
          return (
            <label
              key={opt.id}
              onClick={() => onToggle(opt.id)}
              className="flex items-center justify-between text-xs cursor-pointer group select-none py-0.5"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`h-4 w-4 rounded-md border inline-flex items-center justify-center text-[10px] leading-none transition-colors ${
                    checked
                      ? "border-indigo-600 bg-indigo-600 text-white font-semibold"
                      : "border-slate-300 bg-white text-transparent group-hover:border-slate-400"
                  }`}
                >
                  ✓
                </span>
                <span className={`transition-colors ${checked ? "font-semibold text-slate-900" : "text-slate-600 group-hover:text-slate-900"}`}>
                  {opt.label}
                </span>
              </span>
              <span className="text-xs text-slate-400 tabular-nums">
                {opt.count}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};
