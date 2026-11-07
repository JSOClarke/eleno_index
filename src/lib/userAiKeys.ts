const KEY_PREFIX = "eleno.aiKey.";
export const AI_KEYS_CHANGED = "eleno:ai-keys-changed";

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
