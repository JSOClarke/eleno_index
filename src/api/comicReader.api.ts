import { supabase } from "@/lib/supabase";
import { fetchLocalComicPage } from "@/lib/elenocbzLocal";
import type { ComicPageData, ComicPageMeta, ElenoComicManifest } from "@/types/comicReader.types";

const BUCKET = "media-reader";

export async function fetchComicManifest(
  mediaItemId: string
): Promise<ElenoComicManifest> {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(`${mediaItemId}/manifest.json`);
  const res = await fetch(`${data.publicUrl}?t=${Date.now()}`, { cache: "no-cache" });
  if (!res.ok) {
    throw new Error(`Failed to load comic manifest for ${mediaItemId} (${res.status})`);
  }
  const manifest = await res.json();
  manifest.media_item_id = mediaItemId;
  return manifest;
}

export async function fetchComicPage(
  mediaItemId: string,
  pageMeta: ComicPageMeta
): Promise<ComicPageData> {
  if (mediaItemId === "local") {
    return fetchLocalComicPage(pageMeta.index);
  }

  const ocrPath = `${mediaItemId}/${pageMeta.ocr.replace(/^\/+/, "")}`;
  const imagePath = `${mediaItemId}/${pageMeta.image.replace(/^\/+/, "")}`;

  const { data: imgData } = supabase.storage.from(BUCKET).getPublicUrl(imagePath);
  const { data: ocrData } = supabase.storage.from(BUCKET).getPublicUrl(ocrPath);

  const res = await fetch(`${ocrData.publicUrl}?t=${Date.now()}`, { cache: "no-cache" });
  if (!res.ok) {
    throw new Error(`Failed to load OCR data for page ${pageMeta.index} (${res.status})`);
  }
  const ocrPayload = await res.json();

  return {
    page_index: pageMeta.index,
    width: pageMeta.width,
    height: pageMeta.height,
    image_url: imgData.publicUrl,
    paragraphs: ocrPayload.paragraphs || [],
  };
}
