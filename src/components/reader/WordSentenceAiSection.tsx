import React, { useState } from "react";
import { GroqApiKeyControl } from "@/components/ai/GroqApiKeyControl";
import { SentenceAiExplanationCard } from "@/components/ai/SentenceAiExplanationCard";
import { useGroqApiKey } from "@/hooks/useGroqApiKey";
import { explainSentenceInContext } from "@/lib/groqClient";
import type { SentenceAiExplanation } from "@/types/aiContext.types";

interface WordSentenceAiSectionProps {
  sentence?: string;
  targetWord: string;
}

export const WordSentenceAiSection: React.FC<WordSentenceAiSectionProps> = ({
  sentence,
  targetWord,
}) => {
  const { groqApiKey, hasKey, setGroqApiKey, groqModel, setGroqModel } = useGroqApiKey();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<SentenceAiExplanation | null>(null);

  if (!sentence) return null;

  const handleExplain = async () => {
    if (!hasKey) return;
    setLoading(true);
    setError(null);
    try {
      const result = await explainSentenceInContext(sentence, targetWord, groqApiKey, groqModel);
      setExplanation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to explain sentence");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 border-t border-[#E2E2DF] pt-2 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase text-[#666666]">
          SENTENCE CONTEXT
        </span>
        {hasKey && !explanation && (
          <button
            type="button"
            disabled={loading}
            onClick={handleExplain}
            className="flex items-center gap-1 border border-[#111111] bg-[#B8FF01] px-2 py-0.5 font-mono text-[10px] font-bold text-[#111111] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "ANALYZING..." : "✨ EXPLAIN WITH AI"}
          </button>
        )}
      </div>

      <div className="border border-[#E2E2DF] bg-[#FAFAF8] p-2 text-[11px] leading-relaxed text-[#444444] font-sans">
        “{sentence}”
      </div>

      {loading && (
        <div className="flex items-center gap-2 border border-[#111111] bg-[#F8F8F6] p-2 font-mono text-[10px] text-[#111111]">
          <span className="h-2 w-2 animate-ping bg-[#B8FF01]" />
          <span>Analyzing syntax & nuance with {groqModel} on Groq...</span>
        </div>
      )}

      {error && (
        <div className="border border-red-500 bg-red-50 p-2 font-mono text-[10px] text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={handleExplain}
            className="mt-1 font-bold underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {explanation && (
        <SentenceAiExplanationCard explanation={explanation} targetWord={targetWord} />
      )}

      <GroqApiKeyControl
        configured={hasKey}
        selectedModel={groqModel}
        onSelectModel={setGroqModel}
        onSave={(key) => setGroqApiKey(key)}
        onRemove={() => {
          setGroqApiKey("");
          setExplanation(null);
        }}
      />
    </div>
  );
};
