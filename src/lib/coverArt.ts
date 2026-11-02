export interface CoverArtMeta {
  coverUrl: string | null;
  coverBg: string;
  coverAccent: string;
  coverCode: string;
}

const ROWLING_COVER_PALETTE: Array<{
  match: string;
  bg: string;
  accent: string;
  code: string;
}> = [
  { match: "piedra filosofal", bg: "#7F1D1D", accent: "#FBBF24", code: "HP·01" },
  { match: "cámara secreta", bg: "#064E3B", accent: "#6EE7B7", code: "HP·02" },
  { match: "prisionero de azkaban", bg: "#312E81", accent: "#C7D2FE", code: "HP·03" },
  { match: "cáliz de fuego", bg: "#7C2D12", accent: "#FDBA74", code: "HP·04" },
  { match: "orden del fénix", bg: "#1E3A8A", accent: "#93C5FD", code: "HP·05" },
  { match: "misterio del príncipe", bg: "#14532D", accent: "#86EFAC", code: "HP·06" },
  { match: "reliquias de la muerte", bg: "#111827", accent: "#FDE047", code: "HP·07" },
  { match: "legado maldito", bg: "#451A03", accent: "#FCD34D", code: "HP·08" },
  { match: "beedle", bg: "#1E3A8A", accent: "#93C5FD", code: "BB·01" },
  { match: "quidditch", bg: "#78350F", accent: "#FDE68A", code: "QA·01" },
  { match: "animales fantásticos", bg: "#365314", accent: "#BEF264", code: "AF·01" },
  { match: "poder, política", bg: "#4C1D95", accent: "#DDD6FE", code: "PM·01" },
  { match: "heroísmo", bg: "#581C87", accent: "#E9D5FF", code: "PM·02" },
  { match: "guía incompleta", bg: "#3B0764", accent: "#F3E8FF", code: "PM·03" },
  { match: "vacante imprevista", bg: "#1F2937", accent: "#FCA5A5", code: "UV·01" },
];

export function resolveCoverArt(title: string, explicitUrl: string | null): CoverArtMeta {
  const lower = title.toLowerCase();
  const matched = ROWLING_COVER_PALETTE.find((entry) => lower.includes(entry.match));

  return {
    coverUrl: explicitUrl,
    coverBg: matched?.bg || "#111111",
    coverAccent: matched?.accent || "#B8FF01",
    coverCode: matched?.code || "ES·01",
  };
}
