import React from "react";
import type { AdminEditionDraft } from "@/types/adminImport.types";

interface AdminEditionFieldsProps {
  edition: AdminEditionDraft;
  onChange: (field: keyof AdminEditionDraft, value: string) => void;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block space-y-1">
    <span className="text-xs font-medium text-slate-600">{label}</span>
    {children}
  </label>
);

export const AdminEditionFields: React.FC<AdminEditionFieldsProps> = ({
  edition,
  onChange,
}) => (
  <section className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
    <div>
      <div className="text-xs font-semibold text-slate-900">
        Edition · localized release
      </div>
      <p className="mt-0.5 text-xs text-slate-500">
        Target-language file details shown in the stats inspector.
      </p>
    </div>

    <Field label="Edition title">
      <input
        className={inputClass}
        value={edition.title}
        onChange={(e) => onChange("title", e.target.value)}
      />
    </Field>

    <div className="grid grid-cols-2 gap-2.5">
      <Field label="Author / Director">
        <input
          className={inputClass}
          value={edition.author}
          onChange={(e) => onChange("author", e.target.value)}
        />
      </Field>
      <Field label="Language">
        <input
          className={inputClass}
          value={edition.language}
          onChange={(e) => onChange("language", e.target.value)}
        />
      </Field>
    </div>

    <Field label="Edition synopsis">
      <textarea
        className={`${inputClass} min-h-[100px] resize-y`}
        value={edition.synopsis}
        onChange={(e) => onChange("synopsis", e.target.value)}
      />
    </Field>

    <Field label="Release year">
      <input
        className={inputClass}
        value={edition.release_year}
        onChange={(e) => onChange("release_year", e.target.value)}
      />
    </Field>
  </section>
);
