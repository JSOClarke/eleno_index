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
          const disabled = opt.count === 0 && !checked;
          return (
            <label
              key={opt.id}
              onClick={() => { if (!disabled) onToggle(opt.id); }}
              className={`flex items-center justify-between text-xs select-none py-0.5 ${
                disabled ? "cursor-not-allowed" : "cursor-pointer group"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`h-4 w-4 rounded-md border inline-flex items-center justify-center text-[10px] leading-none transition-colors ${
                    checked
                      ? "border-slate-900 bg-slate-900 text-white font-semibold"
                      : disabled
                        ? "border-slate-200 bg-slate-50 text-transparent"
                        : "border-slate-300 bg-white text-transparent group-hover:border-slate-400"
                  }`}
                >
                  ✓
                </span>
                <span
                  className={`transition-colors ${
                    checked
                      ? "font-semibold text-slate-900"
                      : disabled
                        ? "text-slate-400"
                        : "text-slate-600 group-hover:text-slate-900"
                  }`}
                >
                  {opt.label}
                </span>
              </span>
              <span className={`text-xs tabular-nums ${disabled ? "text-slate-300" : "text-slate-400"}`}>
                {opt.count}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};
