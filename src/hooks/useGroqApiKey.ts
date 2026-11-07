import { useEffect, useState } from "react";
import { AI_KEYS_CHANGED, getGroqApiKey, setGroqApiKey } from "@/lib/userAiKeys";

export function useGroqApiKey() {
  const [groqKey, setKey] = useState<string>(() => getGroqApiKey());

  useEffect(() => {
    const handleKeyChange = () => setKey(getGroqApiKey());
    window.addEventListener(AI_KEYS_CHANGED, handleKeyChange);
    window.addEventListener("storage", handleKeyChange);
    return () => {
      window.removeEventListener(AI_KEYS_CHANGED, handleKeyChange);
      window.removeEventListener("storage", handleKeyChange);
    };
  }, []);

  return {
    groqApiKey: groqKey,
    hasKey: Boolean(groqKey),
    setGroqApiKey,
  };
}
