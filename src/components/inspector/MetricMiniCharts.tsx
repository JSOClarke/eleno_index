import React from "react";

export interface ChartSegment {
  value: number;
  color: string;
}

/** Compact inline SVG donut chart for proportional metric cards. */
export const MiniDonutChart: React.FC<{
  segments: ChartSegment[];
  size?: number;
  strokeWidth?: number;
}> = ({ segments, size = 38, strokeWidth = 5.5 }) => {
  const total = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0);
  if (total <= 0) return null;

  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 -rotate-90"
      aria-hidden="true"
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
      {segments.map((seg, idx) => {
        const val = Math.max(0, seg.value);
        if (val <= 0) return null;
        const len = (val / total) * circ;
        const dashOffset = -offset;
        offset += len;
        return (
          <circle
            key={idx}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${len} ${circ}`}
            strokeDashoffset={dashOffset}
          />
        );
      })}
    </svg>
  );
};

/** Compact 3-bar horizontal comparison chart for coverage targets (90%, 95%, 98%). */
export const MiniBarsChart: React.FC<{
  bars: Array<{ label: string; value: number; max: number; color: string }>;
}> = ({ bars }) => {
  const valid = bars.filter((b) => b.value > 0 && b.max > 0);
  if (valid.length === 0) return null;

  return (
    <div className="flex w-14 shrink-0 flex-col gap-1" aria-hidden="true">
      {bars.map((b) => {
        const pct = Math.min(100, Math.max(6, Math.round((b.value / Math.max(b.max, 1)) * 100)));
        return (
          <div key={b.label} className="flex items-center gap-1">
            <span className="w-5 text-right text-[8.5px] font-medium tabular-nums text-slate-400">
              {b.label}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: b.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
