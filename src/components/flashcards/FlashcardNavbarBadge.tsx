import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap } from "lucide-react";
import { fetchDueCardCount } from "@/api/flashcards.api";

interface FlashcardNavbarBadgeProps {
  userId?: string | null;
}

export const FlashcardNavbarBadge: React.FC<FlashcardNavbarBadgeProps> = ({ userId }) => {
  const [dueCount, setDueCount] = useState<number>(0);
  const location = useLocation();

  useEffect(() => {
    if (!userId) {
      setDueCount(0);
      return;
    }
    let cancelled = false;
    fetchDueCardCount(userId).then((count) => {
      if (!cancelled) setDueCount(count);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, location.pathname]);

  if (!userId || dueCount <= 0) return null;

  return (
    <Link
      to="/reviews"
      title={`${dueCount} flashcard${dueCount > 1 ? "s" : ""} due for review`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#B8FF01] text-[#111111] border border-[#111111] font-mono text-xs font-bold hover:bg-[#a3e600] transition-colors"
    >
      <Zap className="w-3.5 h-3.5 fill-current" />
      <span>{dueCount} DUE</span>
    </Link>
  );
};
