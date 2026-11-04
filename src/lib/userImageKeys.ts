const KEY_PREFIX = "eleno.imageProviderKey.";
export const IMAGE_KEYS_CHANGED = "eleno:image-keys-changed";

export function getImageProviderKey(providerId: string): string {
  try {
    return (window.localStorage.getItem(`${KEY_PREFIX}${providerId}`) || "").trim();
  } catch {
    return "";
  }
}

export function setImageProviderKey(providerId: string, value: string): void {
  try {
    const trimmed = value.trim();
    if (trimmed) {
      window.localStorage.setItem(`${KEY_PREFIX}${providerId}`, trimmed);
    } else {
      window.localStorage.removeItem(`${KEY_PREFIX}${providerId}`);
    }
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(IMAGE_KEYS_CHANGED));
}
