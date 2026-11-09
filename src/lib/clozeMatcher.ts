export function stripAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export interface MatchResult {
  isMatch: boolean;
  isExact: boolean;
  isAccentLenient: boolean;
  isLemmaMatch: boolean;
}

export function checkClozeAnswer(
  userInput: string,
  targetSurface: string,
  targetLemma: string,
  lenientAccents: boolean
): MatchResult {
  const cleanInput = userInput.trim().toLowerCase();
  const cleanSurface = targetSurface.trim().toLowerCase();
  const cleanLemma = targetLemma.trim().toLowerCase();

  const isExactSurface = cleanInput === cleanSurface;
  const isExactLemma = cleanInput === cleanLemma;

  if (isExactSurface) {
    return { isMatch: true, isExact: true, isAccentLenient: false, isLemmaMatch: false };
  }
  if (isExactLemma) {
    return { isMatch: true, isExact: true, isAccentLenient: false, isLemmaMatch: true };
  }

  if (lenientAccents) {
    const strippedInput = stripAccents(userInput);
    const strippedSurface = stripAccents(targetSurface);
    const strippedLemma = stripAccents(targetLemma);

    if (strippedInput === strippedSurface) {
      return { isMatch: true, isExact: false, isAccentLenient: true, isLemmaMatch: false };
    }
    if (strippedInput === strippedLemma) {
      return { isMatch: true, isExact: false, isAccentLenient: true, isLemmaMatch: true };
    }
  }

  return { isMatch: false, isExact: false, isAccentLenient: false, isLemmaMatch: false };
}
