import React from "react";
import type { AdminEditionDraft } from "@/types/adminImport.types";

interface AdminEditionFieldsProps {
  edition: AdminEditionDraft;
  onChange: (field: keyof AdminEditionDraft, value: string) => void;
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

export const AdminEditionFields: React.FC<AdminEditionFieldsProps> = ({
  edition,
  onChange,
}) => (
  <section className="space-y-3 border border-[#111111] bg-white p-4">
    <div>
      <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
        Edition · localized reading item
      </div>
      <p className="mt-1 text-xs text-[#666666]">
        This is the file being ingested and the title students will read.
      </p>
    </div>

    <Field label="Edition title">
      <input
        className={inputClass}
        value={edition.title}
        onChange={(e) => onChange("title", e.target.value)}
      />
    </Field>

    <div className="grid grid-cols-2 gap-2">
      <Field label="Author">
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
