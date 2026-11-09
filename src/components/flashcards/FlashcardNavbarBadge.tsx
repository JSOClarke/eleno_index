import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap } from "lucide-react";
import { fetchFlashcardQueueSummary } from "@/api/flashcards.api";
import type { FlashcardQueueSummary } from "@/types/flashcard.types";

interface FlashcardNavbarBadgeProps {
  userId?: string | null;
  learningCount?: number;
}

export const FlashcardNavbarBadge: React.FC<FlashcardNavbarBadgeProps> = ({
  userId,
  learningCount = 0,
}) => {
  const [summary, setSummary] = useState<FlashcardQueueSummary | null>(null);
  const location = useLocation();

  const refreshCount = useCallback(() => {
    if (!userId) {
      setSummary(null);
      return;
    }
    fetchFlashcardQueueSummary(userId).then(setSummary);
  }, [userId]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount, learningCount, location.pathname]);

  useEffect(() => {
    const onReviewed = () => {
      setSummary((prev) => {
        if (!prev) return prev;
        if (prev.dueReviews > 0) return { ...prev, dueReviews: prev.dueReviews - 1 };
        if (prev.newUnstarted > 0) return { ...prev, newUnstarted: prev.newUnstarted - 1 };
        return prev;
      });
    };
    window.addEventListener("flashcard-reviewed", onReviewed);
    return () => window.removeEventListener("flashcard-reviewed", onReviewed);
  }, []);

  if (!userId || !summary || (summary.dueReviews <= 0 && summary.newUnstarted <= 0)) {
    return null;
  }

  const { dueReviews, newUnstarted } = summary;

  return (
    <Link
      to="/reviews"
      title={`${dueReviews} due review(s), ${newUnstarted} new card(s) in backlog`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#B8FF01] text-[#111111] border border-[#111111] font-mono text-xs font-bold hover:bg-[#a3e600] transition-colors shadow-sm"
    >
      <Zap className="w-3.5 h-3.5 fill-current" />
      {dueReviews > 0 && newUnstarted > 0 ? (
        <span>{dueReviews} DUE · {newUnstarted} NEW</span>
      ) : dueReviews > 0 ? (
        <span>{dueReviews} DUE</span>
      ) : (
        <span>{newUnstarted} NEW</span>
      )}
    </Link>
  );
};
