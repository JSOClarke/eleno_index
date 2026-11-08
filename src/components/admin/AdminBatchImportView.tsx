import React, { useEffect, useState } from "react";
import {
  commitBatchImports,
  deleteStagedImport,
  fetchImportsList,
  uploadBatchImports,
} from "@/api/adminImport.api";
import { AdminBatchAuditModal } from "@/components/admin/AdminBatchAuditModal";
import { AdminBatchCommitBar } from "@/components/admin/AdminBatchCommitBar";
import { AdminBatchDropzone } from "@/components/admin/AdminBatchDropzone";
import { AdminBatchTable } from "@/components/admin/AdminBatchTable";
import type { AdminImportJob } from "@/types/adminImport.types";

export const AdminBatchImportView: React.FC = () => {
  const [jobs, setJobs] = useState<AdminImportJob[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [skipReader, setSkipReader] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<AdminImportJob | null>(null);

  const refreshList = async () => {
    try {
      setJobs(await fetchImportsList(50));
    } catch { /* Polling error */ }
  };

  useEffect(() => { void refreshList(); }, []);

  useEffect(() => {
    if (!jobs.some((j) => j.status === "queued" || j.status === "processing")) return;
    const timer = window.setInterval(() => void refreshList(), 2500);
    return () => window.clearInterval(timer);
  }, [jobs]);

  const handleUploadBatch = async (files: File[]) => {
    setUploading(true);
    setError(null);
    try {
      const res = await uploadBatchImports(files);
      if (res.errors?.length) setError(`Errors: ${res.errors.join("; ")}`);
      await refreshList();
      setSelectedIds((prev) => new Set([...prev, ...res.jobs.map((j) => j.id)]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    const pendings = jobs.filter((j) => j.status === "staged" || j.status === "ready");
    const all = pendings.length > 0 && pendings.every((j) => selectedIds.has(j.id));
    setSelectedIds(all ? new Set() : new Set(pendings.map((j) => j.id)));
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStagedImport(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove job");
    }
  };

  const handleCommitSelected = async () => {
    if (selectedIds.size === 0) return;
    setCommitting(true);
    setError(null);
    try {
      await commitBatchImports(Array.from(selectedIds), { skip_reader: skipReader });
      setSelectedIds(new Set());
      await refreshList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch commit failed");
    } finally {
      setCommitting(false);
    }
  };

  const stagedCount = jobs.filter((j) => j.status === "staged" || j.status === "ready").length;

  return (
    <div className="space-y-5">
      <AdminBatchDropzone uploading={uploading} onUploadBatch={(f) => void handleUploadBatch(f)} />
      {error && <div className="border border-red-600 bg-white p-3 font-mono text-xs text-red-700">{error}</div>}
      {jobs.length > 0 && (
        <>
          <AdminBatchTable
            jobs={jobs}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onAuditJob={setEditingJob}
            onDeleteJob={(id) => void handleDelete(id)}
          />
          <AdminBatchCommitBar
            selectedCount={selectedIds.size}
            totalStagedCount={stagedCount}
            skipReader={skipReader}
            onToggleSkipReader={setSkipReader}
            committing={committing}
            onCommitSelected={() => void handleCommitSelected()}
          />
        </>
      )}
      {editingJob && (
        <AdminBatchAuditModal
          job={editingJob}
          onSave={(u) => {
            setJobs((prev) => prev.map((j) => (j.id === u.id ? u : j)));
            setEditingJob(null);
          }}
          onClose={() => setEditingJob(null)}
        />
      )}
    </div>
  );
};
