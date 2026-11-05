import type {
  AdminCommitPayload,
  AdminImportJob,
  AdminWorkMatch,
} from "@/types/adminImport.types";

const BASE_URL = import.meta.env.VITE_ADMIN_API_URL || "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.error || `Request failed (${response.status})`);
  }
  return data as T;
}

export function uploadImport(file: File): Promise<AdminImportJob> {
  const body = new FormData();
  body.append("file", file);
  return request<AdminImportJob>("/admin/imports", { method: "POST", body });
}

export function fetchImport(jobId: string): Promise<AdminImportJob> {
  return request<AdminImportJob>(`/admin/imports/${jobId}`);
}

export function searchAdminWorks(query: string): Promise<AdminWorkMatch[]> {
  return request<{ works: AdminWorkMatch[] }>(`/admin/works?q=${encodeURIComponent(query)}`).then(
    (data) => data.works
  );
}

export function commitImport(jobId: string, payload: AdminCommitPayload): Promise<AdminImportJob> {
  return request<AdminImportJob>(`/admin/imports/${jobId}/commit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
