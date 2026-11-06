export interface AdminWorkMatch {
  id: string;
  title_en?: string | null;
  original_title: string;
  creator: string;
  original_language?: string | null;
  series_id?: string | null;
  series_name?: string | null;
  series_order?: number | null;
  series_label?: string | null;
  media_item?: { id: string; title: string; language: string; format: string }[];
}

export interface AdminImportJob {
  id: string;
  filename: string;
  status: "staged" | "ready" | "queued" | "processing" | "completed" | "failed";
  metadata: {
    title?: string;
    author?: string;
    language?: string;
    type?: string;
    synopsis?: string | null;
    cover_image_url?: string | null;
    release_year?: number | null;
    file_checksum?: string | null;
    external_ids?: Record<string, unknown>;
  };
  work_candidate?: {
    original_title?: string;
    title_en?: string | null;
    synopsis?: string | null;
    synopsis_en?: string | null;
    creator?: string;
    original_language?: string;
    type?: string;
    series_id?: string | null;
    series_name?: string | null;
    series_order?: number | null;
    series_label?: string | null;
    external_ids?: Record<string, unknown>;
  };
  edition_candidate?: {
    title?: string;
    creator?: string;
    language?: string;
    synopsis?: string | null;
    release_year?: number | null;
    external_ids?: Record<string, unknown>;
  };
  work_matches?: AdminWorkMatch[];
  existing_item?: { id: string; title: string } | null;
  chapter_count?: number;
  word_count?: number;
  warnings?: string[];
  error?: string | null;
  work_id?: string | null;
  result?: {
    media_item_id?: string;
    title?: string;
    tokens?: number;
    unique_words?: number;
    reader_status?: string;
  } | null;
}

export interface AdminWorkDraft {
  original_title: string;
  title_en: string;
  creator: string;
  original_language: string;
  synopsis_en: string;
  series_name: string;
  series_order: string;
  series_label: string;
}

export interface AdminEditionDraft {
  title: string;
  author: string;
  language: string;
  synopsis: string;
  release_year: string;
}

export interface AdminCommitPayload {
  work_id?: string;
  work?: Record<string, unknown>;
  edition?: Record<string, unknown>;
}
