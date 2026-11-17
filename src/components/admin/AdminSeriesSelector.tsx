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
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <span className="text-xs font-semibold text-slate-900">
            Franchise / Series Assignment
          </span>
          <p className="text-xs text-slate-500">
            Link this work to a book/film/TV series or leave empty for a standalone title.
          </p>
        </div>
        {seriesName && (
          <button
            type="button"
            onClick={() => onChange(undefined, "")}
            className="text-xs font-medium text-slate-500 underline hover:text-slate-900 cursor-pointer"
          >
            Clear / Standalone
          </button>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-600">
            Pick existing series {loading ? "(loading...)" : `(${options.length})`}
          </span>
          <select
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:bg-white"
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
          <span className="text-xs font-medium text-slate-600">
            Series name (or create new)
          </span>
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:bg-white"
            placeholder="e.g. Harry Potter, Élite..."
            value={seriesName}
            onChange={handleNameChange}
          />
        </label>
      </div>

      <div className="mt-2.5 text-xs">
        {seriesName ? (
          isExisting ? (
            <span className="font-medium text-emerald-700">✓ Linked to existing series</span>
          ) : (
            <span className="font-medium text-amber-700">★ New series will be created on commit</span>
          )
        ) : (
          <span className="text-slate-400">Standalone work (no series)</span>
        )}
      </div>
    </section>
  );
};
