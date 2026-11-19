import { supabase } from "@/lib/supabase";

export type FeedbackKind = "media_request" | "bug" | "other";

export interface SubmitFeedbackInput {
  kind: FeedbackKind;
  language?: string | null;
  title: string;
  details: string;
  pageUrl?: string;
  contactEmail?: string;
  userId?: string | null;
}

export async function submitFeedback(input: SubmitFeedbackInput): Promise<void> {
  if (!supabase) throw new Error("Database connection unavailable.");
  const { error } = await supabase.from("user_feedback").insert({
    user_id: input.userId ?? null,
    kind: input.kind,
    language: input.kind === "media_request" ? input.language || "es" : null,
    title: input.title.trim(),
    details: input.details.trim(),
    page_url: input.pageUrl || null,
    contact_email: input.contactEmail?.trim() || null,
  });
  if (error) throw new Error(error.message || "Could not submit feedback.");
}
