import { fetchSentenceMapForMedia } from "@/api/sentence.api";
import type { RankingSource } from "@/lib/ankiExport";
import { ANKI_COL_SCHEMA_SQL, buildColMetadata } from "@/lib/ankiApkgSchema";
import {
  formatGlobalFrequency,
  formatLevelLabel,
  formatRankLabel,
  formatReadingLabel,
} from "@/lib/ankiFormat";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";

const BARE_CHAPTER_RE = /^(?:cap[ií]tulo|chapter|глава|chapitre|ep\.?|episode)\s*\d+\s*$/i;

function hashInt(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return (h >>> 0) % 900000000 + 100000000;
}

function escHtml(s: string | null | undefined): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r?\n/g, " ").trim();
}

function pickSentence(word: VocabularyWord, sentenceMap?: Record<string, string>): string {
  const mapped = sentenceMap?.[word.canonical_id];
  if (mapped) return mapped;
  const fallback = (word.first_context_snippet || "").trim();
  if (!fallback || BARE_CHAPTER_RE.test(fallback)) return "";
  return fallback;
}

export function apkgFilename(mediaTitle?: string, mediaItemId?: string): string {
  const base = (mediaTitle || "").normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "vocabulary";
  const shortId = (mediaItemId || "").replace(/[^a-z0-9]/gi, "").slice(0, 8);
  return `${[base, shortId].filter(Boolean).join("-")}-anki.apkg`;
}

export async function buildApkgBytes(
  words: VocabularyWord[],
  statusMap: Record<string, UserVocabStatus>,
  mediaTitle?: string,
  rankingSource: RankingSource = "tubelex_v2025",
  locateWasm?: (file: string) => string,
  sentenceMap?: Record<string, string>
): Promise<Uint8Array> {
  const [{ default: initSqlJs }, { default: JSZip }, { default: wasmUrl }] = await Promise.all([
    import("sql.js"),
    import("jszip"),
    import("sql.js/dist/sql-wasm.wasm?url"),
  ]);
  const SQL = await initSqlJs({ locateFile: locateWasm || (() => wasmUrl), useOldExtensionFunctions: false });
  const db = new SQL.Database();
  db.run(ANKI_COL_SCHEMA_SQL);

  const nowMs = Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  const deckName = mediaTitle ? `Threshold::${mediaTitle}` : "Threshold::Vocabulary";
  const deckId = hashInt(deckName);
  const modelId = 1710000001;
  const meta = buildColMetadata(deckId, modelId, deckName, nowSec);

  db.run("INSERT INTO col VALUES (1, ?, ?, ?, 11, 0, 0, 0, ?, ?, ?, ?, '{}')", [
    nowSec, nowMs, nowMs, meta.conf, meta.models, meta.decks, meta.dconf,
  ]);

  const noteStmt = db.prepare("INSERT INTO notes VALUES (?, ?, ?, ?, -1, ?, ?, ?, ?, 0, '')");
  const cardStmt = db.prepare("INSERT INTO cards VALUES (?, ?, ?, 0, ?, -1, 0, 0, ?, 0, 0, 0, 0, 0, 0, 0, 0, '')");

  words.forEach((word, idx) => {
    const nid = nowMs + idx;
    const guid = `thr-${word.canonical_id.slice(0, 12)}-${hashInt(deckName)}`;
    const defs = (word.definitions || []).map(escHtml).filter(Boolean).join("<br>");
    const src = mediaTitle ? `${escHtml(mediaTitle)} · #${word.first_occurrence_index}` : `#${word.first_occurrence_index}`;
    const flds = [
      escHtml(word.lemma),
      escHtml(formatReadingLabel(word)),
      escHtml(word.pos),
      escHtml(formatLevelLabel(word.cefr)),
      escHtml(formatRankLabel(word.rankings, rankingSource)),
      escHtml(formatGlobalFrequency(word.rankings, rankingSource)),
      escHtml(pickSentence(word, sentenceMap)),
      defs,
      src,
    ].join("\x1f");
    const status = statusMap[word.canonical_id] || "unknown";
    const levelTag = (word.cefr || "none").replace(/\s+/g, "_");
    const tags = ` threshold level::${levelTag} pos::${word.pos || "other"} status::${status} `;
    noteStmt.run([nid, guid, modelId, nowSec, tags, flds, escHtml(word.lemma), hashInt(word.lemma)]);
    cardStmt.run([nid + 1000000, nid, deckId, nowSec, idx + 1]);
  });

  noteStmt.free();
  cardStmt.free();
  const sqliteBytes = db.export();
  db.close();

  const zip = new JSZip();
  zip.file("collection.anki2", sqliteBytes);
  zip.file("media", "{}");
  return zip.generateAsync({ type: "uint8array" });
}

export async function downloadApkgDeck(
  words: VocabularyWord[],
  statusMap: Record<string, UserVocabStatus>,
  mediaTitle?: string,
  mediaItemId?: string,
  rankingSource: RankingSource = "tubelex_v2025"
): Promise<void> {
  const sentenceMap = mediaItemId ? await fetchSentenceMapForMedia(mediaItemId).catch(() => ({})) : undefined;
  const bytes = await buildApkgBytes(words, statusMap, mediaTitle, rankingSource, undefined, sentenceMap);
  const blob = new Blob([bytes as BlobPart], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = apkgFilename(mediaTitle, mediaItemId);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
