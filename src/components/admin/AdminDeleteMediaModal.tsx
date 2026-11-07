import React, { useState } from "react";
import { deleteCatalogueMediaItem } from "@/api/adminImport.api";

interface AdminDeleteMediaModalProps {
  isOpen: boolean;
  mediaId: string;
  mediaTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminDeleteMediaModal: React.FC<AdminDeleteMediaModalProps> = ({
  isOpen,
  mediaId,
  mediaTitle,
  onClose,
  onSuccess,
}) => {
  const [deleteWork, setDeleteWork] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteCatalogueMediaItem(mediaId, deleteWork);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-mono select-none">
      <div className="w-full max-w-md border-2 border-[#111111] bg-white p-6 shadow-[6px_6px_0px_#111111]">
        <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
          DANGER ZONE · CATALOGUE DELETION
        </div>
        <h3 className="text-lg font-bold text-[#111111] leading-snug">
          Delete «{mediaTitle}»?
        </h3>
        <p className="mt-3 text-xs text-[#555555] leading-relaxed">
          This permanently removes this edition from Supabase, including all parsed sentences,
          vocabulary links, chapter pacing metrics, and cloud reader files.
        </p>

        <label className="mt-4 flex items-start gap-2.5 cursor-pointer text-xs text-[#111111]">
          <input
            type="checkbox"
            checked={deleteWork}
            onChange={(e) => setDeleteWork(e.target.checked)}
            className="mt-0.5"
          />
          <span>Also delete master work record if no other editions exist (enables clean re-ingest)</span>
        </label>

        {error && (
          <div className="mt-3 border border-red-600 bg-red-50 p-2 text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#E2E2DF]">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="border border-[#111111] bg-white px-3.5 py-1.5 text-xs font-bold text-[#111111] hover:bg-[#F4F4F2] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="border border-red-700 bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0px_#111111] hover:bg-red-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
