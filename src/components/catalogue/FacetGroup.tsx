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
      <div className="font-mono text-xs uppercase tracking-wider text-[#666666] border-b border-[#E2E2DF] pb-1.5 mb-2.5">
        {title}
      </div>
      <div className="space-y-2">
        {options.map((opt) => {
          const checked = selectedSet.has(opt.id);
          return (
            <label
              key={opt.id}
              onClick={() => onToggle(opt.id)}
              className="flex items-center justify-between text-xs cursor-pointer group select-none"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`w-3.5 h-3.5 border border-[#111111] inline-flex items-center justify-center text-[10px] leading-none ${
                    checked ? "bg-[#111111] text-white" : "bg-white text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className="group-hover:underline text-[#111111]">
                  {opt.label}
                </span>
              </span>
              <span className="font-mono text-xs text-[#888888] tabular-nums">
                {opt.count}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};
