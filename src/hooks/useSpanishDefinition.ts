import { useEffect, useState } from "react";
import { fetchSpanishDefinition } from "@/api/definitions.api";
import type { CanonicalDefinition } from "@/types/canonicalDefinition.types";

export function useSpanishDefinition(canonicalId: string | null) {
  const [definition, setDefinition] = useState<CanonicalDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canonicalId) {
      setDefinition(null);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchSpanishDefinition(canonicalId)
      .then((row) => {
        if (!cancelled) setDefinition(row);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canonicalId]);

  return { definition, loading, error };
}
