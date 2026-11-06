import React from "react";
import type { AdminEditionDraft, AdminWorkDraft } from "@/types/adminImport.types";

interface AdminImportAuditFormProps {
  work: AdminWorkDraft;
  edition: AdminEditionDraft;
  onWorkChange: (field: keyof AdminWorkDraft, value: string) => void;
  onEditionChange: (field: keyof AdminEditionDraft, value: string) => void;
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

export const AdminImportAuditForm: React.FC<AdminImportAuditFormProps> = ({
  work,
  edition,
  onWorkChange,
  onEditionChange,
}) => (
  <div className="grid gap-4 md:grid-cols-2">
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
          onChange={(event) => onWorkChange("title_en", event.target.value)}
        />
      </Field>
      <Field label="Original title">
        <input
          className={inputClass}
          value={work.original_title}
          onChange={(event) => onWorkChange("original_title", event.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Creator">
          <input
            className={inputClass}
            value={work.creator}
            onChange={(event) => onWorkChange("creator", event.target.value)}
          />
        </Field>
        <Field label="Original language">
          <input
            className={inputClass}
            value={work.original_language}
            onChange={(event) => onWorkChange("original_language", event.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Series">
          <input
            className={inputClass}
            value={work.series_name}
            onChange={(event) => onWorkChange("series_name", event.target.value)}
          />
        </Field>
        <Field label="Order">
          <input
            className={inputClass}
            value={work.series_order}
            onChange={(event) => onWorkChange("series_order", event.target.value)}
          />
        </Field>
        <Field label="Label">
          <input
            className={inputClass}
            placeholder="e.g. Book 1"
            value={work.series_label}
            onChange={(event) => onWorkChange("series_label", event.target.value)}
          />
        </Field>
      </div>
      <Field label="English synopsis">
        <textarea
          className={`${inputClass} min-h-[110px] resize-y`}
          value={work.synopsis_en}
          onChange={(event) => onWorkChange("synopsis_en", event.target.value)}
        />
      </Field>
    </section>

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
          onChange={(event) => onEditionChange("title", event.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Author">
          <input
            className={inputClass}
            value={edition.author}
            onChange={(event) => onEditionChange("author", event.target.value)}
          />
        </Field>
        <Field label="Language">
          <input
            className={inputClass}
            value={edition.language}
            onChange={(event) => onEditionChange("language", event.target.value)}
          />
        </Field>
      </div>
      <Field label="Edition synopsis">
        <textarea
          className={`${inputClass} min-h-[110px] resize-y`}
          value={edition.synopsis}
          onChange={(event) => onEditionChange("synopsis", event.target.value)}
        />
      </Field>
      <Field label="Release year">
        <input
          className={inputClass}
          value={edition.release_year}
          onChange={(event) => onEditionChange("release_year", event.target.value)}
        />
      </Field>
    </section>
  </div>
);
