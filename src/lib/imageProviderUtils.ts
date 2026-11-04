export function normalizeQuery(query: string) {
  return query
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\s.,;:!?¡¿"'»«]+$/u, "");
}

export async function fetchJson(url: string, signal?: AbortSignal): Promise<any> {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Image provider returned HTTP ${response.status}`);
  }
  return response.json();
}
