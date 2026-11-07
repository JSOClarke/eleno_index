import React from "react";
import type { AdminWorkDraft } from "@/types/adminImport.types";

interface AdminWorkIdentityFieldsProps {
  work: AdminWorkDraft;
  onChange: (field: keyof AdminWorkDraft, value: string) => void;
}

const inputClass =
  "w-full border border-[#CCCCCC] bg-white px-2.5 py-1.5 font-sans text-sm text-[#111111] outline-none focus:border-[#111111]";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block space-y-1">
    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
      {label}
    </span>
    {children}
  </label>
);

export const AdminWorkIdentityFields: React.FC<AdminWorkIdentityFieldsProps> = ({
  work,
  onChange,
}) => (
  <section className="space-y-3 border border-[#111111] bg-white p-4">
    <div>
      <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
        Work identity · English discovery
      </div>
      <p className="mt-1 text-xs text-[#666666]">
        This is what English readers search and see. It is not the localized edition.
      </p>
    </div>

    <Field label="English title">
      <input
        className={inputClass}
        value={work.title_en}
        onChange={(e) => onChange("title_en", e.target.value)}
      />
    </Field>

    <Field label="Original title">
      <input
        className={inputClass}
        value={work.original_title}
        onChange={(e) => onChange("original_title", e.target.value)}
      />
    </Field>

    <div className="grid grid-cols-2 gap-2">
      <Field label="Creator">
        <input
          className={inputClass}
          value={work.creator}
          onChange={(e) => onChange("creator", e.target.value)}
        />
      </Field>
      <Field label="Original language">
        <input
          className={inputClass}
          value={work.original_language}
          onChange={(e) => onChange("original_language", e.target.value)}
        />
      </Field>
    </div>

    {Boolean(work.series_name) && (
      <div className="border border-[#111111] bg-[#F8F8F6] p-2.5">
        <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#111111]">
          Position in {work.series_name}
        </div>
        <Field label="Volume / Order #">
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
