import React, { useState } from "react";
import { searchAdminWorks } from "@/api/adminImport.api";
import type { AdminWorkMatch } from "@/types/adminImport.types";

interface AdminWorkMatchPanelProps {
  initialMatches: AdminWorkMatch[];
  selectedWorkId: string | null;
  onSelect: (work: AdminWorkMatch | null) => void;
}

export const AdminWorkMatchPanel: React.FC<AdminWorkMatchPanelProps> = ({
  initialMatches,
  selectedWorkId,
  onSelect,
}) => {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<AdminWorkMatch[]>(initialMatches);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      setMatches(await searchAdminWorks(query));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-slate-900">
            2. Link to work
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Select an existing work or leave unset to create a new work from the fields above.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition ${
            selectedWorkId
              ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              : "bg-slate-900 text-white shadow-xs"
          }`}
        >
          Create new work
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && void search()}
          placeholder="Search works by English or original title..."
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-400 focus:bg-white"
        />
        <button
          type="button"
          onClick={() => void search()}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "..." : "Search"}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="max-h-64 space-y-1.5 overflow-y-auto">
        {matches.length === 0 ? (
          <p className="text-xs text-slate-400">No matching works.</p>
        ) : (
          matches.map((match) => {
            const selected = selectedWorkId === match.id;
            return (
              <button
                key={match.id}
                type="button"
                onClick={() => onSelect(match)}
                className={`block w-full rounded-xl border px-3.5 py-2.5 text-left transition cursor-pointer ${
                  selected
                    ? "border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-200"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">
                  {match.title_en || match.original_title}
                </div>
                <div className="text-xs text-slate-500">
                  {match.creator} · {match.media_item?.length || 0} editions
                  {match.media_item?.length
                    ? ` · ${match.media_item.map((edition) => edition.language.toUpperCase()).join(", ")}`
                    : ""}
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
};
