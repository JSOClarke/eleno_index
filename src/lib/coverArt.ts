export interface CoverArtMeta {
  coverUrl: string | null;
  coverBg: string;
  coverAccent: string;
  coverCode: string;
}

const ROWLING_COVER_MAP: Array<{
  match: string;
  isbn: string;
  bg: string;
  accent: string;
  code: string;
}> = [
  { match: "piedra filosofal", isbn: "9788478884452", bg: "#7F1D1D", accent: "#FBBF24", code: "HP·01" },
  { match: "cámara secreta", isbn: "9788478884957", bg: "#064E3B", accent: "#6EE7B7", code: "HP·02" },
  { match: "prisionero de azkaban", isbn: "9788478885190", bg: "#312E81", accent: "#C7D2FE", code: "HP·03" },
  { match: "cáliz de fuego", isbn: "9788478886456", bg: "#7C2D12", accent: "#FDBA74", code: "HP·04" },
  { match: "orden del fénix", isbn: "9788478887422", bg: "#1E3A8A", accent: "#93C5FD", code: "HP·05" },
  { match: "misterio del príncipe", isbn: "9788478889907", bg: "#14532D", accent: "#86EFAC", code: "HP·06" },
  { match: "reliquias de la muerte", isbn: "9788498381405", bg: "#111827", accent: "#FDE047", code: "HP·07" },
  { match: "legado maldito", isbn: "9788498387544", bg: "#451A03", accent: "#FCD34D", code: "HP·08" },
  { match: "beedle", isbn: "9788498381962", bg: "#1E3A8A", accent: "#93C5FD", code: "BB·01" },
  { match: "quidditch", isbn: "9788478886531", bg: "#78350F", accent: "#FDE68A", code: "QA·01" },
  { match: "animales fantásticos", isbn: "9788478886548", bg: "#365314", accent: "#BEF264", code: "AF·01" },
  { match: "poder, política", isbn: "9781781106280", bg: "#4C1D95", accent: "#DDD6FE", code: "PM·01" },
  { match: "heroísmo", isbn: "9781781106266", bg: "#581C87", accent: "#E9D5FF", code: "PM·02" },
  { match: "guía incompleta", isbn: "9781781106273", bg: "#3B0764", accent: "#F3E8FF", code: "PM·03" },
  { match: "vacante imprevista", isbn: "9788498384925", bg: "#1F2937", accent: "#FCA5A5", code: "UV·01" },
  { match: "canto del cuco", isbn: "9788498385649", bg: "#1E293B", accent: "#93C5FD", code: "CC·01" },
];

export function resolveCoverArt(title: string, explicitUrl: string | null): CoverArtMeta {
  const lower = title.toLowerCase();
  const matched = ROWLING_COVER_MAP.find((entry) => lower.includes(entry.match));

  if (matched) {
    return {
      coverUrl: explicitUrl || `https://covers.openlibrary.org/b/isbn/${matched.isbn}-L.jpg`,
      coverBg: matched.bg,
      coverAccent: matched.accent,
      coverCode: matched.code,
    };
  }

  return {
    coverUrl: explicitUrl,
    coverBg: "#111111",
    coverAccent: "#B8FF01",
    coverCode: "ES·01",
  };
}
