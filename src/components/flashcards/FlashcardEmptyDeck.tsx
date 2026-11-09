import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen } from "lucide-react";

export const FlashcardEmptyDeck: React.FC = () => (
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
