import React, { useEffect, useState } from "react";
import { searchAdminSeries } from "@/api/adminImport.api";
import type { AdminSeriesItem } from "@/types/adminImport.types";

interface AdminSeriesSelectorProps {
  seriesId?: string;
  seriesName: string;
  onChange: (seriesId: string | undefined, seriesName: string) => void;
}

export const AdminSeriesSelector: React.FC<AdminSeriesSelectorProps> = ({
  seriesId,
  seriesName,
  onChange,
}) => {
  const [options, setOptions] = useState<AdminSeriesItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    searchAdminSeries("")
      .then((items) => {
        if (active) setOptions(items);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const val = event.target.value;
    if (!val) {
      onChange(undefined, "");
      return;
    }
    const matched = options.find((opt) => opt.id === val);
    if (matched) {
      onChange(matched.id, matched.name);
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    const exact = options.find((opt) => opt.name.toLowerCase() === val.trim().toLowerCase());
    onChange(exact ? exact.id : undefined, val);
  };

  const isExisting = Boolean(seriesId);

  return (
    <section className="border border-[#111111] bg-[#F8F8F6] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E5E5] pb-2">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
            Franchise / Series Assignment
          </span>
          <p className="text-xs text-[#555555]">
            Link this work to an overarching franchise or leave empty for a standalone book.
          </p>
        </div>
        {seriesName && (
          <button
            type="button"
            onClick={() => onChange(undefined, "")}
            className="font-mono text-[11px] text-[#666666] underline hover:text-[#111111] cursor-pointer"
          >
            Clear / Standalone
          </button>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
            Pick existing series {loading ? "(loading...)" : `(${options.length})`}
          </span>
          <select
            className="w-full border border-[#CCCCCC] bg-white px-2.5 py-1.5 font-sans text-sm text-[#111111] outline-none focus:border-[#111111]"
            value={seriesId || ""}
            onChange={handleSelect}
          >
            <option value="">-- Choose existing or type custom below --</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name} ({opt.kind || "series"})
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
            Series Name (or create new)
          </span>
          <input
            className="w-full border border-[#CCCCCC] bg-white px-2.5 py-1.5 font-sans text-sm text-[#111111] outline-none focus:border-[#111111]"
            placeholder="e.g. Harry Potter, Nacidos de la bruma..."
            value={seriesName}
            onChange={handleNameChange}
          />
        </label>
      </div>

      <div className="mt-2 font-mono text-[11px]">
        {seriesName ? (
          isExisting ? (
            <span className="text-emerald-700 font-bold">✓ Linked to existing series in database</span>
          ) : (
            <span className="text-amber-700 font-bold">★ New series will be registered on commit</span>
          )
        ) : (
          <span className="text-[#888888]">○ Standalone work (no series)</span>
        )}
      </div>
    </section>
  );
};
