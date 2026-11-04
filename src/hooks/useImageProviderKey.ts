import { useCallback, useEffect, useState } from "react";
import {
  getImageProviderKey,
  IMAGE_KEYS_CHANGED,
  setImageProviderKey,
} from "@/lib/userImageKeys";

/** Per-browser API key for one image provider. Never sent anywhere but the provider. */
export function useImageProviderKey(providerId: string) {
  const [key, setKey] = useState(() => getImageProviderKey(providerId));

  useEffect(() => {
    const sync = () => setKey(getImageProviderKey(providerId));
    sync();
    window.addEventListener(IMAGE_KEYS_CHANGED, sync);
    return () => window.removeEventListener(IMAGE_KEYS_CHANGED, sync);
  }, [providerId]);

  const save = useCallback(
    (value: string) => {
      setImageProviderKey(providerId, value);
      setKey(getImageProviderKey(providerId));
    },
    [providerId]
  );

  return { key, save, configured: key.length > 0 };
}
