export interface CoverArtMeta {
  coverUrl: string | null;
  coverBg: string;
  coverAccent: string;
  coverCode: string;
}

const FALLBACK_PALETTE: Array<{ bg: string; accent: string }> = [
  { bg: "#111111", accent: "#B8FF01" },
  { bg: "#1E3A8A", accent: "#93C5FD" },
  { bg: "#14532D", accent: "#86EFAC" },
  { bg: "#7F1D1D", accent: "#FBBF24" },
  { bg: "#312E81", accent: "#C7D2FE" },
  { bg: "#3B0764", accent: "#F3E8FF" },
];

function buildTitleInitials(title: string): string {
  const words = title
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2 || wordsCountFallback(title));
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return (title.slice(0, 2) || "ES").toUpperCase();
}

function wordsCountFallback(title: string): boolean {
  return title.trim().split(/\s+/).length < 2;
}

export function resolveCoverArt(title: string, explicitUrl: string | null): CoverArtMeta {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  }
  const palette = FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length];
  const initials = buildTitleInitials(title);

  return {
    coverUrl: explicitUrl,
    coverBg: palette.bg,
    coverAccent: palette.accent,
    coverCode: `${initials}·ES`,
  };
}
