import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen } from "lucide-react";
import { fetchDueFlashcards, submitFlashcardReview } from "@/api/flashcards.api";
import { checkClozeAnswer, type MatchResult } from "@/lib/clozeMatcher";
import { ClozeCardView } from "@/components/flashcards/ClozeCardView";
import { ClozeHeaderBar } from "@/components/flashcards/ClozeHeaderBar";
import { FlashcardSummaryScreen } from "@/components/flashcards/FlashcardSummaryScreen";
import type { FlashcardSessionStats, UserFlashcard } from "@/types/flashcard.types";

interface FlashcardReviewPageProps {
  userId: string;
}

export const FlashcardReviewPage: React.FC<FlashcardReviewPageProps> = ({ userId }) => {
  const [cards, setCards] = useState<UserFlashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [hintRevealed, setHintRevealed] = useState(false);
  const [feedbackActive, setFeedbackActive] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isRevealedWithoutAttempt, setIsRevealed] = useState(false);
  const [lenientAccents, setLenientAccents] = useState(true);
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
      const dueCards = await fetchDueFlashcards(userId, 40);
      setCards(dueCards);
      setCurrentIndex(0);
      setStats({ total: dueCards.length, completed: 0, correct: 0, streak: 0, graduated: 0 });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const currentCard = cards[currentIndex];

  const handleSubmit = async () => {
    if (!currentCard || !input.trim() || feedbackActive) return;
    const match = checkClozeAnswer(input, currentCard.target_surface, currentCard.target_lemma, lenientAccents);
    setMatchResult(match);
    setIsRevealed(false);
    setFeedbackActive(true);

    const updated = await submitFlashcardReview(currentCard, match.isMatch);
    if (match.isMatch) window.dispatchEvent(new CustomEvent("flashcard-reviewed"));
    setCards((prev) => prev.map((c, i) => (i === currentIndex ? updated : c)));
    setStats((s) => ({
      ...s,
      completed: s.completed + 1,
      correct: match.isMatch ? s.correct + 1 : s.correct,
      streak: match.isMatch ? s.streak + 1 : 0,
      graduated: updated.level >= 6 ? s.graduated + 1 : s.graduated,
    }));
  };

  const handleReveal = async () => {
    if (!currentCard || feedbackActive) return;
    setIsRevealed(true);
    setMatchResult({ isMatch: false, isExact: false, isAccentLenient: false, isLemmaMatch: false });
    setFeedbackActive(true);

    const updated = await submitFlashcardReview(currentCard, false);
    setCards((prev) => [...prev.map((c, i) => (i === currentIndex ? updated : c)), updated]);
    setStats((s) => ({ ...s, completed: s.completed + 1, streak: 0 }));
  };

  const handleContinue = () => {
    setInput("");
    setHintRevealed(false);
    setFeedbackActive(false);
    setMatchResult(null);
    setIsRevealed(false);
    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center font-mono text-sm text-[#666666] animate-pulse">
        Loading due flashcards...
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="inline-flex p-3 bg-[#F8F8F6] border border-[#111111]">
          <Sparkles className="w-6 h-6 text-[#111111]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#111111]">Deck is All Clear!</h2>
        <p className="font-mono text-xs text-[#666666]">
          No flashcards are due right now. Mark words as learning while reading to create new cloze cards.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-[#B8FF01] font-mono text-xs font-bold border border-[#111111] hover:bg-[#222222]"
        >
          <BookOpen className="w-4 h-4" />
          <span>BROWSE CATALOGUE</span>
        </Link>
      </div>
    );
  }

  if (currentIndex >= cards.length) {
    return <FlashcardSummaryScreen stats={stats} onRestart={loadCards} />;
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <ClozeHeaderBar
        currentIndex={currentIndex}
        totalCards={cards.length}
        streak={stats.streak}
        lenientAccents={lenientAccents}
        onToggleLenient={() => setLenientAccents((prev) => !prev)}
      />
      <ClozeCardView
        card={currentCard}
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onReveal={handleReveal}
        onHint={() => setHintRevealed(true)}
        hintRevealed={hintRevealed}
        feedbackActive={feedbackActive}
        matchResult={matchResult}
        isRevealedWithoutAttempt={isRevealedWithoutAttempt}
        onContinue={handleContinue}
      />
    </div>
  );
};
