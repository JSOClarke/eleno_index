import type { ComicPageData, ElenoComicManifest } from "@/types/comicReader.types";

const decoder = new TextDecoder();
let activeLocalPackage: {
  manifest: ElenoComicManifest;
  file: File;
  entries: Map<string, any>;
  urls: Map<number, string>;
} | null = null;

function safePath(path: string): string {
  const norm = path.replace(/\\/g, "/");
  if (norm.startsWith("/") || /^[a-z]:/i.test(norm) || norm.split("/").includes("..")) {
    throw new Error(`Unsafe archive path: ${path}`);
  }
  return norm;
}

async function readZipCentralDirectory(file: File) {
  const tailStart = Math.max(0, file.size - 65557);
  const tail = new Uint8Array(await file.slice(tailStart).arrayBuffer());
  const view = new DataView(tail.buffer, tail.byteOffset, tail.byteLength);
  let eocd = -1;
  for (let offset = tail.length - 22; offset >= 0; offset--) {
    if (view.getUint32(offset, true) === 0x06054b50) { eocd = offset; break; }
  }
  if (eocd < 0) throw new Error("Invalid ZIP file.");
  const count = view.getUint16(eocd + 10, true);
  const dirSize = view.getUint32(eocd + 12, true);
  const dirOffset = view.getUint32(eocd + 16, true);
  const bytes = new Uint8Array(await file.slice(dirOffset, dirOffset + dirSize).arrayBuffer());
  const entries = new Map();
  let offset = 0;
  for (let i = 0; i < count; i++) {
    const view2 = new DataView(bytes.buffer, bytes.byteOffset + offset, bytes.byteLength - offset);
    const method = view2.getUint16(10, true);
    const compSize = view2.getUint32(20, true);
    const uncompSize = view2.getUint32(24, true);
    const nameLen = view2.getUint16(28, true);
    const extraLen = view2.getUint16(30, true);
    const commLen = view2.getUint16(32, true);
    const localOff = view2.getUint32(42, true);
    const name = safePath(decoder.decode(bytes.slice(offset + 46, offset + 46 + nameLen)));
    entries.set(name, { name, method, compSize, uncompSize, localOff });
    offset += 46 + nameLen + extraLen + commLen;
  }
  return entries;
}

async function extractZipEntry(file: File, entry: any): Promise<Uint8Array> {
  const head = new DataView(await file.slice(entry.localOff, entry.localOff + 30).arrayBuffer());
  const start = entry.localOff + 30 + head.getUint16(26, true) + head.getUint16(28, true);
  const compressed = file.slice(start, start + entry.compSize);
  if (entry.method === 0) return new Uint8Array(await compressed.arrayBuffer());
  const ds = new DecompressionStream("deflate-raw");
  const stream = compressed.stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function loadLocalElenocbz(file: File): Promise<ElenoComicManifest> {
  const entries = await readZipCentralDirectory(file);
  const manifestEntry = entries.get("manifest.json");
  if (!manifestEntry) throw new Error("No manifest.json in package");
  const manifest = JSON.parse(decoder.decode(await extractZipEntry(file, manifestEntry)));
  manifest.media_item_id = "local";
  activeLocalPackage = { manifest, file, entries, urls: new Map() };
  return manifest;
}

export async function fetchLocalComicPage(pageIndex: number): Promise<ComicPageData> {
  if (!activeLocalPackage) throw new Error("No active local package");
  const { manifest, file, entries, urls } = activeLocalPackage;
  const pageMeta = manifest.pages.find((p) => p.index === pageIndex);
  if (!pageMeta) throw new Error(`Page ${pageIndex} not found`);

  let imgUrl = urls.get(pageIndex);
  if (!imgUrl) {
    const imgEntry = entries.get(safePath(pageMeta.image));
    if (!imgEntry) throw new Error(`Missing image for page ${pageIndex}`);
    const bytes = await extractZipEntry(file, imgEntry);
    imgUrl = URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" }));
    urls.set(pageIndex, imgUrl);
  }

  const ocrEntry = entries.get(safePath(pageMeta.ocr));
  if (!ocrEntry) throw new Error(`Missing OCR for page ${pageIndex}`);
  const ocrJson = JSON.parse(decoder.decode(await extractZipEntry(file, ocrEntry)));

  return {
    page_index: pageIndex,
    width: pageMeta.width,
    height: pageMeta.height,
    image_url: imgUrl,
    paragraphs: ocrJson.paragraphs || [],
  };
}
