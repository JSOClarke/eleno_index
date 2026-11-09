import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap } from "lucide-react";
import { fetchDueCardCount } from "@/api/flashcards.api";

interface FlashcardNavbarBadgeProps {
  userId?: string | null;
  learningCount?: number;
}

export const FlashcardNavbarBadge: React.FC<FlashcardNavbarBadgeProps> = ({
  userId,
  learningCount = 0,
}) => {
  const [dueCount, setDueCount] = useState<number | null>(null);
  const location = useLocation();

  const refreshCount = useCallback(() => {
    if (!userId) {
      setDueCount(0);
      return;
    }
    fetchDueCardCount(userId).then(setDueCount);
  }, [userId]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount, learningCount, location.pathname]);

  useEffect(() => {
    const onReviewed = () => {
      setDueCount((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    };
    window.addEventListener("flashcard-reviewed", onReviewed);
    return () => window.removeEventListener("flashcard-reviewed", onReviewed);
  }, []);

  const displayCount = dueCount !== null ? dueCount : learningCount;
  if (!userId || displayCount <= 0) return null;

  return (
    <Link
      to="/reviews"
      title={`${displayCount} flashcard${displayCount > 1 ? "s" : ""} due for review`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#B8FF01] text-[#111111] border border-[#111111] font-mono text-xs font-bold hover:bg-[#a3e600] transition-colors"
    >
      <Zap className="w-3.5 h-3.5 fill-current" />
      <span>{displayCount} DUE</span>
    </Link>
  );
};
