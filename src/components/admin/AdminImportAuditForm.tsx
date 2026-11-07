import React from "react";
import { AdminSeriesSelector } from "./AdminSeriesSelector";
import { AdminWorkIdentityFields } from "./AdminWorkIdentityFields";
import { AdminEditionFields } from "./AdminEditionFields";
import type { AdminEditionDraft, AdminWorkDraft } from "@/types/adminImport.types";

interface AdminImportAuditFormProps {
  work: AdminWorkDraft;
  edition: AdminEditionDraft;
  onWorkChange: (field: keyof AdminWorkDraft, value: string) => void;
  onEditionChange: (field: keyof AdminEditionDraft, value: string) => void;
  onSeriesChange: (seriesId: string | undefined, seriesName: string) => void;
}

export const AdminImportAuditForm: React.FC<AdminImportAuditFormProps> = ({
  work,
  edition,
  onWorkChange,
  onEditionChange,
  onSeriesChange,
}) => (
  <div className="space-y-4">
    <AdminSeriesSelector
      seriesId={work.series_id}
      seriesName={work.series_name}
      onChange={onSeriesChange}
    />

    <div className="grid gap-4 md:grid-cols-2">
      <AdminWorkIdentityFields work={work} onChange={onWorkChange} />
      <AdminEditionFields edition={edition} onChange={onEditionChange} />
    </div>
  </div>
);
