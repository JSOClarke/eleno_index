import JSZip from "jszip";
import type { EpubBook, EpubChapter } from "@/types/epubReader.types";

function resolveZipPath(baseFile: string, rel: string): string {
  const cleanRel = rel.split("#")[0].trim();
  const baseParts = baseFile.split("/").slice(0, -1);
  for (const seg of cleanRel.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") baseParts.pop();
    else baseParts.push(seg);
  }
  return baseParts.join("/");
}

function getZipEntry(zip: JSZip, path: string): JSZip.JSZipObject | null {
  return zip.file(path) || zip.file(decodeURIComponent(path)) || null;
}

function extractParagraphs(xhtml: string): { title: string | null; paragraphs: string[] } {
  const doc = new DOMParser().parseFromString(xhtml, "text/html");
  const titleEl = doc.querySelector("h1, h2, h3, title");
  const title = titleEl?.textContent?.replace(/\s+/g, " ").trim() || null;
  const blocks: string[] = [];
  const candidates = doc.body?.querySelectorAll("p, h1, h2, h3, h4, li, blockquote") || [];
  candidates.forEach((el) => {
    if (el.closest("nav, header, footer")) return;
    if (el.querySelector("p, blockquote")) return;
    const text = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (text.length > 0) blocks.push(text);
  });
  if (blocks.length === 0 && doc.body) {
    const fallback = (doc.body.textContent || "").split(/\n+/).map((s) => s.trim()).filter(Boolean);
    blocks.push(...fallback);
  }
  return { title, paragraphs: blocks };
}

async function extractCoverDataUrl(zip: JSZip, opfDoc: Document, opfPath: string): Promise<string | null> {
  const manifestItems = Array.from(opfDoc.querySelectorAll("manifest > item"));
  const coverMeta = opfDoc.querySelector('meta[name="cover"]')?.getAttribute("content");
  const coverItem =
    manifestItems.find((el) => (el.getAttribute("properties") || "").includes("cover-image")) ||
    (coverMeta ? manifestItems.find((el) => el.getAttribute("id") === coverMeta) : null) ||
    manifestItems.find((el) => /cover/i.test(el.getAttribute("id") || "") && (el.getAttribute("media-type") || "").startsWith("image/"));

  const href = coverItem?.getAttribute("href");
  if (!href) return null;
  const entry = getZipEntry(zip, resolveZipPath(opfPath, href));
  if (!entry) return null;
  const mime = coverItem?.getAttribute("media-type") || "image/jpeg";
  const base64 = await entry.async("base64");
  return `data:${mime};base64,${base64}`;
}

export async function parseEpubFile(file: File | Blob, fileName = "Book.epub"): Promise<EpubBook> {
  const zip = await JSZip.loadAsync(file);
  const containerEntry = getZipEntry(zip, "META-INF/container.xml");
  if (!containerEntry) throw new Error("Invalid EPUB: missing META-INF/container.xml");

  const containerDoc = new DOMParser().parseFromString(await containerEntry.async("text"), "application/xml");
  const opfPath = containerDoc.querySelector("rootfile")?.getAttribute("full-path");
  if (!opfPath) throw new Error("Invalid EPUB: missing rootfile path");

  const opfEntry = getZipEntry(zip, opfPath);
  if (!opfEntry) throw new Error(`Invalid EPUB: missing ${opfPath}`);
  const opfDoc = new DOMParser().parseFromString(await opfEntry.async("text"), "application/xml");

  const title = opfDoc.querySelector("metadata title, dc\\:title")?.textContent?.trim() || fileName.replace(/\.epub$/i, "");
  const author = opfDoc.querySelector("metadata creator, dc\\:creator")?.textContent?.trim() || "Unknown Author";
  const rawLang = opfDoc.querySelector("metadata language, dc\\:language")?.textContent?.trim().toLowerCase() || "es";
  const language = rawLang.slice(0, 2) || "es";

  const manifestMap = new Map<string, { href: string; mediaType: string }>();
  opfDoc.querySelectorAll("manifest > item").forEach((item) => {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    if (id && href) manifestMap.set(id, { href, mediaType: item.getAttribute("media-type") || "" });
  });

  const spineRefs = Array.from(opfDoc.querySelectorAll("spine > itemref"))
    .map((ref) => ref.getAttribute("idref"))
    .filter((id): id is string => Boolean(id));

  const chapters: EpubChapter[] = [];
  for (const idref of spineRefs) {
    const item = manifestMap.get(idref);
    if (!item || !/html|xml/i.test(item.mediaType || item.href)) continue;
    const fullHref = resolveZipPath(opfPath, item.href);
    const entry = getZipEntry(zip, fullHref);
    if (!entry) continue;
    const { title: chTitle, paragraphs } = extractParagraphs(await entry.async("text"));
    if (paragraphs.length === 0) continue;
    chapters.push({
      index: chapters.length,
      id: idref,
      href: fullHref,
      title: chTitle || `Chapter ${chapters.length + 1}`,
      paragraphs,
    });
  }

  if (chapters.length === 0) throw new Error("No readable text chapters found in this EPUB.");

  const coverUrl = await extractCoverDataUrl(zip, opfDoc, opfPath);
  const id = `epub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return { id, title, author, language, coverUrl, chapterCount: chapters.length, addedAt: Date.now(), chapters };
}
