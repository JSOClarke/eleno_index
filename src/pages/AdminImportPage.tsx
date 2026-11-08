import React, { useState } from "react";
import { AdminBatchImportView } from "@/components/admin/AdminBatchImportView";
import { AdminSingleImportView } from "@/components/admin/AdminSingleImportView";

export const AdminImportPage: React.FC = () => {
  const [mode, setMode] = useState<"single" | "batch">("single");

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#111111] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#111111]">Import Workbench</h1>
          <p className="mt-1 font-mono text-xs text-[#666666]">
            Stage EPUBs, audit franchise/work/edition metadata, then commit to the corpus.
          </p>
        </div>

        <div className="flex border border-[#111111] bg-[#F4F4F2] p-0.5">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`px-3 py-1 font-mono text-xs font-bold transition-colors cursor-pointer ${
              mode === "single"
                ? "bg-[#111111] text-white shadow-sm"
                : "text-[#666666] hover:text-[#111111]"
            }`}
          >
            Single Book Audit
          </button>
          <button
            type="button"
            onClick={() => setMode("batch")}
            className={`px-3 py-1 font-mono text-xs font-bold transition-colors cursor-pointer ${
              mode === "batch"
                ? "bg-[#111111] text-white shadow-sm"
                : "text-[#666666] hover:text-[#111111]"
            }`}
          >
            Batch Library Import
          </button>
        </div>
      </div>

      {mode === "single" ? <AdminSingleImportView /> : <AdminBatchImportView />}
    </div>
  );
};
