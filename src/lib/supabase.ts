import { createClient } from "@supabase/supabase-js";

export function resolveLocalHostUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;
  if (
    typeof window !== "undefined" &&
    window.location.hostname &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return rawUrl.replace(/\/\/(127\.0\.0\.1|localhost)(?=[:/]|$)/, `//${window.location.hostname}`);
  }
  return rawUrl;
}

const supabaseUrl = resolveLocalHostUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[inputhub /es] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment.");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);
