import React from "react";
import type { AdminWorkDraft } from "@/types/adminImport.types";

interface AdminWorkIdentityFieldsProps {
  work: AdminWorkDraft;
  onChange: (field: keyof AdminWorkDraft, value: string) => void;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block space-y-1">
    <span className="text-xs font-medium text-slate-600">{label}</span>
    {children}
  </label>
);

const MEDIA_TYPES = [
  ["book", "Book"], ["movie", "Movie"], ["tv_show", "TV Show"],
  ["comic", "Comic"], ["manga", "Manga"], ["podcast", "Podcast"], ["article", "Article"],
] as const;

export const AdminWorkIdentityFields: React.FC<AdminWorkIdentityFieldsProps> = ({
  work,
  onChange,
}) => (
  <section className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
    <div>
      <div className="text-xs font-semibold text-slate-900">
        Work identity · English discovery
      </div>
      <p className="mt-0.5 text-xs text-slate-500">
        Shown on catalogue cards and search results across editions.
      </p>
    </div>

    <div className="grid grid-cols-3 gap-2.5">
      <div className="col-span-2">
        <Field label="English title">
          <input className={inputClass} value={work.title_en} onChange={(e) => onChange("title_en", e.target.value)} />
        </Field>
      </div>
      <Field label="Media type">
        <select className={inputClass} value={work.type || "book"} onChange={(e) => onChange("type", e.target.value)}>
          {MEDIA_TYPES.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
        </select>
      </Field>
    </div>

    <Field label="Original title">
      <input className={inputClass} value={work.original_title} onChange={(e) => onChange("original_title", e.target.value)} />
    </Field>

    <div className="grid grid-cols-2 gap-2.5">
      <Field label="Creator / Director">
        <input className={inputClass} value={work.creator} onChange={(e) => onChange("creator", e.target.value)} />
      </Field>
      <Field label="Original language">
        <input className={inputClass} value={work.original_language} onChange={(e) => onChange("original_language", e.target.value)} />
      </Field>
    </div>

    {Boolean(work.series_name) && (
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="mb-2 text-xs font-semibold text-slate-800">
          Position in {work.series_name}
        </div>
        <Field label={work.type === "tv_show" ? "Season #" : "Volume / Order #"}>
          <input
            type="number"
            min="1"
            step="1"
            className={inputClass}
            placeholder="e.g. 1, 2..."
            value={work.series_order}
            onChange={(e) => onChange("series_order", e.target.value)}
          />
        </Field>
      </div>
    )}

    <Field label="English synopsis">
      <textarea
        className={`${inputClass} min-h-[100px] resize-y`}
        value={work.synopsis_en}
        onChange={(e) => onChange("synopsis_en", e.target.value)}
      />
    </Field>
  </section>
);
