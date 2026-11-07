export type ComicReadingDirection = "ltr" | "rtl";
export type ComicViewMode = "fit-width" | "fit-height" | "original";

export interface ComicToken {
  surface: string;
  lemma: string;
  pos: string;
  cefr: string | null;
  rank: number | null;
  canonical_id: string | null;
  definition: string | null;
  box: [number, number, number, number]; // [x0, y0, x1, y1] in pixel coords
  quarantine: "proper_noun" | "sfx" | "noise" | null;
}

export interface ComicParagraph {
  text: string;
  box: [number, number, number, number];
  confidence: number;
  tokens: ComicToken[];
}

export interface ComicPageMeta {
  index: number;
  image: string;
  ocr: string;
  width: number;
  height: number;
}

export interface ComicPageData {
  page_index: number;
  width: number;
  height: number;
  image_url: string;
  paragraphs: ComicParagraph[];
}

export interface ElenoComicManifest {
  format: "elenocbz";
  schema_version: number;
  media_item_id: string;
  title: string;
  creator?: string;
  type: "comic" | "manga";
  reading_direction?: ComicReadingDirection;
  page_count: number;
  pages: ComicPageMeta[];
  metrics?: {
    total_tokens: number;
    unique_lemmas: number;
    cefr_distribution: Record<string, number>;
    quarantine_summary: Record<string, number>;
  };
}
