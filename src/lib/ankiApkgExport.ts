import type { RankingSource } from "@/lib/ankiExport";
import { ANKI_COL_SCHEMA_SQL, buildColMetadata } from "@/lib/ankiApkgSchema";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";

function hashInt(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return (h >>> 0) % 900000000 + 100000000;
}

function escHtml(s: string | null | undefined): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r?\n/g, " ").trim();
}

function rankFor(word: VocabularyWord, source: RankingSource): string {
  const entry = (word.rankings || []).find((r) =>
    source === "elelex_v2020"
      ? ["elelex_v2020", "flelex_v2020", "flelex_v1"].includes(r.source)
      : ["tubelex_v2025", "lexique383"].includes(r.source)
  );
  return entry?.rank != null ? String(entry.rank) : "";
}

export function apkgFilename(mediaTitle?: string, mediaItemId?: string): string {
  const base = (mediaTitle || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "vocabulary";
  const shortId = (mediaItemId || "").replace(/[^a-z0-9]/gi, "").slice(0, 8);
  return `${[base, shortId].filter(Boolean).join("-")}-anki.apkg`;
}

export async function buildApkgBytes(
  words: VocabularyWord[],
  statusMap: Record<string, UserVocabStatus>,
  mediaTitle?: string,
  rankingSource: RankingSource = "tubelex_v2025",
  locateWasm?: (file: string) => string
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
      escHtml(word.lemma), escHtml(word.ipa), escHtml(word.pos), escHtml(word.cefr),
      rankFor(word, rankingSource), escHtml(word.first_context_snippet), defs, src,
    ].join("\x1f");
    const status = statusMap[word.canonical_id] || "unknown";
    const tags = ` threshold cefr::${word.cefr || "none"} pos::${word.pos || "other"} status::${status} `;
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
  const bytes = await buildApkgBytes(words, statusMap, mediaTitle, rankingSource);
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
