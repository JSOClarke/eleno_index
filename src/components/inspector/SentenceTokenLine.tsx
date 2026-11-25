import React from "react";
import type { SentenceToken } from "@/types/sentence.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { SentenceTokenSpan } from "./SentenceTokenSpan";

interface SentenceTokenLineProps {
  sentence: string;
  tokens: SentenceToken[];
  targetCanonicalId: string;
  statusMap: Record<string, UserVocabStatus>;
  selectedToken?: SentenceToken | null;
  onSelectToken?: (token: SentenceToken) => void;
}

export const SentenceTokenLine: React.FC<SentenceTokenLineProps> = ({
  sentence,
  tokens,
  targetCanonicalId,
  statusMap,
  selectedToken,
  onSelectToken,
}) => {
  if (tokens.length === 0) return <>{sentence}</>;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  tokens.forEach((token, index) => {
    const start = Math.max(cursor, Math.min(token.start_char, sentence.length));
    const end = Math.max(start, Math.min(token.end_char, sentence.length));

    if (start > cursor) {
      nodes.push(
        <React.Fragment key={`gap-${index}`}>{sentence.slice(cursor, start)}</React.Fragment>
      );
    }

    nodes.push(
      <SentenceTokenSpan
        key={`token-${index}`}
        token={token}
        status={token.canonical_id ? statusMap[token.canonical_id] : undefined}
        isTarget={Boolean(token.canonical_id && token.canonical_id === targetCanonicalId)}
        isSelected={Boolean(
          selectedToken &&
            selectedToken.start_char === token.start_char &&
            selectedToken.end_char === token.end_char
        )}
        onSelect={onSelectToken}
      />
    );
    cursor = Math.max(cursor, end);
  });

  if (cursor < sentence.length) {
    nodes.push(<React.Fragment key="tail">{sentence.slice(cursor)}</React.Fragment>);
  }

  return <>{nodes}</>;
};
