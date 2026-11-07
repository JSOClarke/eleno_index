import { useEffect, useState } from "react";
import {
  AI_KEYS_CHANGED,
  DEFAULT_GROQ_MODEL,
  getGroqApiKey,
  getGroqModel,
  setGroqApiKey,
  setGroqModel,
} from "@/lib/userAiKeys";

export function useGroqApiKey() {
  const [groqKey, setKey] = useState<string>(() => getGroqApiKey());
  const [groqModel, setModel] = useState<string>(() => getGroqModel());

  useEffect(() => {
    const handleKeyChange = () => {
      setKey(getGroqApiKey());
      setModel(getGroqModel());
    };
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
    groqModel: groqModel || DEFAULT_GROQ_MODEL,
    setGroqModel,
  };
}
