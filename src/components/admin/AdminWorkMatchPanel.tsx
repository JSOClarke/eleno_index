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
    <section className="space-y-3 border border-[#111111] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
            2 / Link to work
          </div>
          <p className="mt-1 text-xs text-[#666666]">
            Select an existing work or leave blank to create a new work from the fields above.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`border px-2.5 py-1 font-mono text-[11px] font-bold cursor-pointer ${
            selectedWorkId ? "border-[#CCCCCC] bg-white" : "border-[#111111] bg-[#B8FF01]"
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
          className="min-w-0 flex-1 border border-[#CCCCCC] px-2.5 py-1.5 font-mono text-xs outline-none focus:border-[#111111]"
        />
        <button
          type="button"
          onClick={() => void search()}
          disabled={loading}
          className="border border-[#111111] bg-white px-3 py-1 font-mono text-xs font-bold disabled:opacity-50 cursor-pointer"
        >
          {loading ? "..." : "Search"}
        </button>
      </div>

      {error && <p className="font-mono text-xs text-red-600">{error}</p>}

      <div className="max-h-64 space-y-1 overflow-y-auto">
        {matches.length === 0 ? (
          <p className="font-mono text-xs text-[#888888]">No matching works.</p>
        ) : (
          matches.map((match) => {
            const selected = selectedWorkId === match.id;
            return (
              <button
                key={match.id}
                type="button"
                onClick={() => onSelect(match)}
                className={`block w-full border px-3 py-2 text-left cursor-pointer ${
                  selected ? "border-[#111111] bg-[#B8FF01]" : "border-[#E2E2DF] bg-white hover:border-[#111111]"
                }`}
              >
                <div className="font-sans text-sm font-bold text-[#111111]">
                  {match.title_en || match.original_title}
                </div>
                <div className="font-mono text-[11px] text-[#666666]">
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
