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
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<SentenceAiExplanation | null>(null);

  if (!sentence) return null;

  const handleExplain = async () => {
    if (!hasKey) {
      setShowConfig(true);
      return;
    }
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
    <div className="space-y-1.5 border-t border-[#E2E2DF] pt-1.5 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#666666]">
          AI CONTEXT
        </span>
        <div className="flex items-center gap-1.5">
          {hasKey && !explanation && (
            <button
              type="button"
              disabled={loading}
              onClick={handleExplain}
              className="border border-[#111111] bg-[#B8FF01] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#111111] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "ANALYZING..." : "EXPLAIN"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowConfig((c) => !c)}
            className="font-mono text-[9px] text-[#888888] hover:text-[#111111] underline cursor-pointer"
          >
            {hasKey ? (showConfig ? "HIDE CFG" : "CFG") : "+ GROQ KEY"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-1.5 border border-[#111111] bg-[#F8F8F6] px-2 py-1 font-mono text-[9px] text-[#111111]">
          <span className="h-1.5 w-1.5 animate-ping bg-[#B8FF01]" />
          <span>ANALYZING SYNTAX & NUANCE...</span>
        </div>
      )}

      {error && (
        <div className="border border-red-500 bg-red-50 p-1.5 font-mono text-[9px] text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={handleExplain}
            className="mt-0.5 font-bold underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {explanation && (
        <SentenceAiExplanationCard
          explanation={explanation}
          targetWord={targetWord}
          onHide={() => setExplanation(null)}
        />
      )}

      {showConfig && (
        <GroqApiKeyControl
          configured={hasKey}
          selectedModel={groqModel}
          onSelectModel={setGroqModel}
          onSave={(key) => {
            setGroqApiKey(key);
            setShowConfig(false);
          }}
          onRemove={() => {
            setGroqApiKey("");
            setExplanation(null);
          }}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
};
