import React, { useEffect, useState } from "react";
import type { FeedbackKind } from "@/api/feedback.api";
import { FeedbackModal } from "./FeedbackModal";
import { SiteFooter } from "./SiteFooter";

interface FeedbackHubProps {
  activeLanguage: string;
  userId?: string | null;
}

export function openFeedbackModal(detail?: { kind?: FeedbackKind; title?: string }) {
  window.dispatchEvent(new CustomEvent("threshold:open-feedback", { detail: detail || {} }));
}

export const FeedbackHub: React.FC<FeedbackHubProps> = ({ activeLanguage, userId }) => {
  const [open, setOpen] = useState(false);
  const [defaultKind, setDefaultKind] = useState<FeedbackKind>("media_request");
  const [defaultTitle, setDefaultTitle] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ kind?: FeedbackKind; title?: string }>).detail || {};
      setDefaultKind(detail.kind || "media_request");
      setDefaultTitle(detail.title || "");
      setOpen(true);
    };
    window.addEventListener("threshold:open-feedback", handler);
    return () => window.removeEventListener("threshold:open-feedback", handler);
  }, []);

  return (
    <>
      <SiteFooter onOpenFeedback={() => { setDefaultKind("media_request"); setDefaultTitle(""); setOpen(true); }} />
      <FeedbackModal
        isOpen={open}
        onClose={() => setOpen(false)}
        defaultKind={defaultKind}
        defaultTitle={defaultTitle}
        activeLanguage={activeLanguage}
        userId={userId}
      />
    </>
  );
};
