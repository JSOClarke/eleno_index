import React, { useEffect, useState, useCallback } from "react";
import { fetchDueFlashcards, submitFlashcardReview } from "@/api/flashcards.api";
import { checkClozeAnswer, type MatchResult } from "@/lib/clozeMatcher";
import { ClozeCardView } from "@/components/flashcards/ClozeCardView";
import { ClozeHeaderBar } from "@/components/flashcards/ClozeHeaderBar";
import { FlashcardEmptyDeck } from "@/components/flashcards/FlashcardEmptyDeck";
import { FlashcardSummaryScreen } from "@/components/flashcards/FlashcardSummaryScreen";
import type { CardDisplayMode, FlashcardSessionStats, ReviewSessionMode, UserFlashcard } from "@/types/flashcard.types";

interface FlashcardReviewPageProps {
  userId: string;
}

export const FlashcardReviewPage: React.FC<FlashcardReviewPageProps> = ({ userId }) => {
  const [cards, setCards] = useState<UserFlashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionMode, setSessionMode] = useState<ReviewSessionMode>("auto");
  const [input, setInput] = useState("");
  const [hintRevealed, setHintRevealed] = useState(false);
  const [feedbackActive, setFeedbackActive] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isRevealedWithoutAttempt, setIsRevealed] = useState(false);
  const [lenientAccents, setLenientAccents] = useState(true);
  const [stats, setStats] = useState<FlashcardSessionStats>({ total: 0, completed: 0, correct: 0, streak: 0, graduated: 0 });

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
  const activeCardMode: CardDisplayMode = sessionMode === "auto" ? (currentCard?.level === 1 ? "recognition" : "cloze") : sessionMode;

  const handleGradeRecognition = async (isCorrect: boolean) => {
    if (!currentCard) return;
    const updated = await submitFlashcardReview(currentCard, isCorrect);
    if (isCorrect) window.dispatchEvent(new CustomEvent("flashcard-reviewed"));
    setCards((prev) => (isCorrect ? prev.map((c, i) => (i === currentIndex ? updated : c)) : [...prev.map((c, i) => (i === currentIndex ? updated : c)), updated]));
    setStats((s) => ({
      ...s,
      completed: s.completed + 1,
      correct: isCorrect ? s.correct + 1 : s.correct,
      streak: isCorrect ? s.streak + 1 : 0,
      graduated: updated.level >= 2 ? s.graduated + 1 : s.graduated,
    }));
    setCurrentIndex((prev) => prev + 1);
  };

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

  if (loading) return <div className="max-w-2xl mx-auto py-20 text-center font-mono text-sm text-[#666666] animate-pulse">Loading due flashcards...</div>;
  if (cards.length === 0) return <FlashcardEmptyDeck />;
  if (currentIndex >= cards.length) return <FlashcardSummaryScreen stats={stats} onRestart={loadCards} />;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <ClozeHeaderBar
        currentIndex={currentIndex}
        totalCards={cards.length}
        streak={stats.streak}
        sessionMode={sessionMode}
        onChangeSessionMode={setSessionMode}
        activeCardMode={activeCardMode}
        lenientAccents={lenientAccents}
        onToggleLenient={() => setLenientAccents((prev) => !prev)}
      />
      <ClozeCardView
        card={currentCard}
        cardMode={activeCardMode}
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
        onGradeRecognition={handleGradeRecognition}
      />
    </div>
  );
};
