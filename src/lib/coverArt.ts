export interface CoverArtMeta {
  coverUrl: string | null;
  coverBg: string;
  coverGradient: string;
  coverAccent: string;
  coverCode: string;
}

const FALLBACK_PALETTE: Array<{ bg: string; gradient: string; accent: string }> = [
  { bg: "#1E1B4B", gradient: "linear-gradient(145deg, #0F0B29 0%, #2B0938 52%, #6E1431 100%)", accent: "#FDE68A" },
  { bg: "#1E3A8A", gradient: "linear-gradient(145deg, #0B193C 0%, #1E3A8A 55%, #0F766E 100%)", accent: "#BAE6FD" },
  { bg: "#14532D", gradient: "linear-gradient(145deg, #0A2E1D 0%, #14532D 52%, #365314 100%)", accent: "#BBF7D0" },
  { bg: "#581C87", gradient: "linear-gradient(145deg, #1E1038 0%, #4C1D95 52%, #831843 100%)", accent: "#E9D5FF" },
  { bg: "#7C2D12", gradient: "linear-gradient(145deg, #27130C 0%, #7C2D12 55%, #9A3412 100%)", accent: "#FED7AA" },
  { bg: "#0F172A", gradient: "linear-gradient(145deg, #0F172A 0%, #1E293B 55%, #334155 100%)", accent: "#CBD5E1" },
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
    coverGradient: palette.gradient,
    coverAccent: palette.accent,
    coverCode: `${initials}·ES`,
  };
}
