import React, { useState } from "react";

export interface ChartSegment {
  value: number;
  color: string;
  label?: string;
  displayValue?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function pieSlicePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polarToCartesian(cx, cy, r, endDeg);
  const end = polarToCartesian(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

/** Compact filled SVG pie chart with per-slice hover tooltips. */
export const MiniPieChart: React.FC<{ segments: ChartSegment[]; size?: number }> = ({ segments, size = 42 }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const valid = segments.filter((s) => s.value > 0);
  const total = valid.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;
  let angle = 0;
  const active = hovered != null ? valid[hovered] : null;

  return (
    <div className="relative shrink-0 inline-flex items-center justify-center" onMouseLeave={() => setHovered(null)}>
      {active && (
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full right-0 z-30 mb-1.5 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10.5px] font-medium text-white shadow-md"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full mr-1 align-middle" style={{ backgroundColor: active.color }} />
          {active.label ? `${active.label}: ` : ""}
          {active.displayValue ?? `${((active.value / total) * 100).toFixed(1)}%`}
        </div>
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible" aria-hidden="true">
        {valid.length === 1 ? (
          <circle cx={cx} cy={cy} r={r} fill={valid[0].color} onMouseEnter={() => setHovered(0)} className="cursor-pointer" />
        ) : (
          valid.map((seg, idx) => {
            const sweep = (seg.value / total) * 360;
            const d = pieSlicePath(cx, cy, r, angle, angle + sweep);
            angle += sweep;
            const dim = hovered !== null && hovered !== idx;
            return (
              <path
                key={idx}
                d={d}
                fill={seg.color}
                stroke="#FFFFFF"
                strokeWidth={0.75}
                opacity={dim ? 0.45 : 1}
                onMouseEnter={() => setHovered(idx)}
                className="cursor-pointer transition-opacity duration-150"
              />
            );
          })
        )}
      </svg>
    </div>
  );
};

/** Compact color key legend for pie chart segments. */
export const ChartColorKeys: React.FC<{ segments: ChartSegment[] }> = ({ segments }) => {
  const keyed = segments.filter((s) => s.label && s.value > 0);
  if (keyed.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
      {keyed.map((seg) => (
        <span
          key={seg.label}
          title={seg.displayValue ? `${seg.label}: ${seg.displayValue}` : seg.label}
          className="inline-flex items-center gap-1 text-[9.5px] font-medium text-slate-500"
        >
          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
          {seg.label}
        </span>
      ))}
    </div>
  );
};
