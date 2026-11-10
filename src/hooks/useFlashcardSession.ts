import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchDueCardCount,
  fetchDueFlashcards,
  fetchFlashcardQueueSummary,
} from "@/api/flashcards.api";
import { enrichFlashcardSentence } from "@/api/flashcardEnricher";
import type {
  FlashcardQueueSummary,
  FlashcardSessionStats,
  UserFlashcard,
} from "@/types/flashcard.types";

export function useFlashcardSession(userId: string) {
  const [cards, setCards] = useState<UserFlashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingDue, setRemainingDue] = useState(0);
  const [queueSummary, setQueueSummary] = useState<FlashcardQueueSummary | null>(null);
  const [stats, setStats] = useState<FlashcardSessionStats>({
    total: 0,
    completed: 0,
    correct: 0,
    streak: 0,
    graduated: 0,
  });

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const [dueCards, totalDue, qSummary] = await Promise.all([
        fetchDueFlashcards(userId, 20),
        fetchDueCardCount(userId),
        fetchFlashcardQueueSummary(userId),
      ]);
      setRemainingDue(Math.max(0, totalDue - dueCards.length));
      setQueueSummary(qSummary);
      setCards(dueCards);
      setCurrentIndex(0);
      setStats({ total: dueCards.length, completed: 0, correct: 0, streak: 0, graduated: 0 });

      // Immediately enrich Card 1 so it's ready on screen
      if (dueCards[0]) {
        enrichFlashcardSentence(dueCards[0], userId).then((enriched) => {
          setCards((prev) => prev.map((c, i) => (i === 0 ? enriched : c)));
        });
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  useEffect(() => {
    if (cards.length > 0 && currentIndex >= cards.length) {
      fetchDueCardCount(userId).then(setRemainingDue);
      fetchFlashcardQueueSummary(userId).then(setQueueSummary);
    }
  }, [cards.length, currentIndex, userId]);

  // Progressive background prefetch: look ahead 2 cards
  const enrichingRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!cards.length) return;
    const lookahead = 2;
    for (let i = currentIndex; i <= Math.min(currentIndex + lookahead, cards.length - 1); i++) {
      const card = cards[i];
      if (
        card &&
        card.sentence.startsWith("Esta palabra está") &&
        !enrichingRef.current.has(card.canonical_id)
      ) {
        enrichingRef.current.add(card.canonical_id);
        const cardIndex = i;
        enrichFlashcardSentence(card, userId).then((enriched) => {
          setCards((prev) => prev.map((c, idx) => (idx === cardIndex ? enriched : c)));
        });
      }
    }
  }, [cards, currentIndex, userId]);

  return {
    cards,
    setCards,
    loading,
    currentIndex,
    setCurrentIndex,
    stats,
    setStats,
    remainingDue,
    queueSummary,
    loadCards,
  };
}
