export interface WordImage {
  id: string;
  provider: string;
  thumbnailUrl: string;
  imageUrl: string;
  sourceUrl: string;
  title: string;
  author?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface ImageProvider {
  id: string;
  label: string;
  isAvailable: () => boolean;
  search: (query: string, signal?: AbortSignal) => Promise<WordImage[]>;
}
