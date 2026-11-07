const KEY_PREFIX = "eleno.aiKey.";
const MODEL_PREFIX = "eleno.aiModel.";
export const AI_KEYS_CHANGED = "eleno:ai-keys-changed";
export const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

export function getGroqApiKey(): string {
  try {
    return (window.localStorage.getItem(`${KEY_PREFIX}groq`) || "").trim();
  } catch {
    return "";
  }
}

export function setGroqApiKey(value: string): void {
  try {
    const trimmed = value.trim();
    if (trimmed) {
      window.localStorage.setItem(`${KEY_PREFIX}groq`, trimmed);
    } else {
      window.localStorage.removeItem(`${KEY_PREFIX}groq`);
    }
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(AI_KEYS_CHANGED));
}

export function getGroqModel(): string {
  try {
    return (window.localStorage.getItem(`${MODEL_PREFIX}groq`) || DEFAULT_GROQ_MODEL).trim();
  } catch {
    return DEFAULT_GROQ_MODEL;
  }
}

export function setGroqModel(model: string): void {
  try {
    const trimmed = model.trim();
    if (trimmed) {
      window.localStorage.setItem(`${MODEL_PREFIX}groq`, trimmed);
    } else {
      window.localStorage.removeItem(`${MODEL_PREFIX}groq`);
    }
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(AI_KEYS_CHANGED));
}
