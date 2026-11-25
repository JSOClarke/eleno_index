import path from "node:path";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { apkgFilename, buildApkgBytes } from "../ankiApkgExport";
import type { VocabularyWord } from "@/types/vocabulary.types";

describe("ankiApkgExport", () => {
  it("builds a valid .apkg zip containing collection.anki2 and media", async () => {
    const sample: VocabularyWord[] = [
      {
        canonical_id: "11111111-2222-3333-4444-555555555555",
        lemma: "lechuza",
        pos: "NOUN",
        definitions: ["owl", "barn owl"],
        frequency: 3,
        first_occurrence_index: 1,
        first_timestamp_ms: null,
        first_context_snippet: "La gran lechuza parda volaba.",
        cefr: "A1",
        global_rank: 16364,
        ipa: "/leˈt͡ʃuθa/",
      },
    ];

    const wasmDir = path.resolve(process.cwd(), "node_modules/sql.js/dist");
    const bytes = await buildApkgBytes(sample, {}, "Harry Potter", "tubelex_v2025", (f) => path.join(wasmDir, f));
    const zip = await JSZip.loadAsync(bytes);

    expect(Object.keys(zip.files).sort()).toEqual(["collection.anki2", "media"]);
    expect(await zip.file("media")?.async("string")).toBe("{}");
    expect(apkgFilename("Harry Potter", "abcdef1234")).toBe("harry-potter-abcdef12-anki.apkg");
    expect(apkgFilename("Гарри Поттер", "19f7a410")).toBe("гарри-поттер-19f7a410-anki.apkg");
    expect(apkgFilename("肖申克的救赎", "4bf8022b")).toBe("肖申克的救赎-4bf8022b-anki.apkg");
  });

  it("supports Russian/Chinese rankings and replaces bare chapter snippets with sentenceMap", async () => {
    const ruWord: VocabularyWord = {
      canonical_id: "22222222-2222-3333-4444-555555555555",
      lemma: "книга",
      pos: "NOUN",
      definitions: ["book"],
      frequency: 12,
      first_occurrence_index: 1,
      first_timestamp_ms: null,
      first_context_snippet: "Capítulo 1",
      cefr: "TBU",
      global_rank: 420,
      rankings: [{ source: "opensubtitles_ru", rank: 420, count: 1000, cefr: null }],
      ipa: "[ˈknʲiɡə]",
    };
    const wasmDir = path.resolve(process.cwd(), "node_modules/sql.js/dist");
    const initSqlJs = (await import("sql.js")).default;
    const SQL = await initSqlJs({ locateFile: (f: string) => path.join(wasmDir, f), useOldExtensionFunctions: false });

    const bytes = await buildApkgBytes(
      [ruWord],
      {},
      "Гарри Поттер",
      "opensubtitles_ru",
      (f) => path.join(wasmDir, f),
      { [ruWord.canonical_id]: "Анна читала старую книгу." }
    );
    const zip = await JSZip.loadAsync(bytes);
    const dbBytes = await zip.file("collection.anki2")!.async("uint8array");
    const db = new SQL.Database(dbBytes);
    const row = db.exec("SELECT flds, tags FROM notes")[0].values[0];
    const flds = String(row[0]).split("\x1f");
    db.close();

    expect(flds[0]).toBe("книга");
    expect(flds[1]).toBe("IPA: [ˈknʲiɡə]");
    expect(flds[3]).toBe("TRKI TBU");
    expect(flds[4]).toBe("OpenSubtitles #420");
    expect(flds[5]).toBe("1,000");
    expect(flds[6]).toBe("Анна читала старую книгу.");
    expect(String(row[1])).toContain("level::TBU");
  });

  it("formats Chinese Pinyin reading, HSK level, TubeLex rank, and global frequency", async () => {
    const zhWord: VocabularyWord = {
      canonical_id: "33333333-2222-3333-4444-555555555555",
      lemma: "到了",
      pos: "VERB",
      definitions: ["to arrive"],
      frequency: 5,
      first_occurrence_index: 2,
      first_timestamp_ms: null,
      first_context_snippet: null,
      cefr: "HSK 6",
      global_rank: 2400,
      rankings: [{ source: "tubelex_v2025", rank: 2400, count: 48210, cefr: "HSK 6" }],
      ipa: null,
      reading: "Pinyin: dàoliǎo",
    };
    const wasmDir = path.resolve(process.cwd(), "node_modules/sql.js/dist");
    const initSqlJs = (await import("sql.js")).default;
    const SQL = await initSqlJs({ locateFile: (f: string) => path.join(wasmDir, f), useOldExtensionFunctions: false });

    const bytes = await buildApkgBytes([zhWord], {}, "活着", "tubelex_v2025", (f) => path.join(wasmDir, f));
    const zip = await JSZip.loadAsync(bytes);
    const db = new SQL.Database(await zip.file("collection.anki2")!.async("uint8array"));
    const flds = String(db.exec("SELECT flds FROM notes")[0].values[0][0]).split("\x1f");
    db.close();

    expect(flds[1]).toBe("Pinyin: dàoliǎo");
    expect(flds[3]).toBe("HSK 6");
    expect(flds[4]).toBe("TubeLex #2400");
    expect(flds[5]).toBe("48,210");
  });
});
