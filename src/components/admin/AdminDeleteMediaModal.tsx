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
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-xs p-4 select-none">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="text-xs font-semibold text-red-600 mb-1">
          Permanent deletion
        </div>
        <h3 className="font-serif text-xl font-medium text-slate-900 leading-snug">
          Delete «{mediaTitle}»?
        </h3>
        <p className="mt-2.5 text-xs text-slate-500 leading-relaxed">
          This permanently removes this edition from the database, including all indexed sentences,
          vocabulary links, and chapter breakdown metrics.
        </p>

        <label className="mt-4 flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
          <input
            type="checkbox"
            checked={deleteWork}
            onChange={(e) => setDeleteWork(e.target.checked)}
            className="mt-0.5 rounded accent-slate-900"
          />
          <span>Also delete parent work if no other editions remain</span>
        </label>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer transition"
          >
            {loading ? "Deleting..." : "Confirm delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
